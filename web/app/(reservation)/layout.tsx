import '../globals.css'
import { Poppins } from 'next/font/google'
import { Metadata } from 'next'

const poppinsFont = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: 'UJ Class Scheduler',
  description: 'IoT device'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppinsFont.variable} antialiased`}>
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB] overflow-y-auto">
          <main className="bg-white rounded-2xl p-4 shadow-xs max-w-[620px] w-full">{children}</main>
        </div>
      </body>
    </html>
  )
}
