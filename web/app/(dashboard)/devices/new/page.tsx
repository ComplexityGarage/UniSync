import prisma from '@/lib/prisma'
import { createDevice } from '../actions'
import Form from 'next/form'

export default async function NewDevice() {
  const rooms = await prisma.room.findMany()

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs min-h-full">
      <a href="/devices" className="mb-4 text-[#898989] text-sm flex items-center gap-2 hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Urządzenia
      </a>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium grow shrink-0">Nowe urządzenie</h1>
      </div>

      <Form action={createDevice} className="mt-5">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block mb-1">Nazwa</label>
            <input name="name" className="form-control" placeholder="Nazwa" />
          </div>

          <div>
            <label className="block mb-1">Szablon</label>
            <p className="mb-3 text-sm text-[#5F6265]">Szablon definiuje liczbę dni widocznych na ekranie</p>
            <div className="flex items-center gap-6">
              <label className="template-radio flex rounded cursor-pointer transition duration-200 group hover:outline-4 outline-[#EFEDFF]">
                <input type="radio" name="template" value="1"/>
                <span className="template-radio__example block rounded overflow-hidden border border-gray-200 p-1 bg-white">
                  <img src="/template-1.svg"/>
                </span>
              </label>
              <label className="template-radio flex rounded cursor-pointer transition duration-200 group hover:outline-4 outline-[#EFEDFF]">
                <input type="radio" name="template" value="2"/>
                <span className="template-radio__example block rounded overflow-hidden border border-gray-200 p-1 bg-white">
                  <img src="/template-2.svg"/>
                </span>
              </label>
              <label className="template-radio flex rounded cursor-pointer transition duration-200 group hover:outline-4 outline-[#EFEDFF]">
                <input type="radio" name="template" value="3"/>
                <span className="template-radio__example block rounded overflow-hidden border border-gray-200 p-1 bg-white">
                  <img src="/template-3.svg"/>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1">Sala</label>
            <select name="roomId" className="form-control">
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.number}</option>
              ))}
            </select>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <a href="/devices" className="btn-outline-red">Anuluj</a>
            <button type="submit" className="btn-primary">
              Zapisz
            </button>
          </div>
        </div>
      </Form>
    </div>
  )
}
