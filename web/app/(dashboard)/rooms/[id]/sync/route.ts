import { notFound, redirect } from 'next/navigation'
import { syncClasses } from '@/services/rooms'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const room = await prisma.room.findUnique({
    where: {
      id: parseInt(id)
    }
  })

  if (!room) {
    return notFound()
  }

  await syncClasses(room)

  redirect(`/rooms/${room.id}`)
}
