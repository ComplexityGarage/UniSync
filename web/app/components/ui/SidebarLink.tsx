'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  className?: string
  inactiveClassName?: string
  activeClassName?: string
}

export default function SidebarLink({ href, children, className = '', inactiveClassName = '', activeClassName = '' }: Props) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  const combinedClassName = `${className} ${isActive ? activeClassName : inactiveClassName}`

  return (
    <Link href={href} className={combinedClassName.trim()}>
      {children}
    </Link>
  )
}