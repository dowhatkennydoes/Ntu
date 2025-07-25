'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true) // Start with true for proper initialization

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('SimpleAuth: Starting initialization with real Supabase...')
        
        // Add a small delay to ensure client-side hydration is complete
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get current session with timeout
        console.log('SimpleAuth: Getting current session...')
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout after 3 seconds')), 3000)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (error) {
          console.error('SimpleAuth: Session error:', error)
          throw error
        }
        
        console.log('SimpleAuth: Session retrieved successfully')
        console.log('SimpleAuth: User exists:', session?.user ? session.user.email : 'no')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
        }
        
        console.log('SimpleAuth: Initialization complete')
        
      } catch (error) {
        console.error('SimpleAuth: Auth initialization error:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) {
          console.log('SimpleAuth: Setting loading to false')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      console.log('SimpleAuth: Auth state changed:', event)
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Real authentication functions
  const signIn = async (email: string, password: string) => {
    try {
      console.log('SimpleAuth: Signing in user:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('SimpleAuth: Sign in error:', error)
        return { success: false, error: error.message }
      }

      console.log('SimpleAuth: Sign in successful')
      return { success: true }
    } catch (error: any) {
      console.error('SimpleAuth: Sign in exception:', error)
      return { success: false, error: error.message || 'Sign in failed' }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      console.log('SimpleAuth: Signing up user:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('SimpleAuth: Sign up error:', error)
        return { success: false, error: error.message }
      }

      console.log('SimpleAuth: Sign up successful')
      return { success: true }
    } catch (error: any) {
      console.error('SimpleAuth: Sign up exception:', error)
      return { success: false, error: error.message || 'Sign up failed' }
    }
  }

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=magiclink`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Magic link failed' }
    }
  }

  const signOut = async () => {
    console.log('SimpleAuth: Signing out')
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Google sign in failed' }
    }
  }

  const updateProfile = async (updates: any) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Profile update failed' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signInWithMagicLink,
      signOut,
      signInWithGoogle,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}