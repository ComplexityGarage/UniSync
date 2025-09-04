'use server'

import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const deviceShema = z.object({
  name: z.string().min(3),
  template: z.number(),
  syncInterval: z.number(),
  roomId: z.number()
})

type DeviceInput = z.infer<typeof deviceShema>

export async function createDevice(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    template: +(formData.get('template') || 0),
    syncInterval: +(formData.get('syncInterval') || 60),
    roomId: +(formData.get('roomId') || 0)
  }

  const parsed = deviceShema.safeParse(raw)

  if (!parsed.success) {
    throw new Error('Validation failed')
  }

  const data: DeviceInput = parsed.data

  const device = await prisma.device.create({
    data
  })

  redirect(`/devices/${device.id}`)
}

export async function updateDevice(formData: FormData) {
  const deviceId = formData.get('deviceId')

  if (!deviceId || typeof deviceId !== 'string') {
    throw new Error('device not found')
  }

  const device = await prisma.device.findUnique({
    where: {
      id: deviceId
    }
  })

  if (!device) {
    throw new Error('Device not found')
  }

 const raw = {
    name: formData.get('name'),
    template: +(formData.get('template') || 0),
    syncInterval: +(formData.get('syncInterval') || 60),
    roomId: +(formData.get('roomId') || 0)
  }

  const parsed = deviceShema.safeParse(raw)

  if (!parsed.success) {
    throw new Error('Validation error')
  }

  const data: DeviceInput = parsed.data

  await prisma.device.update({
    where: {
      id: device.id
    },
    data
  })

  redirect(`/devices/${device.id}`)
}

export async function deleteDevice(formData: FormData) {
  const deviceId = formData.get('deviceId')

  if (!deviceId || typeof deviceId !== 'string') {
    throw new Error('Invalid device ID')
  }

  await prisma.room.delete({
    where: { id: roomId }
  })

  redirect(`/devices`)
}
