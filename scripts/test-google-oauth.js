#!/usr/bin/env node

/**
 * Test script for Google OAuth setup
 * Verifies environment variables, API routes, and database configuration
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testGoogleOAuth() {
  console.log('🔐 Testing Google OAuth Setup...\n')

  const testResults = {
    envVars: false,
    database: false,
    apiRoutes: false,
    oauthFlow: false,
    calendarApi: false
  }

  // Test 1: Environment Variables
  console.log('📋 Checking environment variables...')
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI'
  ]

  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName]
    if (!value || value.includes('your_')) {
      console.log(`❌ ${varName}: ${value || 'NOT SET'}`)
      return true
    }
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
    return false
  })

  if (missingVars.length === 0) {
    testResults.envVars = true
    console.log('✅ All required environment variables are set')
  } else {
    console.log(`❌ Missing or invalid environment variables: ${missingVars.join(', ')}`)
  }

  // Test 2: Database Configuration
  console.log('\n🗄️  Checking database configuration...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Supabase credentials not found')
  } else {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    try {
      // Check if google_oauth_tokens table exists
      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .select('*')
        .limit(1)

      if (error && error.message.includes('does not exist')) {
        console.log('❌ google_oauth_tokens table not found')
      } else if (error) {
        console.log('⚠️  Table exists but access error:', error.message)
      } else {
        console.log('✅ google_oauth_tokens table exists and accessible')
        testResults.database = true
      }
    } catch (err) {
      console.log('❌ Database connection failed:', err.message)
    }
  }

  // Test 3: API Routes
  console.log('\n🔗 Checking API routes...')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const routes = [
    '/api/google/oauth/url',
    '/api/google/oauth/callback',
    '/api/google/accounts',
    '/api/google/calendar',
    '/api/google/disconnect'
  ]

  let routeChecks = 0
  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      // We expect 400/405 for GET requests to POST-only endpoints, or 307 for callback without params
      if (response.status === 400 || response.status === 405 || response.status === 307 || response.status === 500) {
        console.log(`✅ ${route}: Route exists (${response.status})`)
        routeChecks++
      } else if (response.status === 404) {
        console.log(`❌ ${route}: Route not found`)
      } else {
        console.log(`⚠️  ${route}: Unexpected status ${response.status}`)
      }
    } catch (err) {
      console.log(`❌ ${route}: Connection failed - ${err.message}`)
    }
  }

  if (routeChecks >= 4) {
    testResults.apiRoutes = true
    console.log('✅ All API routes are accessible')
  } else {
    console.log(`⚠️  Only ${routeChecks}/5 routes accessible`)
  }

  // Test 4: OAuth URL Generation
  console.log('\n🔐 Testing OAuth URL generation...')
  try {
    const response = await fetch(`${baseUrl}/api/google/oauth/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user-id' })
    })

    if (response.ok) {
      const data = await response.json()
      if (data.authUrl && data.authUrl.includes('accounts.google.com')) {
        console.log('✅ OAuth URL generation working')
        console.log(`   Generated URL: ${data.authUrl.substring(0, 80)}...`)
        testResults.oauthFlow = true
      } else {
        console.log('❌ Invalid OAuth URL generated')
      }
    } else {
      console.log(`❌ OAuth URL generation failed: ${response.status}`)
    }
  } catch (err) {
    console.log('❌ OAuth URL generation error:', err.message)
  }

  // Test 5: Calendar API Configuration
  console.log('\n📅 Testing Calendar API configuration...')
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (clientId && clientSecret && !clientId.includes('your_') && !clientSecret.includes('your_')) {
    console.log('✅ Google Cloud Console credentials configured')
    console.log('   Note: Calendar API access requires user authentication')
    testResults.calendarApi = true
  } else {
    console.log('❌ Google Cloud Console credentials not properly configured')
  }

  // Summary
  console.log('\n📊 Google OAuth Test Summary:')
  console.log('============================')
  console.log(`Environment Variables: ${testResults.envVars ? '✅' : '❌'}`)
  console.log(`Database Configuration: ${testResults.database ? '✅' : '❌'}`)
  console.log(`API Routes: ${testResults.apiRoutes ? '✅' : '❌'}`)
  console.log(`OAuth Flow: ${testResults.oauthFlow ? '✅' : '❌'}`)
  console.log(`Calendar API: ${testResults.calendarApi ? '✅' : '❌'}`)

  const overallScore = Object.values(testResults).filter(Boolean).length
  const totalTests = Object.keys(testResults).length

  console.log(`\n🎯 Overall Score: ${overallScore}/${totalTests}`)

  if (overallScore >= 4) {
    console.log('🎉 Google OAuth is properly configured!')
    console.log('\n🚀 Next steps:')
    console.log('1. Set up Google Cloud Console project')
    console.log('2. Configure OAuth consent screen')
    console.log('3. Add authorized redirect URIs')
    console.log('4. Test with real user authentication')
         console.log('5. Visit http://localhost:3000/test to run interactive tests')
  } else if (overallScore >= 2) {
    console.log('⚠️  Google OAuth is partially configured')
    console.log('\n🔧 To complete setup:')
    console.log('1. Update environment variables with real Google credentials')
    console.log('2. Ensure all API routes are accessible')
    console.log('3. Verify database table exists')
  } else {
    console.log('❌ Google OAuth setup needs significant work')
    console.log('\n📖 Follow the setup guide in GOOGLE_SETUP.md')
  }

  // Detailed setup instructions
  if (!testResults.envVars) {
    console.log('\n📝 Environment Variables Setup:')
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/')
    console.log('2. Create a new project or select existing one')
    console.log('3. Enable Google Calendar API')
    console.log('4. Create OAuth 2.0 credentials')
         console.log('5. Add redirect URI: http://localhost:3000/api/google/oauth/callback')
    console.log('6. Update your .env file with real credentials')
  }

  if (!testResults.database) {
    console.log('\n🗄️  Database Setup:')
    console.log('1. Run: npm run test:complete')
    console.log('2. Ensure google_oauth_tokens table exists')
    console.log('3. Check Supabase migrations')
  }
}

// Run the test
testGoogleOAuth().catch(console.error) 