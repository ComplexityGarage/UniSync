import prisma from '@/lib/prisma'
import NotificationForm from './NotificationForm'

export default async function NewNotification() {
  const rooms = await prisma.room.findMany()

  return (
    <div className="pr-6">
      <h2 className="text-lg font-medium mb-6">Dodać powiadomienie</h2>
      <NotificationForm rooms={rooms} />
    </div>
  )
}
