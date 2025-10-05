'use server'

import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const notificationSchema = z.object({
  roomId: z.string().nonempty(),
  content: z.string().nonempty(),
  expiresAt: z.string().datetime({ local: true })
})

type NotificationInput = z.infer<typeof notificationSchema>

export async function deleteNotification(formData: FormData) {
  const roomId = formData.get('roomId')

  if (!roomId || typeof roomId !== 'string') {
    throw new Error('Room not found')
  }

  const notificationId = formData.get('notificationId')

  if (!notificationId || typeof notificationId !== 'string') {
    throw new Error('Invalid room ID')
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  })

  await prisma.room.update({
    data: {
      updatedAt: new Date()
    },
    where: { id: parseInt(roomId) }
  })

  redirect(`/dashboard`)
}

export async function addNotification(initialState: any, formData: FormData) {
  const parsed = notificationSchema.safeParse({
    roomId: formData.get('roomId'),
    content: formData.get('content'),
    expiresAt: formData.get('expiresAt')
  })

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors
    }
  }

  const data: NotificationInput = parsed.data
  const roomId = parseInt(data.roomId)

  await prisma.notification.create({
    data: {
      content: data.content,
      expiresAt: new Date(Date.parse(data.expiresAt)).toISOString(),

      room: {
        connect: {
          id: roomId
        }
      }
    }
  })

  await prisma.room.update({
    data: {
      updatedAt: new Date()
    },
    where: { id: roomId }
  })

  redirect(`/dashboard`)
}

export async function toggleTimetable(formData: FormData) {
  const timetableId = formData.get('timetableId')

  if (!timetableId || typeof timetableId !== 'string') {
    throw new Error('Invalid timetable ID')
  }

  const timetable = await prisma.timetable.findUnique({
    where: {
      id: timetableId
    }
  })

  if (!timetable) return notFound()

  await prisma.timetable.update({
    where: { id: timetableId },
    data: {
      cancelled: !timetable.cancelled
    }
  })

  redirect(`/rooms/${timetable.roomId}`)
}
