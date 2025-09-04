import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import NextAuthProvider from './auth'

const poppinsFont = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
})


export const metadata: Metadata = {
  title: 'UJ Class Scheduler',
  description: 'IoT device',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppinsFont.variable} antialiased`}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
}
