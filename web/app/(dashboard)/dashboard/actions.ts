'use server'

import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const notificationSchema = z.object({
  content: z.string(),
  expiresAt: z.string()
})

type NotificationInput = z.infer<typeof notificationSchema>

export async function deleteNotification(formData: FormData) {
  const roomId = formData.get('roomId')
  const notificationId = formData.get('notificationId')

  if (!notificationId || typeof notificationId !== 'string') {
    throw new Error('Invalid room ID')
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  })

  redirect(`/dashboard`)
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

  redirect(`/dashboard`)
}
