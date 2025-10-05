'use server'

import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { syncClasses, syncRoomData } from '../../../services/rooms'

const roomSchema = z.object({
  name: z.string().min(3),
  description: z.string().nullable(),
  link: z.string().nullable(),
  enableReservations: z.boolean().optional(),
  usos_id: z.number()
})

type RoomInput = z.infer<typeof roomSchema>

const notificationSchema = z.object({
  content: z.string(),
  expiresAt: z.string()
})

type NotificationInput = z.infer<typeof notificationSchema>


const timetableSchema = z.object({
  name: z.string(),
  startTime: z.string(),
  endTime: z.string()
})

type TimetableInput = z.infer<typeof timetableSchema>

export async function createRoom(formData: FormData) {
  console.log(formData)
  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    enableReservations: formData.get('enableReservations') == 'true',
    link: formData.get('link'),
    usos_id: +(formData.get('usosId') || 0)
  }

  const parsed = roomSchema.safeParse(raw)

  if (!parsed.success) {
    throw new Error('Validation failed')
  }

  const data: RoomInput = parsed.data

  const room = await prisma.room.create({
    data
  })

  await syncRoomData(room)
  await syncClasses(room)

  redirect(`/rooms/${room.id}`)
}

export async function updateRoom(formData: FormData) {
  const roomId = formData.get('roomId')

  if (!roomId || typeof roomId !== 'string') {
    throw new Error('Room not found')
  }

  const room = await prisma.room.findUnique({
    where: {
      id: parseInt(roomId)
    }
  })

  if (!room) {
    throw new Error('Room not found')
  }

  const raw = {
    name: formData.get('name'),
    enableReservations: formData.get('enableReservations') == 'true',
    link: formData.get('link'),
    description: formData.get('description'),
    usos_id: room.usos_id
  }

  const parsed = roomSchema.safeParse(raw)

  if (!parsed.success) {
    throw new Error('Validation error')
  }

  const data: RoomInput = parsed.data

  await prisma.room.update({
    where: {
      id: parseInt(roomId)
    },
    data
  })

  await syncRoomData(room)

  redirect(`/rooms/${room.id}`)
}

export async function deleteRoom(formData: FormData) {
  const roomId = formData.get('roomId')

  if (!roomId || typeof roomId !== 'string') {
    throw new Error('Invalid room ID')
  }

  await prisma.room.delete({
    where: { id: parseInt(roomId) }
  })

  redirect(`/rooms`)
}

export async function deleteNotification(formData: FormData) {
  const roomId = formData.get('roomId')
  const notificationId = formData.get('notificationId')

  if (!notificationId || typeof notificationId !== 'string') {
    throw new Error('Invalid room ID')
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  })

  redirect(`/rooms/${roomId}`)
}

export async function addNotification(formData: FormData) {
  const roomId = formData.get('roomId')

  if (!roomId || typeof roomId !== 'string') {
    throw new Error('Invalid room ID')
  }

  const parsed = notificationSchema.safeParse({
    content: formData.get('content'),
    expiresAt: formData.get('expiresAt')
  })

  if (!parsed.success) {
    throw new Error('Validation Error')
  }

  const data: NotificationInput = parsed.data

  await prisma.notification.create({
    data: {
      content: data.content,
      expiresAt: new Date(Date.parse(data.expiresAt)).toISOString(),

      room: {
        connect: {
          id: parseInt(roomId)
        }
      }
    }
  })

  redirect(`/rooms/${roomId}`)
}

export async function addTimetable(formData: FormData) {
  const roomId = formData.get('roomId')

  if (!roomId || typeof roomId !== 'string') {
    throw new Error('Invalid room ID')
  }

  const parsed = timetableSchema.safeParse({
    name: formData.get('name'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
  })

  if (!parsed.success) {
    throw new Error('Validation Error')
  }

  const data: TimetableInput = parsed.data

  await prisma.timetable.create({
    data: {
      name: data.name,
      nameEn: data.name,
      startTime: new Date(Date.parse(data.startTime)).toISOString(),
      endTime: new Date(Date.parse(data.endTime)).toISOString(),

      room: {
        connect: {
          id: parseInt(roomId)
        }
      }
    }
  })

  redirect(`/rooms/${roomId}`)
}
