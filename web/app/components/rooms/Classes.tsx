import Form from 'next/form'
import { Room, Timetable } from '@prisma/client'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toggleTimetable } from '../../(dashboard)/dashboard/actions'

export default function Classes({ room, timetables }: { room: Room, timetables: Timetable[] }) {
  return (
    <div className="shadow-xs rounded-2xl p-4 bg-white">
      <div className="flex flex-col divide-y divide-gray-200 gap-4">
        {timetables.map((timetable) => (
          <div key={timetable.id} className="flex items-center pb-4">
            <div className="shrink-0 rounded-md overflow-hidden mr-3.5">
              <div className="w-12 py-1.5 text-center bg-[#D2CEF7] text-[#514BAB] font-medium text-sm capitalize">
                {format(timetable.startTime, 'eee', { locale: pl }).replace(
                  '.',
                  ''
                )}
              </div>
              <div className="w-12 py-1.5 text-center bg-[#EBEAFA] text-[#514BAB] font-medium text-sm">
                {format(timetable.startTime, 'dd')}
              </div>
            </div>
            <div className="grow">
              <div className="text-lg font-medium">
                {format(timetable.startTime, 'HH:mm')}
                {' - '}
                {format(timetable.endTime, 'HH:mm')}
              </div>
              <p>
                Sala {room.number}: {timetable.name}
              </p>
            </div>
            <Form action={toggleTimetable}>
              <input type="hidden" name="timetableId" value={timetable.id} />
              <button type="submit" className="btn-outline-sm ml-8">
                {timetable.cancelled ? 'Przywróć' : 'Odwołać'}
              </button>
            </Form>
          </div>
        ))}
      </div>
    </div>
  )
}
