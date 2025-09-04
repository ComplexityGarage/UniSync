'use client'

import { useEffect, useState } from 'react'

export default function NotificationProgressBar({ expiresAt, createdAt }: { expiresAt: Date; createdAt: Date }) {
  const [progress, setProgress] = useState(100)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const end = expiresAt.getTime()
    const start = createdAt.getTime()
    const total = end - start

    const updateProgress = () => {
      const now = Date.now()
      const remaining = end - now
      const percentage = Math.max(0, (remaining / total) * 100)
      setProgress(percentage)
    }

    updateProgress()
    const interval = setInterval(updateProgress, 100)

    return () => clearInterval(interval)
  }, [expiresAt, createdAt])

  if (!mounted) return null

  return (
    <div className="w-full bg-[#EBEAFA] rounded-md h-1">
      <div className={`h-1 rounded-md bg-[#6c62dd]`} style={{ width: `${progress}%` }}/>
    </div>
  )
}