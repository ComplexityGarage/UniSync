import { auth } from '../../../lib/auth'
import Notifications from '@/app/components/dashboard/Notifications'
import NewNotification from '@/app/components/dashboard/NewNotification'
import Classes from '@/app/components/dashboard/Classes'
import Reservations from '@/app/components/dashboard/Reservations'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'
import { startOfWeek, endOfWeek } from 'date-fns'

export default async function Dashboard() {
  const session = await auth()

  if (!session || !session.user) {
    return redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (!user) return redirect('/')

  const rooms = await prisma.room.findMany({
    include: {
      devices: {
        include: {
          syncLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    },
    where:
      user.role == Role.ADMIN
        ? {}
        : {
            usos_id: {
              in: user.roomIds
            }
          }
  })

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const timetables = await prisma.timetable.findMany({
    include: {
      room: true
    },
    where: {
      lecturerIds: {
        array_contains: user.usosId
      },
      startTime: { gte: weekStart },
      endTime: { lte: weekEnd }
    }
  })

  const reservations = await prisma.reservation.findMany({
    include: {
      room: true
    },
    where: {
      roomId: {
        in: rooms.map((room) => room.id)
      },
      endTime: {
        gte: new Date()
      }
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">
        Dzień dobry, {session.user.name}
      </h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="shadow-xs rounded-2xl p-4 bg-white grid grid-cols-2">
          <NewNotification />
          <Notifications />
        </div>

        {timetables.length > 0 ? <Classes timetables={timetables} /> : ''}
        {reservations.length > 0 ? (
          <Reservations reservations={reservations} />
        ) : (
          ''
        )}
      </div>
    </div>
  )
}
