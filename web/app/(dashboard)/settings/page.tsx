import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Form from 'next/form'
import { deleteAccount, updatePassword } from './actions'
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

        <div className="flex justify-between items-center mt-20 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-medium grow shrink-0">Aktualizacja hasła</h1>
        </div>

        <div>
          <Form action={updatePassword} className="mt-5">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block mb-1">Obecne hasło</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-control"
                  placeholder="Wpisz obecne hasło"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Nowe hasło</label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  placeholder="Wpisz nowe hasło"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Powtórz nowe hasło</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Powtórz nowe hasło"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button type="submit" className="btn-primary">
                  Zapisz hasło
                </button>
              </div>
            </div>
          </Form>
        </div>

        {user.role != Role.ADMIN ? (
          <Form action={deleteAccount} className="mt-20">
            <button className="btn-outline-red">Usuń konto</button>
          </Form>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}
