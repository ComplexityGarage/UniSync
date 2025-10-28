import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Form from 'next/form'
import { deleteAccount } from './actions'
import { Role } from '@prisma/client'

export default async function Settings() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (!user) return redirect('/')

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs min-h-full">
      <div>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-medium grow shrink-0">Ustawienia</h1>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <dt className="font-medium">Imię i nazwisko</dt>
          <dd>{user.name || '-'}</dd>
          <dt className="font-medium">Email</dt>
          <dd>{user.email || '-'}</dd>
          <dt className="font-medium">Uprawnienia</dt>
          <dd>{user.role || '-'}</dd>
        </dl>

        {user.role != Role.ADMIN ? (
          <Form action={deleteAccount} className="mt-10">
            <button className="btn-outline-red">
              Usuń konto
            </button>
          </Form>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}
