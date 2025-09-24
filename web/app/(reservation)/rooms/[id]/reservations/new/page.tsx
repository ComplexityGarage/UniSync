import { notFound } from 'next/navigation'
import Form from 'next/form'
import prisma from '@/lib/prisma'
import { createReservation } from './actions'

export default async function ReservationForm({
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

  const submitForm = () => {}

  return (
    <>
      <h1 className="text-2xl font-medium text-center mb-4">Zarezerwować</h1>
      <p className="text-center mb-6 text-[#5F6265]">
        Aby wysłać wniosek o rezerwację sali {room.number}, wypełnij ten
        formularz. Kiedy wniosek zostanie zatwierdzony, otrzymasz powiadomienie
        na e-mail.
      </p>

      <Form action={createReservation} className="mt-5">
        <div className="grid grid-cols-1 gap-6">
          <input type="hidden" name="roomId" value={room.id} />

          <div>
            <label className="block mb-1">Imię i nazwisko</label>
            <input
              name="name"
              className="form-control"
              placeholder="Imię i nazwisko"
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="vicky@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1">Od</label>
              <input
                name="startTime"
                type="datetime-local"
                className="form-control"
                step="1800"
              />
            </div>
            <div>
              <label className="block mb-1">Do</label>
              <input
                name="endTime"
                type="datetime-local"
                className="form-control"
                step="1800"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Cel</label>
            <input
              name="purpose"
              className="form-control h-16"
              placeholder="Cel"
            />
          </div>

          <div>
            <button type="submit" className="mt-6 btn-primary w-full">
              Zarezerwować
            </button>
          </div>
        </div>
      </Form>
    </>
  )
}
