import { notFound } from 'next/navigation'
import { updateRoom } from '../../actions'
import Form from 'next/form'
import prisma from '@/lib/prisma'

export default async function EditRoom({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const room = await prisma.room.findUnique({
    where: {
      id: parseInt(id)
    }
  })

  if (!room) {
    return notFound()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs min-h-full">
      <a href="/rooms" className="mb-4 text-[#898989] text-sm flex items-center gap-2 hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Moje Sale
      </a>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium grow shrink-0">Edycja salę {room.name}</h1>
      </div>
      <Form action={updateRoom} className="mt-5">
        <div className="grid grid-cols-1 gap-6">
          <input type="hidden" name="roomId" value={room.id} />

          <div>
            <label className="block mb-1">Nazwa</label>
            <input name="name" className="form-control" placeholder="Nazwa" defaultValue={room.name} />
          </div>
          <div>
            <label className="block mb-1">Opis</label>
            <textarea
              name="description"
              className="form-control h-24"
              placeholder="Opis"
              defaultValue={room.description}
            />
          </div>

          <div>
            <label className="block mb-1">Link</label>
            <input name="link" className="form-control" placeholder="https://facebook.com" defaultValue={room.link} />
          </div>

          <div>
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="enableReservations"
                value="true"
                className="w-0 h-0 opacity-0"
                defaultChecked={room.enableReservations}
              />
              Enable Reservations
              <span className="custom-checkbox"><span></span></span>
            </label>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <a href="/rooms" className="btn-outline-red">Anuluj</a>
            <button type="submit" className="btn-primary">
              Zapisz
            </button>
          </div>
        </div>
      </Form>
    </div>
  )
}
