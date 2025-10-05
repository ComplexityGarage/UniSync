import prisma from '@/lib/prisma'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { ReservationStatus, Role } from '@prisma/client'
import { setReservationStatus } from './actions'
import Form from 'next/form'

export default async function Reservations() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
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

  const pendingReservations = await prisma.reservation.findMany({
    include: {
      room: true
    },
    where: {
      isAccepted: false,
      endTime: {
        gte: new Date()
      },
      roomId: {
        in: rooms.map((room) => room.id)
      }
    }
  })

  const approvedReservations = await prisma.reservation.findMany({
    include: {
      room: true
    },
    where: {
      isAccepted: true,
      endTime: {
        gte: new Date()
      },
      roomId: {
        in: rooms.map((room) => room.id)
      }
    }
  })

  const getStatusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium grow shrink-0">Rezerwacje</h1>
      </div>

      {pendingReservations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-medium grow shrink-0 mb-6">
            Prośby o rezerwację
          </h2>
          {pendingReservations.map((reservation, index) => (
            <div
              key={`p${reservation.id}`}
              className="grid grid-cols-12 pb-4 items-center border border-gray-200 rounded-lg p-3"
            >
              <div className="col-span-3">
                <p className="font-medium">{reservation.name}</p>
                <p className="text-sm text-[#5F6265]">{reservation.email}</p>
              </div>
              <div className="col-span-2">
                <Link
                  href={`/rooms/${reservation.room.id}`}
                  className="link_tag"
                >
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
                {reservation.startTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Warsaw'
                })}{' '}
                -{' '}
                {reservation.endTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Europe/Warsaw'
                })}
                , {format(reservation.startTime, 'd LLL, yyyy', { locale: pl })}
              </div>

              <div className="col-span-1">
                <div
                  className={`px-2 py-1 rounded-full uppercase text-xs font-medium w-min ${getStatusClasses(
                    reservation.status
                  )}`}
                >
                  {reservation.status}
                </div>
              </div>

              <div className="col-span-3 capitalize flex gap-2 justify-end">
                {reservation.status == ReservationStatus.PENDING ? (
                  <Form action={setReservationStatus}>
                    <input
                      type="hidden"
                      name="reservationId"
                      value={reservation.id}
                    />
                    <input
                      type="hidden"
                      name="status"
                      value={ReservationStatus.APPROVED}
                    />
                    <button type="submit" className="btn-outline-sm">
                      Przyjmij
                    </button>
                  </Form>
                ) : (
                  ''
                )}

                {reservation.status != ReservationStatus.CANCELLED ? (
                  <Form action={setReservationStatus}>
                    <input
                      type="hidden"
                      name="reservationId"
                      value={reservation.id}
                    />
                    <input
                      type="hidden"
                      name="status"
                      value={ReservationStatus.CANCELLED}
                    />
                    <button type="submit" className="btn-outline-sm">
                      Odrzuć
                    </button>
                  </Form>
                ) : (
                  ''
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-medium grow shrink-0 mb-6">
        Historia rezerwacji
      </h2>

      {approvedReservations.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  ID
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Imię i nazwisko
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Email
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Cel
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Sala
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation, index) => (
                <tr key={index}>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">
                    {index + 1}
                  </td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">
                    {reservation.name}
                  </td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">
                    {reservation.email}
                  </td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">
                    {reservation.purpose}
                  </td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">
                    <Link
                      href={`/rooms/${reservation.room.id}`}
                      className="link_tag"
                    >
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
                  </td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm capitalize">
                    {reservation.startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Europe/Warsaw'
                    })}{' '}
                    -{' '}
                    {reservation.endTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Europe/Warsaw'
                    })}
                    ,{' '}
                    {format(reservation.startTime, 'd LLL, yyyy', {
                      locale: pl
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-24">
          <img
            src="/empty-state-devices1.png"
            alt="Empty State Illustration"
            className="w-[200px]"
          />
          <p className="font-medium">Brak rezerwacji</p>
        </div>
      )}
    </div>
  )
}
