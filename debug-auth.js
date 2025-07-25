// Quick debug script to test Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://chtzfqiigqaterznidnp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodHpmcWlpZ3FhdGVyem5pZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MTUyNTUsImV4cCI6MjA0ODI5MTI1NX0.3qXVAU-HrQrMU5_3yZdA3DPjymnKE0iJkqMYJaTCJ7I'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    console.log('Session check:', error ? `Error: ${error.message}` : 'Success')
    
    // Test database connection
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    console.log('Database check:', dbError ? `Error: ${dbError.message}` : 'Success')
    
  } catch (error) {
    console.error('Connection test failed:', error.message)
  }
}

testConnection()