'use client'

import Form from 'next/form'

import { addNotification } from '@/app/(dashboard)/dashboard/actions'
import { useActionState } from 'react'
import { Room } from '@prisma/client'
import { cn } from '@/lib/utils'

export default function NotificationForm({ rooms }: { rooms: Room[] }) {
  const initialState = {
    errors: {}
  }

  const [state, formAction, pending] = useActionState(
    addNotification,
    initialState
  )

  return (
    <Form action={formAction}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Sala</label>
          <select name="roomId" className="form-control">
            {rooms.map((room) => (
              <option value={room.id} key={room.id}>
                {room.number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Ważne do</label>
          <input
            name="expiresAt"
            type="datetime-local"
            className={cn(
              'form-control',
              state?.errors?.expiresAt && 'border-red-500'
            )}
            placeholder="Expires At"
          />
        </div>

        <div className="col-span-2">
          <label className="block mb-1">Text</label>
          <textarea
            name="content"
            className={cn(
              'form-control',
              state?.errors?.content && 'border-red-500'
            )}
            placeholder="Content"
          />
        </div>

        <div className="col-span-2">
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={pending}
          >
            Dodać
          </button>
        </div>
      </div>
    </Form>
  )
}
