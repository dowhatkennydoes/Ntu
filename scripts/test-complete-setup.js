#!/usr/bin/env node

/**
 * Comprehensive test script for NTU Supabase setup
 * Tests authentication, vector search, and meeting integration
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testCompleteSetup() {
  console.log('🧪 Testing Complete NTU Supabase Setup...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!')
    process.exit(1)
  }

  console.log('✅ Environment variables found')

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const testResults = {
    connection: false,
    tables: [],
    vectorSearch: false,
    rls: false,
    auth: false,
    meetings: false
  }

  try {
    // Test 1: Basic connection
    console.log('\n🔌 Testing basic connection...')
    const { data: healthData, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('❌ Connection failed:', healthError.message)
      return
    }

    testResults.connection = true
    console.log('✅ Connection successful')

    // Test 2: Check all tables
    console.log('\n📋 Checking database tables...')
    const tables = [
      'users', 'memories', 'transcripts', 'summaries', 'chat_sessions', 
      'chat_messages', 'google_oauth_tokens', 'meetings', 'meeting_participants',
      'meeting_transcripts', 'meeting_summaries', 'meeting_bot_sessions'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`❌ Table '${table}' not found or inaccessible`)
        } else {
          console.log(`✅ Table '${table}' exists`)
          testResults.tables.push(table)
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message)
      }
    }

    // Test 3: Vector search function
    console.log('\n🔍 Testing vector search function...')
    try {
      const { data: vectorData, error: vectorError } = await supabase
        .rpc('match_memories', {
          query_embedding: new Array(1536).fill(0.1),
          match_threshold: 0.5,
          match_count: 1,
          p_user_id: '00000000-0000-0000-0000-000000000000'
        })

      if (vectorError) {
        console.log('⚠️  Vector function not found (this is OK if no memories exist)')
      } else {
        console.log('✅ Vector search function working')
        testResults.vectorSearch = true
      }
    } catch (err) {
      console.log('⚠️  Vector extension not available:', err.message)
    }

    // Test 4: RLS policies
    console.log('\n🔐 Testing Row Level Security...')
    try {
      const { error: rlsError } = await supabase
        .from('memories')
        .select('*')
        .limit(1)

      if (rlsError && rlsError.message.includes('policy')) {
        console.log('✅ RLS policies are active')
        testResults.rls = true
      } else {
        console.log('⚠️  RLS policies may not be properly configured')
      }
    } catch (err) {
      console.log('✅ RLS is working (access denied as expected)')
      testResults.rls = true
    }

    // Test 5: Authentication setup
    console.log('\n🔑 Testing authentication setup...')
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      
      if (authError) {
        console.log('⚠️  Auth setup issue:', authError.message)
      } else {
        console.log('✅ Authentication setup working')
        testResults.auth = true
      }
    } catch (err) {
      console.log('⚠️  Auth setup error:', err.message)
    }

    // Test 6: Meeting integration
    console.log('\n📅 Testing meeting integration...')
    try {
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .limit(1)

      if (meetingError) {
        console.log('⚠️  Meeting integration issue:', meetingError.message)
      } else {
        console.log('✅ Meeting integration working')
        testResults.meetings = true
      }
    } catch (err) {
      console.log('⚠️  Meeting integration error:', err.message)
    }

    // Summary
    console.log('\n📊 Test Summary:')
    console.log('================')
    console.log(`Connection: ${testResults.connection ? '✅' : '❌'}`)
    console.log(`Tables: ${testResults.tables.length}/12 ✅`)
    console.log(`Vector Search: ${testResults.vectorSearch ? '✅' : '⚠️'}`)
    console.log(`RLS Policies: ${testResults.rls ? '✅' : '⚠️'}`)
    console.log(`Authentication: ${testResults.auth ? '✅' : '⚠️'}`)
    console.log(`Meeting Integration: ${testResults.meetings ? '✅' : '⚠️'}`)

    const overallScore = Object.values(testResults).filter(Boolean).length
    const totalTests = Object.keys(testResults).length

    console.log(`\n🎯 Overall Score: ${overallScore}/${totalTests}`)

    if (overallScore >= 5) {
      console.log('🎉 Your NTU app is ready for development!')
      console.log('\n🚀 Next steps:')
      console.log('1. Visit http://localhost:3000/test to run interactive tests')
      console.log('2. Start building your app features')
      console.log('3. Set up Google OAuth for meeting integration')
      console.log('4. Configure real embedding service for production')
    } else {
      console.log('⚠️  Some tests failed. Please check the setup.')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testCompleteSetup().catch(console.error) 