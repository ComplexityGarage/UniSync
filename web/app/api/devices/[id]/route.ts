import {
  format,
  subDays,
  addDays,
  differenceInCalendarDays,
  startOfToday
} from 'date-fns'
import { pl } from 'date-fns/locale'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import {
  Device,
  Reservation,
  ReservationStatus,
  Room,
  Timetable
} from '@prisma/client'

const capitalize = (string: String) => {
  return string
    ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
    : ''
}

const unicodeSafeTruncate = (str: string, maxSegments = 30, suffix = '...') => {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  const segments = [...segmenter.segment(str)]

  if (segments.length <= maxSegments) return str

  return (
    segments
      .slice(0, maxSegments)
      .map((s) => s.segment)
      .join('') + suffix
  )
}

const getClassesByDay = (
  day: Date,
  roomClasses: Timetable[],
  reservations: Reservation[]
) => {
  const timetables = roomClasses
    .filter((cl) => {
      return differenceInCalendarDays(cl.startTime, day) == 0
    })
    .map((cl) => ({
      start_time: cl.startTime,
      end_time: cl.endTime,
      name: {
        pl: unicodeSafeTruncate(cl.name, 24),
        en: cl.nameEn
      },
      cancelled: cl.cancelled
    }))

  const reservationTimetables = reservations
    .filter((cl) => {
      return differenceInCalendarDays(cl.startTime, day) == 0
    })
    .map((cl) => ({
      start_time: cl.startTime,
      end_time: cl.endTime,
      name: {
        pl: 'Rezerwacja',
        en: 'Reservation'
      },
      cancelled: false
    }))

  return [...timetables, ...reservationTimetables]
}

const getCalendar = (roomClasses: Timetable[], reservations: Reservation[]) => {
  const today = new Date()
  const prev = subDays(today, 1)
  const next = addDays(today, 1)

  return {
    prev: {
      name: capitalize(format(prev, 'EEEEEE', { locale: pl })),
      day: format(prev, 'dd'),
      classes: getClassesByDay(prev, roomClasses, reservations)
    },
    current: {
      name: capitalize(format(today, 'EEEEEE', { locale: pl })),
      day: format(today, 'dd'),
      classes: getClassesByDay(today, roomClasses, reservations)
    },
    next: {
      name: capitalize(format(next, 'EEEEEE', { locale: pl })),
      day: format(next, 'dd'),
      classes: getClassesByDay(next, roomClasses, reservations)
    }
  }
}

function getLastUpdatedTimestamp(
  room: Room,
  roomClasses: Timetable[],
  reservations: Reservation[]
) {
  const timestamps = [...roomClasses, ...reservations].map((el) =>
    Math.floor(el.updatedAt.getTime() / 1000)
  )

  timestamps.push(Math.floor(room.updatedAt.getTime() / 1000))
  timestamps.push(Math.floor(startOfToday().getTime() / 1000))

  return Math.max(...timestamps)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const device = await prisma.device.findUnique({
    where: {
      id
    }
  })

  if (!device) {
    return notFound()
  }

  const room = await prisma.room.findUnique({
    where: {
      id: device.roomId
    },
    include: {
      notifications: {
        where: {
          expiresAt: {
            gt: new Date().toISOString()
          }
        }
      }
    }
  })

  if (!room) {
    return notFound()
  }

  const roomClasses = await prisma.timetable.findMany({
    where: {
      roomId: room.id
    }
  })

  const reservations = await prisma.reservation.findMany({
    where: {
      roomId: room.id,
      status: ReservationStatus.APPROVED
    }
  })

  await prisma.deviceSyncLog.create({
    data: {
      deviceId: device.id
    }
  })

  return Response.json({
    room_title: room.number,
    room_subtitle: room.name,
    room_description: room.description,
    calendar: getCalendar(roomClasses, reservations),
    notification: room.notifications.length
      ? room.notifications[0].content
      : '',
    template: device.template,
    sync_interval: device.syncInterval,
    room_link: room.enableReservations
      ? `https://unisync.codeseals.dev/rooms/${room.id}/reservations/new`
      : room.link,
    room_link_label: room.enableReservations ? 'Rezerwacja' : 'Link',
    last_updated_at: getLastUpdatedTimestamp(room, roomClasses, reservations)
  })
}
