'use client'

import { useEffect, useState } from 'react'

interface ThreeBackgroundProps {
  className?: string
  disabled?: boolean
}

export default function ThreeBackground({ className = '', disabled = false }: ThreeBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simplified fallback background - no ThreeJS for now to avoid errors
  if (!mounted || disabled) {
    return (
      <div className={`fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`} />
    )
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated gradient overlay for better visual appeal */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none" />
    </div>
  )
}