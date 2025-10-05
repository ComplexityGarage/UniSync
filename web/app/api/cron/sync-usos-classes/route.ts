import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { syncClasses } from '@/services/rooms'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const rooms = await prisma.room.findMany()

  for (const room of rooms) {
    await syncClasses(room)
  }

  return Response.json({ success: true })
}
