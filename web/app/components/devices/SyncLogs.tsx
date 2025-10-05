import { DeviceSyncLog } from '@prisma/client'

export default async function SyncLogs({
  syncLogs
}: {
  syncLogs: DeviceSyncLog[]
}) {
  return (
    <>
      {syncLogs.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                <th className="font-medium text-sm uppercase bg-[#f9fafd] border-b border-gray-200 py-2 px-4 text-left">
                  Data i godzina
                </th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map((syncLog) => {
                return (
                  <tr key={syncLog.id}>
                    <td className="border-b border-gray-200 py-2 px-4 text-sm">
                      {syncLog.createdAt.toLocaleString('pl-PL', {
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
          <p className="font-medium">Brak Historii</p>
        </div>
      )}
    </>
  )
}
