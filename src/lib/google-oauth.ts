import { supabase, supabaseAdmin, GoogleOAuthTokens, logGoogleAuth } from './supabase-meetings'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/oauth/callback'

// MEET2, MEET3, MEET4: Required scopes
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  // 'https://www.googleapis.com/auth/meetings.space.readonly', // When available
].join(' ')

// MEET1: OAuth 2.0 authentication flow
export function getGoogleAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline', // MEET20: Offline access for long-lived tokens
    prompt: 'consent',
    ...(state && { state }),
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// MEET5: Securely store tokens with refresh support
export async function storeGoogleTokens(
  userId: string,
  googleUserId: string,
  googleEmail: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  // MEET16: Encrypt tokens in database (using Supabase's built-in encryption)
  const { data, error } = await supabaseAdmin
    .from('google_oauth_tokens')
    .upsert({
      user_id: userId,
      google_user_id: googleUserId,
      google_email: googleEmail,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_at: expiresAt,
      scope: GOOGLE_SCOPES,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to store Google tokens:', error)
    throw error
  }

  // MEET8: Log authentication
  await logGoogleAuth(userId, googleUserId, googleEmail)

  return data
}

// MEET6: Auto-refresh expired tokens
export async function refreshGoogleTokens(userId: string): Promise<string> {
  const { data: tokenData, error: fetchError } = await supabase
    .from('google_oauth_tokens')
    .select('refresh_token, google_user_id, google_email')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (fetchError || !tokenData) {
    throw new Error('No active Google tokens found')
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    const tokenResponse = await response.json()

    // Update tokens in database
    const { error: updateError } = await supabaseAdmin
      .from('google_oauth_tokens')
      .update({
        access_token: tokenResponse.access_token,
        expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Failed to update refreshed tokens:', updateError)
      throw updateError
    }

    return tokenResponse.access_token
  } catch (error) {
    console.error('Token refresh failed:', error)
    throw error
  }
}

// MEET7: Check if reauthentication is required
export async function checkTokenExpiration(userId: string): Promise<{ needsRefresh: boolean; isValid: boolean }> {
  const { data: tokenData, error } = await supabase
    .from('google_oauth_tokens')
    .select('expires_at, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !tokenData) {
    return { needsRefresh: false, isValid: false }
  }

  const expiresAt = new Date(tokenData.expires_at)
  const now = new Date()
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()

  // Refresh if token expires within 5 minutes
  const needsRefresh = timeUntilExpiry < 5 * 60 * 1000
  const isValid = expiresAt > now

  return { needsRefresh, isValid }
}

// MEET9: Get list of connected accounts
export async function getConnectedAccounts(userId: string): Promise<Partial<GoogleOAuthTokens>[]> {
  const { data, error } = await supabase
    .from('google_oauth_tokens')
    .select('google_user_id, google_email, created_at, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Failed to get connected accounts:', error)
    throw error
  }

  return data || []
}

// MEET10: Ensure one Google account per Ntu user
export async function ensureSingleGoogleAccount(userId: string, googleUserId: string): Promise<boolean> {
  const { data: existingTokens, error } = await supabase
    .from('google_oauth_tokens')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Failed to check existing accounts:', error)
    throw error
  }

  // If user already has an active Google account, deactivate it
  if (existingTokens && existingTokens.length > 0) {
    const { error: deactivateError } = await supabaseAdmin
      .from('google_oauth_tokens')
      .update({ is_active: false })
      .eq('user_id', userId)

    if (deactivateError) {
      console.error('Failed to deactivate existing tokens:', deactivateError)
      throw deactivateError
    }
  }

  return true
}

// MEET12: Get valid access token for API calls
export async function getValidAccessToken(userId: string): Promise<string> {
  const { needsRefresh, isValid } = await checkTokenExpiration(userId)

  if (!isValid) {
    throw new Error('Google authentication required')
  }

  if (needsRefresh) {
    return await refreshGoogleTokens(userId)
  }

  // Get current access token
  const { data: tokenData, error } = await supabase
    .from('google_oauth_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !tokenData) {
    throw new Error('No valid Google tokens found')
  }

  return tokenData.access_token
}

// MEET14: Handle access revocation
export async function handleAccessRevocation(userId: string) {
  const { error } = await supabaseAdmin
    .from('google_oauth_tokens')
    .update({ is_active: false })
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to deactivate tokens after revocation:', error)
    throw error
  }

  // MEET97: Remove all synced calendar data
  const { error: meetingsError } = await supabaseAdmin
    .from('meetings')
    .delete()
    .eq('user_id', userId)

  if (meetingsError) {
    console.error('Failed to remove synced meetings:', meetingsError)
    throw meetingsError
  }
}

// MEET15: Disconnect Google account
export async function disconnectGoogleAccount(userId: string) {
  try {
    // Revoke tokens with Google
    const { data: tokenData } = await supabase
      .from('google_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (tokenData?.access_token) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenData.access_token}`, {
        method: 'POST',
      })
    }

    // Deactivate tokens locally
    await handleAccessRevocation(userId)

    return true
  } catch (error) {
    console.error('Failed to disconnect Google account:', error)
    throw error
  }
}

// MEET17: Admin trigger for global reauthentication
export async function triggerGlobalReauthentication() {
  const { error } = await supabaseAdmin
    .from('google_oauth_tokens')
    .update({ is_active: false })

  if (error) {
    console.error('Failed to trigger global reauthentication:', error)
    throw error
  }
}

// MEET19: Support staging vs production environments
export function getGoogleConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    clientId: isProduction 
      ? process.env.GOOGLE_CLIENT_ID_PROD 
      : process.env.GOOGLE_CLIENT_ID_DEV || GOOGLE_CLIENT_ID,
    clientSecret: isProduction 
      ? process.env.GOOGLE_CLIENT_SECRET_PROD 
      : process.env.GOOGLE_CLIENT_SECRET_DEV || GOOGLE_CLIENT_SECRET,
    redirectUri: isProduction 
      ? process.env.GOOGLE_REDIRECT_URI_PROD 
      : process.env.GOOGLE_REDIRECT_URI_DEV || GOOGLE_REDIRECT_URI,
  }
}

// MEET20: Audit logging for token events
export async function logTokenEvent(
  userId: string, 
  event: 'created' | 'refreshed' | 'expired' | 'revoked',
  details?: string
) {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action: `google_token_${event}`,
      details: details || `Google OAuth token ${event}`,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to log token event:', error)
  }
} 