import { notFound } from 'next/navigation'
import { updateDevice } from '../../actions'
import Form from 'next/form'
import prisma from '@/lib/prisma'

export default async function EditDevice({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const device = await prisma.device.findUnique({
    where: {
      id
    }
  })

  if (!device) {
    return notFound()
  }

  const rooms = await prisma.room.findMany()

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs min-h-full">
      <a
        href="/devices"
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
        Urządzenia
      </a>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium grow shrink-0">
          Edycja {device.name}
        </h1>
      </div>
      <Form action={updateDevice} className="mt-5">
        <div className="grid grid-cols-1 gap-6">
          <input type="hidden" name="deviceId" value={device.id} />

          <div>
            <label className="block mb-1">Nazwa</label>
            <input
              name="name"
              className="form-control"
              placeholder="Nazwa"
              defaultValue={device.name}
            />
          </div>

          <div>
            <label className="block mb-1">Szablon</label>
            <p className="mb-3 text-sm text-[#5F6265]">
              Szablon definiuje liczbę dni widocznych na ekranie
            </p>
            <div className="flex items-center gap-6">
              <label className="template-radio flex rounded cursor-pointer transition duration-200 group hover:outline-4 outline-[#EFEDFF]">
                <input
                  type="radio"
                  name="template"
                  value="1"
                  defaultChecked={device.template === 1}
                />
                <span className="template-radio__example block rounded overflow-hidden border border-gray-200 p-1 bg-white">
                  <img src="/template-1.svg" />
                </span>
              </label>
              <label className="template-radio flex rounded cursor-pointer transition duration-200 group hover:outline-4 outline-[#EFEDFF]">
                <input
                  type="radio"
                  name="template"
                  value="2"
                  defaultChecked={device.template === 2}
                />
                <span className="template-radio__example block rounded overflow-hidden border border-gray-200 p-1 bg-white">
                  <img src="/template-2.svg" />
                </span>
              </label>
              <label className="template-radio flex rounded cursor-pointer transition duration-200 group hover:outline-4 outline-[#EFEDFF]">
                <input
                  type="radio"
                  name="template"
                  value="3"
                  defaultChecked={device.template === 3}
                />
                <span className="template-radio__example block rounded overflow-hidden border border-gray-200 p-1 bg-white">
                  <img src="/template-3.svg" />
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1">Sala</label>
            <select
              name="roomId"
              className="form-control"
              defaultValue={device.roomId}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Interwał aktualizacji</label>
            <select
              name="syncInterval"
              className="form-control"
              defaultValue={device.syncInterval}
            >
              <option value="30">
                Co 30 sekund
              </option>
               <option value="60">
                Co minutę
              </option>
               <option value="300">
                Co 5 minut
              </option>
               <option value="3600">
                Co godzinę
              </option>
            </select>
          </div>
          
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <a href="/devices" className="btn-outline-red">
              Anuluj
            </a>
            <button type="submit" className="btn-primary">
              Zapisz
            </button>
          </div>
        </div>
      </Form>
    </div>
  )
}
