import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'

export default async function Rooms() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (!user) return redirect('/')

  const rooms = await prisma.room.findMany({
    include: {
      devices: true
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

  console.log(rooms[1])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium grow shrink-0">Moje Sale</h1>
        <Link
          href="/rooms/new"
          className="btn-primary w-min px-4 text-sm flex items-center gap-3 whitespace-nowrap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Dodać nową salę
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-6">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <Link
              href={`/rooms/${room.id}`}
              key={room.id}
              className="mb-2 border border-gray-200 p-4 rounded-2xl transition duration-200 hover:bg-[#f9fafd]"
            >
              <div className="flex mb-2 items-center">
                <h3 className="text-lg font-medium">
                  Sala {room.number}: {room.name}
                </h3>
                {room.devices.length > 0 && (
                  <div className="px-2 py-1 rounded-full bg-[#EBEAFA] text-[#514BAB] text-sm font-medium w-fit ml-auto">
                    Device podłączony
                  </div>
                )}
              </div>
              <p>{room.description}</p>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-24">
            <img
              src="/empty-state-devices1.png"
              alt="Empty State Illustration"
              className="w-[200px]"
            />
            <p className="font-medium">Brak sal</p>
          </div>
        )}
      </ul>
    </div>
  )
}
