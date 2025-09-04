'use server'

import { getRequest } from '@/clients/usos-client'
import prisma from '@/lib/prisma'
import { Room, User } from '@prisma/client'

export async function syncRoomData(room: Room) {
  const response = await fetch(
    `https://apps.usos.uj.edu.pl/services/geo/room?room_id=${room.usos_id}&fields=number%7Ccapacity`,
    {
      method: 'GET'
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }

  const data = (await response.json()) as {
    capacity: number | null
    number: string
  }

  await prisma.room.update({
    where: {
      id: room.id
    },
    data: {
      ...data
    }
  })
}

export async function syncClasses(room: Room) {
  await prisma.timetable.deleteMany({
    where: {
      roomId: room.id
    }
  })

  const timetables = await getRequest({
    token: process.env.USOS_API_ACESS_TOKEN ?? '',
    secret: process.env.USOS_API_TOKEN_SECRET ?? '',
    action: `tt/room?room_id=${room.usos_id}&fields=start_time|end_time|name|lecturer_ids`
  })

  for (const timetable of timetables) {
    const data = {
      roomId: room.id,
      startTime: new Date(timetable.start_time).toISOString(),
      endTime: new Date(timetable.end_time).toISOString(),
      name: timetable.name.pl,
      nameEn: timetable.name.en,
      lecturerIds: timetable.lecturer_ids
    }

    await prisma.timetable.upsert({
      where: {
        roomId_startTime_endTime: {
          roomId: data.roomId,
          startTime: data.startTime,
          endTime: data.endTime
        }
      },
      create: { ...data },
      update: {}
    })
  }
}

export async function syncRoomIds(user: User) {
  try {
    const response = await fetch(
      `https://apps.usos.uj.edu.pl/services/tt/staff?user_id=${user.usosId}&fields=room_id`,
      {
        method: 'GET'
      }
    )
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    const roomIds = data.map(({ room_id }: { room_id: number }) => room_id)

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        roomIds
      }
    })
  } catch (err: any) {
    console.log(err)
  }
}
