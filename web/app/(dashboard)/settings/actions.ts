'use server'

import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function deleteAccount(formData: FormData) {
  const session = await auth()

  if (!session || !session.user) {
    return redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (!user) {
    return redirect('/')
  }

  if (user.role == Role.ADMIN) {
    return redirect('/')
  }

  await prisma.account.deleteMany({
    where: { userId: user.id }
  })

  await prisma.user.delete({
    where: { id: user.id }
  })

  redirect(`/`)
}
