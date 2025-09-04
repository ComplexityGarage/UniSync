'use server'

import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ReservationStatus } from '@prisma/client'

export async function setReservationStatus(formData: FormData) {
  const reservationId = formData.get('reservationId')

  if (!reservationId || typeof reservationId !== 'string') {
    throw new Error('Invalid reservation ID')
  }

  await prisma.reservation.update({
    where: {
      id: reservationId
    },
    data: {
      status:
        (formData.get('status') as ReservationStatus) ||
        ReservationStatus.PENDING
    }
  })

  redirect(`/reservations`)
}
