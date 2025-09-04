'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function LoginButton() {
  const { data: session } = useSession()

  if (session && session.user) {
    return <button onClick={() => signOut()} className='w-full flex items-center py-3 px-2 transition duration-200 hover:bg-gray-100 rounded-xl cursor-pointer'>
      <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.4998 4C10.4998 4.66304 10.2364 5.29893 9.76759 5.76777C9.29875 6.23661 8.66286 6.5 7.99982 6.5C7.33678 6.5 6.7009 6.23661 6.23205 5.76777C5.76321 5.29893 5.49982 4.66304 5.49982 4C5.49982 3.33696 5.76321 2.70107 6.23205 2.23223C6.7009 1.76339 7.33678 1.5 7.99982 1.5C8.66286 1.5 9.29875 1.76339 9.76759 2.23223C10.2364 2.70107 10.4998 3.33696 10.4998 4V4ZM3.00049 13.412C3.02191 12.1002 3.55805 10.8494 4.49327 9.92936C5.4285 9.00929 6.68788 8.49365 7.99982 8.49365C9.31176 8.49365 10.5711 9.00929 11.5064 9.92936C12.4416 10.8494 12.9777 12.1002 12.9992 13.412C11.4307 14.1312 9.72525 14.5023 7.99982 14.5C6.21582 14.5 4.52249 14.1107 3.00049 13.412Z" stroke="#243958" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="ml-2.5">
        <div className="text-sm text-left">{session.user.name}</div>
        <div className="text-xs text-left">Wyloguj się</div>
      </div>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-auto">
        <path d="M12.0835 12.5V15.625C12.0835 16.1223 11.886 16.5992 11.5343 16.9508C11.1827 17.3025 10.7058 17.5 10.2085 17.5L5.2085 17.5C4.71121 17.5 4.2343 17.3025 3.88267 16.9508C3.53104 16.5992 3.3335 16.1223 3.3335 15.625L3.3335 4.375C3.3335 3.87772 3.53104 3.40081 3.88267 3.04918C4.2343 2.69754 4.71121 2.5 5.2085 2.5H10.2085C10.7058 2.5 11.1827 2.69754 11.5343 3.04918C11.886 3.40081 12.0835 3.87772 12.0835 4.375L12.0835 7.5M14.5835 7.5L17.0835 10M17.0835 10L14.5835 12.5M17.0835 10L6.4585 10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  }

  return <button onClick={() => signIn()}>Sign in</button>
}
