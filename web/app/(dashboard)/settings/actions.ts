'use server'

import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(1)
})

type PasswordInput = z.infer<typeof passwordSchema>

export async function updatePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  const raw = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword')
  }

  const parsed = passwordSchema.safeParse(raw)
  if (!parsed.success) throw new Error('Validation failed')

  const data: PasswordInput = parsed.data

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) throw new Error('Invalid user')

  const ok = await bcrypt.compare(
    data.currentPassword,
    user.password || data.currentPassword
  )
  if (!ok) throw new Error('Validation failed')

  const newHash = await bcrypt.hash(data.newPassword, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: newHash }
  })

  redirect('/settings')
}

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
