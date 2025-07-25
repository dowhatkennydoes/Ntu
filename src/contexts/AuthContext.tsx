'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { authManager, AuthUser } from '@/lib/supabase-auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      await authManager.initialize()
      
      const currentUser = authManager.getCurrentUser()
      const currentSession = authManager.getCurrentSession()
      
      setUser(currentUser)
      setSession(currentSession)
      
      // Load user profile if authenticated
      if (currentUser) {
        const { profile: userProfile } = await authManager.getUserProfile(currentUser.id)
        setProfile(userProfile)
      }
      
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user: newUser, error } = await authManager.signIn({ email, password })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      if (newUser) {
        setUser(newUser)
        setSession(authManager.getCurrentSession())
        
        // Load user profile
        const { profile: userProfile } = await authManager.getUserProfile(newUser.id)
        setProfile(userProfile)
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    try {
      const { user: newUser, error } = await authManager.signUp({ 
        email, 
        password, 
        metadata 
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authManager.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithMagicLink = async (email: string) => {
    setLoading(true)
    try {
      const { error } = await authManager.signInWithMagicLink(email)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await authManager.signInWithGoogle()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    try {
      const { profile: updatedProfile, error } = await authManager.updateUserProfile(user.id, updates)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const value = {
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
  }

  return (
    <AuthContext.Provider value={value}>
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