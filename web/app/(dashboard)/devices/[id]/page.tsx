import Link from 'next/link'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ConnectDevice from '@/app/components/devices/ConnectDevice'
import SyncLogs from '@/app/components/devices/SyncLogs'

export default async function Room({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: deviceId } = await params

  const device = await prisma.device.findUnique({
    where: {
      id: deviceId
    },
    include: {
      room: true,
      syncLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!device) {
    return notFound()
  }

  const lastSyncAt = device.syncLogs[0] ? device.syncLogs[0].createdAt : null

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-xs mb-8">
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
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-medium grow shrink-0"> {device.name}</h1>

          <Link
            href={`/devices/${device.id}/edit`}
            className="btn-primary w-min px-4 text-sm flex items-center gap-3 whitespace-nowrap"
          >
            Edytuj urządzenie
          </Link>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <dt className="font-medium">Nazwa</dt>
          <dd>{device.name}</dd>
          <dt className="font-medium">Szablon</dt>
          <dd>
            <span className="block rounded overflow-hidden border border-primary p-1 bg-white w-fit">
              <img src={`/template-${device.template}.svg`} />
            </span>
          </dd>
          <dt className="font-medium">Sala</dt>
          <dd>
            <Link href={`/rooms/${device.room.id}`} className="link_tag">
              {device.room.number}
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
          </dd>
          <dt className="font-medium">Ostatnia synchronizacja o</dt>
          <dd>
            {lastSyncAt
              ? lastSyncAt.toLocaleString('pl-PL', {
                  timeZone: 'Europe/Warsaw'
                })
              : '...'}
          </dd>
          <dt className="font-medium">Interwał aktualizacji</dt>
          <dd>{device.syncInterval} s</dd>
        </dl>
      </div>

      <ConnectDevice deviceId={device.id} />

      <div className="bg-white rounded-2xl p-4 shadow-xs mt-8">
        <h2 className="text-lg font-medium mb-5">Historia synchronizacji</h2>
        <SyncLogs syncLogs={device.syncLogs} />
      </div>
    </>
  )
}
