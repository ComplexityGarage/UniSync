import Link from 'next/link'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Form from 'next/form'
import { addTimetable, deleteNotification, deleteRoom } from '../actions'
import Classes from '@/app/components/rooms/Classes'
import Devices from '@/app/components/rooms/Devices'

export default async function Room({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: roomID } = await params

  const room = await prisma.room.findUnique({
    where: {
      id: parseInt(roomID)
    },
    include: {
      notifications: {
        where: {
          expiresAt: {
            gt: new Date().toISOString()
          }
        }
      },
      devices: true
    }
  })

  if (!room) {
    return notFound()
  }

  const roomClasses = await prisma.timetable.findMany({
    where: {
      roomId: room.id
    }
  })

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-xs mb-8">
        <a
          href="/rooms"
          className="mb-4 text-[#898989] text-sm flex items-center gap-2 hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Moje Sale
        </a>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-medium grow shrink-0">
            Sala {room.number}
          </h1>
          <Link
            href={`/rooms/${roomID}/edit`}
            className="btn-primary w-min px-4 text-sm flex items-center gap-3 whitespace-nowrap mr-4 border border-primary"
          >
            Edytuj salę
          </Link>

          <Form action={deleteRoom}>
            <input type="hidden" name="roomId" value={room.id} />
            <button className="btn-outline-red  w-min px-4 text-sm whitespace-nowrap">
              Delete Room
            </button>
          </Form>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <dt className="font-medium">Nazwa</dt>
          <dd>{room.name}</dd>
          <dt className="font-medium">Numer</dt>
          <dd>{room.number}</dd>
          <dt className="font-medium">Opis</dt>
          <dd>{room.description}</dd>
          <dt className="font-medium">Usos ID</dt>
          <dd>{room.usos_id}</dd>
        </dl>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-xs mb-8">
        <h2 className="text-lg font-medium mb-5">Zajęcia w sali</h2>
        {roomClasses.length > 0 ? (
          <Classes room={room} timetables={roomClasses} />
        ) : (
          ''
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-xs mb-8">
        <h2 className="text-lg font-medium mb-5">Dodać zajęcie</h2>

        <Form action={addTimetable}>
          <input type="hidden" name="roomId" value={room.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Ważne od</label>
              <input
                name="startTime"
                type="datetime-local"
                className="form-control"
                placeholder="Expires At"
              />
            </div>

            <div>
              <label className="block mb-1">Ważne do</label>
              <input
                name="endTime"
                type="datetime-local"
                className="form-control"
                placeholder="Expires At"
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-1">Nazwa</label>
              <input name="name" className="form-control" placeholder="Nazwa" />
            </div>
            <div className="col-span-2">
              <button type="submit" className="btn-primary w-full">
                Dodać
              </button>
            </div>
          </div>
        </Form>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-xs mb-8">
        <h2 className="text-lg font-medium mb-5">Urządzenia w sali</h2>
        <Devices devices={room.devices} />
      </div>
    </>
  )
}
