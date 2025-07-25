import { supabase } from './supabase-client'
import { User, Session, AuthError } from '@supabase/supabase-js'

// Authentication types
export interface AuthUser {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface SignUpData {
  email: string
  password: string
  metadata?: {
    name?: string
    avatar_url?: string
  }
}

export interface SignInData {
  email: string
  password: string
}

// Authentication state management
export class AuthManager {
  private static instance: AuthManager
  private currentUser: User | null = null
  private currentSession: Session | null = null

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // Initialize auth state
  async initialize() {
    try {
      console.log('AuthManager: Starting initialization...')
      
      // Get initial session with timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getSession timeout after 5 seconds')), 5000)
      )
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
      
      this.currentSession = session
      this.currentUser = session?.user ?? null
      
      console.log('AuthManager: Session retrieved:', session ? 'exists' : 'null')
      console.log('AuthManager: User:', this.currentUser ? this.currentUser.email : 'null')

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        this.currentSession = session
        this.currentUser = session?.user ?? null
        console.log('Auth state changed:', event, session?.user?.email)
      })
      
      console.log('AuthManager: Initialization complete')
    } catch (error) {
      console.error('AuthManager initialization error:', error)
      this.currentSession = null
      this.currentUser = null
      throw error
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser
  }

  // Get current session
  getCurrentSession(): Session | null {
    return this.currentSession
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: data.metadata
      }
    })

    if (error) {
      console.error('Sign up error:', error)
      return { user: null, error }
    }

    // Create user record in our users table
    if (authData.user) {
      try {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email!
          })

        if (dbError) {
          console.error('Error creating user record:', dbError)
        }
      } catch (err) {
        console.error('Error creating user record:', err)
      }
    }

    return { user: authData.user, error: null }
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) {
      console.error('Sign in error:', error)
      return { user: null, error }
    }

    return { user: authData.user, error: null }
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return { error }
    }

    return { error: null }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      console.error('Password reset error:', error)
      return { error }
    }

    return { error: null }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error)
      return { error }
    }

    return { error: null }
  }

  // Update user profile
  async updateProfile(updates: { email?: string; data?: any }): Promise<{ user: User | null; error: AuthError | null }> {
    const { data: authData, error } = await supabase.auth.updateUser(updates)

    if (error) {
      console.error('Profile update error:', error)
      return { user: null, error }
    }

    return { user: authData.user, error: null }
  }

  // Sign in with magic link
  async signInWithMagicLink(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?type=magiclink`
      }
    })

    if (error) {
      console.error('Magic link error:', error)
      return { error }
    }

    return { error: null }
  }

  // Sign in with Google OAuth with Calendar access
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.events.readonly'
        ].join(' '),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) {
      console.error('Google sign in error:', error)
      return { error }
    }

    return { error: null }
  }

  // Get user profile from database
  async getUserProfile(userId: string): Promise<{ profile: AuthUser | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return { profile: null, error }
    }

    return { profile: data, error: null }
  }

  // Update user profile in database
  async updateUserProfile(userId: string, updates: Partial<AuthUser>): Promise<{ profile: AuthUser | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return { profile: null, error }
    }

    return { profile: data, error: null }
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance()

// Convenience functions
export const signUp = (data: SignUpData) => authManager.signUp(data)
export const signIn = (data: SignInData) => authManager.signIn(data)
export const signInWithMagicLink = (email: string) => authManager.signInWithMagicLink(email)
export const signOut = () => authManager.signOut()
export const resetPassword = (email: string) => authManager.resetPassword(email)
export const updatePassword = (newPassword: string) => authManager.updatePassword(newPassword)
export const updateProfile = (updates: { email?: string; data?: any }) => authManager.updateProfile(updates)
export const signInWithGoogle = () => authManager.signInWithGoogle()
export const getUserProfile = (userId: string) => authManager.getUserProfile(userId)
export const updateUserProfile = (userId: string, updates: Partial<AuthUser>) => authManager.updateUserProfile(userId, updates)
export const getCurrentUser = () => authManager.getCurrentUser()
export const getCurrentSession = () => authManager.getCurrentSession()
export const isAuthenticated = () => authManager.isAuthenticated() 