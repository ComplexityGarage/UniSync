import prisma from '@/lib/prisma'
import Form from 'next/form'
import Link from 'next/link'
import { deleteDevice } from './actions'

export default async function Devices() {
  const devices = await prisma.device.findMany({
    include: {
      room: true,
    }
  })

  const getStatusClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'problem':
        return 'bg-yellow-100 text-yellow-800'
      case 'working':
        return 'bg-green-100 text-green-800'
      case 'down':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSyncStatus = (lastSyncAt: Date): 'working' | 'problem' | 'down' | 'pending' => {
    if (!lastSyncAt) {
      return 'pending'
    }
    
    const now = new Date()
    const diffInMs = now.getTime() - lastSyncAt.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)

    if (diffInHours > 24) {
      return 'down'
    } else if (diffInHours > 2) {
      return 'problem'
    } else {
      return 'working'
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium grow shrink-0">Urządzenia</h1>
        <Link
          href="/devices/new"
          className="btn-primary w-min px-4 text-sm flex items-center gap-3 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Dodaj nowe urządzenie
        </Link>
      </div>
      {devices.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">ID</th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">Nazwa</th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">Status</th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">Sala</th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">{device.id}</td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">{device.name}</td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">
                    <div className={`px-2 py-1 rounded-full uppercase text-xs font-medium w-min ${getStatusClasses(getSyncStatus(device.lastSyncAt))}`}>
                      {getSyncStatus(device.lastSyncAt)}
                    </div>
                    <div>
                      {device.lastSyncAt?.toLocaleString()}
                    </div>
                  </td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">{device.room.number}</td>
                  <td className="border-b border-gray-200 py-2 px-4 text-sm">
                    <div className="flex gap-4 justify-end">
                      <Link href={`/devices/${device.id}`} className="btn-outline-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </Link>
                      <Link href={`/devices/${device.id}/edit`} className="btn-outline-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                      <Form action={deleteDevice}>
                        <input type="hidden" name="deviceId" value={device.id} />
                        <button className="btn-outline-sm">
                          <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                            <path d="M12.7833 7.99995L12.495 15.4999M8.505 15.4999L8.21667 7.99995M16.5233 5.32495C16.8083 5.36828 17.0917 5.41411 17.375 5.46328M16.5233 5.32578L15.6333 16.8941C15.597 17.3651 15.3842 17.8051 15.0375 18.126C14.6908 18.4469 14.2358 18.6251 13.7633 18.6249H7.23667C6.76425 18.6251 6.30919 18.4469 5.96248 18.126C5.61578 17.8051 5.40299 17.3651 5.36667 16.8941L4.47667 5.32495M16.5233 5.32495C15.5616 5.17954 14.5948 5.06919 13.625 4.99411M3.625 5.46245C3.90833 5.41328 4.19167 5.36745 4.47667 5.32495M4.47667 5.32495C5.43844 5.17955 6.4052 5.06919 7.375 4.99411M13.625 4.99411V4.23078C13.625 3.24745 12.8667 2.42745 11.8833 2.39661C10.9613 2.36714 10.0387 2.36714 9.11667 2.39661C8.13333 2.42745 7.375 3.24828 7.375 4.23078V4.99411M13.625 4.99411C11.5448 4.83334 9.45523 4.83334 7.375 4.99411" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-24">
          <img src="/empty-state-devices1.png" alt="Empty State Illustration" className="w-[200px]" />
          <p className="font-medium">Brak urządzeń</p>
        </div>
      )}
    </div>
  )
}
