'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/SimpleAuthContext'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface AuthWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback'
]

export default function AuthWrapper({ children, requireAuth = true }: AuthWrapperProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    console.log('AuthWrapper useEffect: pathname =', pathname, 'loading =', loading, 'user =', user ? 'exists' : 'null', 'requireAuth =', requireAuth)
    
    if (loading) {
      console.log('AuthWrapper: Still loading, showing loading screen')
      return
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
    const isAuthenticated = !!user

    console.log('AuthWrapper: PUBLIC_ROUTES =', PUBLIC_ROUTES)
    console.log('AuthWrapper: isPublicRoute =', isPublicRoute, 'isAuthenticated =', isAuthenticated)

    if (requireAuth && !isAuthenticated && !isPublicRoute) {
      // Redirect to login if authentication is required but user is not authenticated
      console.log('AuthWrapper: Condition 1 - Redirecting to login')
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && isPublicRoute) {
      // Redirect to dashboard if user is authenticated but on auth pages
      console.log('AuthWrapper: Condition 2 - Redirecting to dashboard')
      router.push('/')
      return
    }

    console.log('AuthWrapper: No redirect needed, setting shouldRender to true')
    setShouldRender(true)
  }, [user, loading, pathname, router, requireAuth])

  // Show loading screen while checking authentication
  if (loading || !shouldRender) {
    console.log('AuthWrapper: Showing loading screen - loading:', loading, 'shouldRender:', shouldRender)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Neural Task Universe</h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}