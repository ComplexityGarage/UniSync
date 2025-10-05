
import Form from 'next/form'
import prisma from '@/lib/prisma'

import { addNotification } from '../../(dashboard)/dashboard/actions'

export default async function NewNotification() {
    const rooms = await prisma.room.findMany()

    return (
        <div className="pr-6">
            <h2 className="text-lg font-medium mb-6">Dodać powiadomienie</h2>

            <Form action={addNotification}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1">Sala</label>
                        <select name="roomId" className="form-control">
                            {rooms.map((room) => <option value={room.id} key={room.id}>{room.number}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Ważne do</label>
                        <input
                            name="expiresAt"
                            type="datetime-local"
                            className="form-control"
                            placeholder="Expires At"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block mb-1">Text</label>
                        <textarea
                            name="content"
                            className="form-control"
                            placeholder="Content"
                        />
                    </div>
                    <div className="col-span-2">
                        <button type="submit" className="btn-primary w-full">
                            Dodać
                        </button>
                    </div>
                </div>
            </Form>
        </div>
    )
}
