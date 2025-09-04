
import Form from 'next/form'
import prisma from '@/lib/prisma'
import NotificationProgressBar from './NotificationProgressBar'

import { deleteNotification } from '../../(dashboard)/dashboard/actions'

export default async function Notifications() {

    const notifications = await prisma.notification.findMany({
        include: {
            room: true,
        },
        where: {
          expiresAt: {
            gt: new Date().toISOString()
          }
        }
    })

    return (
        <div className="pl-6 border-l border-gray-200">
            <h2 className="text-lg font-medium mb-6">Aktywne powiadomienia</h2>
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <div className="bg-[#f9fafd] rounded-xl p-3 mt-4 relative overflow-hidden" key={notification.id}>
                        <NotificationProgressBar expiresAt={notification.expiresAt} createdAt={notification.createdAt}/>
                        <div className="flex itens-center mt-3">
                            <div className="flex items-center justify-center rounded-full bg-[#ccecf5] w-9 h-9 shrink-0 mr-3">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                                    <path d="M14.857 17.082C16.7202 16.8614 18.5509 16.4217 20.311 15.772C18.8204 14.1208 17.9967 11.9745 18 9.75V9C18 7.4087 17.3678 5.88258 16.2426 4.75736C15.1174 3.63214 13.5913 3 12 3C10.4087 3 8.88257 3.63214 7.75735 4.75736C6.63213 5.88258 5.99999 7.4087 5.99999 9V9.75C6.00301 11.9746 5.17898 14.121 3.68799 15.772C5.42099 16.412 7.24799 16.857 9.14299 17.082M14.857 17.082C12.959 17.3071 11.041 17.3071 9.14299 17.082M14.857 17.082C15.0011 17.5319 15.0369 18.0094 14.9616 18.4757C14.8862 18.942 14.7018 19.384 14.4234 19.7656C14.1449 20.1472 13.7803 20.4576 13.3592 20.6716C12.9381 20.8856 12.4724 20.9972 12 20.9972C11.5276 20.9972 11.0619 20.8856 10.6408 20.6716C10.2197 20.4576 9.85506 20.1472 9.57661 19.7656C9.29816 19.384 9.11375 18.942 9.0384 18.4757C8.96305 18.0094 8.99889 17.5319 9.14299 17.082" stroke="#1e689f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="grow">
                                <div className="font-medium">{notification.room.number}:{notification.room.name}</div>
                                <p className="text-sm">{notification.content}</p>
                            </div>
                            <Form action={deleteNotification}>
                                <input
                                    type="hidden"
                                    name="notificationId"
                                    value={notification.id}
                                />
                                <input type="hidden" name="roomId" value={notification.room.id} />
                                <button className="btn-outline-sm ml-8">
                                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                                        <path d="M12.7833 7.99995L12.495 15.4999M8.505 15.4999L8.21667 7.99995M16.5233 5.32495C16.8083 5.36828 17.0917 5.41411 17.375 5.46328M16.5233 5.32578L15.6333 16.8941C15.597 17.3651 15.3842 17.8051 15.0375 18.126C14.6908 18.4469 14.2358 18.6251 13.7633 18.6249H7.23667C6.76425 18.6251 6.30919 18.4469 5.96248 18.126C5.61578 17.8051 5.40299 17.3651 5.36667 16.8941L4.47667 5.32495M16.5233 5.32495C15.5616 5.17954 14.5948 5.06919 13.625 4.99411M3.625 5.46245C3.90833 5.41328 4.19167 5.36745 4.47667 5.32495M4.47667 5.32495C5.43844 5.17955 6.4052 5.06919 7.375 4.99411M13.625 4.99411V4.23078C13.625 3.24745 12.8667 2.42745 11.8833 2.39661C10.9613 2.36714 10.0387 2.36714 9.11667 2.39661C8.13333 2.42745 7.375 3.24828 7.375 4.23078V4.99411M13.625 4.99411C11.5448 4.83334 9.45523 4.83334 7.375 4.99411" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </Form>
                        </div>
                    </div>
                ))) : (
                <div className="flex flex-col gap-6 items-center justify-center pt-20 text-[#979895]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53" />
                    </svg>
                    <p>Brak aktywnych powiadomień</p>
                </div>
            )}
        </div>
    )
}
