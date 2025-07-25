// Comprehensive Supabase connection test
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Environment variables from .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment check:')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
console.log('Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

console.log('🔍 Starting comprehensive Supabase connection test...\n')

// Test 1: Basic connectivity
async function testBasicConnectivity() {
  console.log('1. Testing basic connectivity...')
  
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    console.log(`   Status: ${response.status}`)
    console.log(`   URL accessible: ${response.ok ? '✅ YES' : '❌ NO'}`)
    
    if (!response.ok) {
      const text = await response.text()
      console.log(`   Error details: ${text}`)
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`)
  }
}

// Test 2: Auth client initialization
async function testAuthClientInit() {
  console.log('\n2. Testing auth client initialization...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('   ✅ Supabase client created successfully')
    
    // Test getSession with timeout
    console.log('   Testing getSession() call...')
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000)
    )
    
    const sessionPromise = supabase.auth.getSession()
    
    const result = await Promise.race([sessionPromise, timeoutPromise])
    console.log('   ✅ getSession() completed:', result.error ? `Error: ${result.error.message}` : 'Success')
    
    return supabase
  } catch (error) {
    console.log(`   ❌ Auth client error: ${error.message}`)
    return null
  }
}

// Test 3: Database access with anon key
async function testDatabaseAccess(supabase) {
  console.log('\n3. Testing database access with anon key...')
  
  if (!supabase) {
    console.log('   ⚠️  Skipping - no supabase client')
    return
  }
  
  try {
    // Test basic query
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.log(`   ❌ Database query failed: ${error.message}`)
      console.log(`   Error code: ${error.code}`)
      console.log(`   Error details: ${error.details}`)
    } else {
      console.log('   ✅ Database query successful')
    }
  } catch (error) {
    console.log(`   ❌ Database access error: ${error.message}`)
  }
}

// Test 4: Service role access
async function testServiceRoleAccess() {
  console.log('\n4. Testing service role access...')
  
  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data, error } = await adminClient
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1)
    
    if (error) {
      console.log(`   ❌ Service role query failed: ${error.message}`)
    } else {
      console.log('   ✅ Service role query successful')
    }
  } catch (error) {
    console.log(`   ❌ Service role error: ${error.message}`)
  }
}

// Test 5: Check table existence
async function testTableExistence() {
  console.log('\n5. Testing table existence...')
  
  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check tables like the working script does
    const tables = ['users', 'memories', 'transcripts', 'summaries', 'chat_sessions', 'chat_messages']
    
    for (const table of tables) {
      try {
        const { error } = await adminClient
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`   ❌ Table '${table}' not accessible: ${error.message}`)
        } else {
          console.log(`   ✅ Table '${table}' exists`)
        }
      } catch (err) {
        console.log(`   ❌ Error checking table '${table}': ${err.message}`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Table check error: ${error.message}`)
  }
}

// Test 6: Auth methods
async function testAuthMethods(supabase) {
  console.log('\n6. Testing authentication methods...')
  
  if (!supabase) {
    console.log('   ⚠️  Skipping - no supabase client')
    return
  }
  
  try {
    // Test sign up with temporary email (use a proper domain)
    const testEmail = `test-${Date.now()}@gmail.com`
    const testPassword = 'TestPassword123!'
    
    console.log(`   Testing signup with: ${testEmail}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })
    
    if (signUpError) {
      console.log(`   ❌ Signup failed: ${signUpError.message}`)
    } else {
      console.log('   ✅ Signup successful (user may need email confirmation)')
      
      // Try to sign out
      await supabase.auth.signOut()
      console.log('   ✅ Sign out successful')
    }
  } catch (error) {
    console.log(`   ❌ Auth methods error: ${error.message}`)
  }
}

// Run all tests
async function runAllTests() {
  await testBasicConnectivity()
  const supabase = await testAuthClientInit()
  await testDatabaseAccess(supabase)
  await testServiceRoleAccess()
  await testTableExistence()
  await testAuthMethods(supabase)
  
  console.log('\n🏁 Connection test completed!')
}

runAllTests().catch(console.error)