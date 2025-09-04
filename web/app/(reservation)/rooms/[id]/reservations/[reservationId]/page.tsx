import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function ReservationForm({
  params
}: {
  params: Promise<{ reservationId: string }>
}) {
  console.log(await params)
  const { reservationId } = await params

  const reservation = await prisma.reservation.findUnique({
    where: {
      id: reservationId
    }
  })

  if (!reservation) {
    return notFound()
  }

  return (
    <div className="p-4 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-16 mb-8 text-primary">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>

      <h1 className="text-2xl font-medium text-center mb-4">
        Rezerwacja {reservation.startTime.toLocaleString()}
      </h1>

      <div>Status: {reservation.isAccepted ? 'Zaakceptowano' : 'Czeka na zatwierdzenie'}</div>
    </div>
  )
}
