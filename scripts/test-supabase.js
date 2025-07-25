#!/usr/bin/env node

/**
 * Test script to verify Supabase setup
 * Run with: node scripts/test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testSupabase() {
  console.log('🧪 Testing Supabase Setup...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.log('Please set:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  console.log('✅ Environment variables found')

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

    console.log('✅ Connection successful')

    // Test 2: Check if tables exist
    console.log('\n📋 Checking database tables...')
    const tables = [
      'users',
      'memories',
      'transcripts',
      'summaries',
      'chat_sessions',
      'chat_messages',
      'google_oauth_tokens',
      'meetings',
      'meeting_participants',
      'meeting_transcripts',
      'meeting_summaries',
      'meeting_bot_sessions'
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
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message)
      }
    }

    // Test 3: Check vector extension
    console.log('\n🔍 Checking vector extension...')
    try {
      const { data: vectorData, error: vectorError } = await supabase
        .rpc('match_memories', {
          query_embedding: new Array(1536).fill(0.1),
          match_threshold: 0.5,
          match_count: 1,
          user_id: '00000000-0000-0000-0000-000000000000'
        })

      if (vectorError) {
        console.log('⚠️  Vector function not found (this is OK if no memories exist)')
      } else {
        console.log('✅ Vector search function working')
      }
    } catch (err) {
      console.log('⚠️  Vector extension not available:', err.message)
    }

    // Test 4: Check RLS policies
    console.log('\n🔐 Checking Row Level Security...')
    try {
      // This should fail due to RLS (no authenticated user)
      const { error: rlsError } = await supabase
        .from('memories')
        .select('*')
        .limit(1)

      if (rlsError && rlsError.message.includes('policy')) {
        console.log('✅ RLS policies are active')
      } else {
        console.log('⚠️  RLS policies may not be properly configured')
      }
    } catch (err) {
      console.log('✅ RLS is working (access denied as expected)')
    }

    console.log('\n🎉 Supabase setup test completed!')
    console.log('\n📝 Next steps:')
    console.log('1. Set up authentication in your app')
    console.log('2. Test with a real user session')
    console.log('3. Verify vector search with actual embeddings')
    console.log('4. Test meeting integration features')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testSupabase().catch(console.error) 