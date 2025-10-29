import '../globals.css'
import { auth } from '../../lib/auth'
import { forbidden, notFound, redirect } from 'next/navigation'
import { Poppins } from 'next/font/google'
import { Metadata } from 'next'
import Sidebar from '../components/ui/Sidebar'
import { Role } from '@prisma/client'
import prisma from '../../lib/prisma'

const poppinsFont = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: 'UniSync UJ',
  description: 'IoT device'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email: string) => email.trim())
    .filter(Boolean)

  const isAdminEmail = adminEmails.includes(user.email)
  const desiredRole = isAdminEmail ? Role.ADMIN : Role.GUEST

  if (user.role !== desiredRole) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: desiredRole }
    })

    redirect('/dashboard')
  }

  if (!user || user.role == Role.GUEST) {
    return forbidden()
  }

  return (
    <html lang="en">
      <body className={`${poppinsFont.variable} antialiased`}>
        <div className="flex h-screen bg-[#F5F7FB]">
          <Sidebar role={user.role} />
          <main className="p-8 grow h-screen overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
