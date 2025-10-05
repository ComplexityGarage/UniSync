import Form from 'next/form'
import { Devices } from '@prisma/client'
import Link from 'next/link'

export default async function Devices({ devices }: { devices: Devices[] }) {
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

  const getSyncStatus = (
    lastSyncAt: Date
  ): 'working' | 'problem' | 'down' | 'pending' => {
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
    <>
      {devices.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  ID
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Nazwa
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Status
                </th>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Ostatnia synchronizacja
                </th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const lastSyncAt = device.syncLogs[0] ? device.syncLogs[0].createdAt : null

                return (
                  <tr key={device.id}>
                    <td className="border-b border-gray-200 py-2 px-4 text-sm">
                      {device.id}
                    </td>
                    <td className="border-b border-gray-200 py-2 px-4 text-sm">
                      <Link href={`/devices/${device.id}`} className="link_tag">
                        {device.name}
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
                    <td className="border-b border-gray-200 py-2 px-4 text-sm">
                      <div
                        className={`px-2 py-1 rounded-full uppercase text-xs font-medium w-min ${getStatusClasses(
                          getSyncStatus(lastSyncAt)
                        )}`}
                      >
                        {getSyncStatus(lastSyncAt)}
                      </div>
                    </td>
                    <td className="border-b border-gray-200 py-2 px-4 text-sm">
                      {lastSyncAt?.toLocaleString('pl-PL', {
                        timeZone: 'Europe/Warsaw'
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-10">
          <img
            src="/empty-state-devices1.png"
            alt="Empty State Illustration"
            className="w-[140px]"
          />
          <p className="font-medium">Brak urządzeń</p>
        </div>
      )}
    </>
  )
}
