import { redirect } from 'next/navigation'
import { auth } from '../lib/auth'
import { syncRoomIds } from '../services/rooms'
import prisma from '../lib/prisma'

export default async function Home() {
  const session = await auth()

  if (!session || !session.user) {
    return redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (!user) return redirect('/auth/login')

  await syncRoomIds(user)
  
  return redirect('/dashboard')
}
