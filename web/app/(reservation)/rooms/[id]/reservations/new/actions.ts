'use server'

import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const reservationSchema = z.object({
  name: z.string(),
  email: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  purpose: z.string().nullable()
})

type ReservationInput = z.infer<typeof reservationSchema>

export async function createReservation(formData: FormData) {
  const roomId = formData.get('roomId')

  if (!roomId || typeof roomId !== 'string') {
    throw new Error('Invalid room ID')
  }

  const parsed = reservationSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    purpose: formData.get('purpose')
  })

  if (!parsed.success) {
    throw new Error('Validation Error')
  }

  const data: ReservationInput = parsed.data

  const reservation = await prisma.reservation.create({
    data: {
      name: data.name,
      email: data.email,
      purpose: data.purpose,
      startTime: new Date(Date.parse(data.startTime)).toISOString(),
      endTime: new Date(Date.parse(data.endTime)).toISOString(),

      room: {
        connect: {
          id: parseInt(roomId)
        }
      }
    }
  })

  redirect(`/rooms/${roomId}/reservations/${reservation.id}`)
}
