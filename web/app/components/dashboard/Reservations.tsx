import Link from 'next/link'
import { Reservation } from '@prisma/client'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function Reservations({ reservations }: { resereservationsrvatoins: Reservation[] }) {
  return (
    <div className="shadow-xs rounded-2xl p-4 bg-white">
      <h2 className="text-lg font-medium mb-6">Prośby o rezerwację</h2>

      <div className="flex flex-col divide-y divide-gray-200 gap-4">
        {reservations.map((reservation, index) => (
          <div key={reservation.id} className="grid grid-cols-12 pb-4 items-center">
            <div className="col-span-4">
              <p className="font-medium">{reservation.name}</p>
              <p className="text-sm text-[#5F6265]">{reservation.email}</p>
            </div>
            <div className="col-span-3">
              <Link href={`/rooms/${reservation.room.id}`} className="link_tag">
                Sala {reservation.room.number}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5 rotate-125"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </Link>
            </div>

            <div className="col-span-3 capitalize">
              {reservation.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })} -{' '}
              {reservation.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })}
              , {format(reservation.startTime, 'd LLL, yyyy', { locale: pl })}
            </div>

            <div className="col-span-1 flex justify-end">
              <Link href={`/reservations`} className="link_tag">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5 rotate-125"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
