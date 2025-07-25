'use client'

import { useState, useEffect } from 'react'
import { authManager, signUp, signIn, signOut, getCurrentUser, isAuthenticated } from '@/lib/supabase-auth'
import { searchSimilarMemories, createMemoryWithEmbedding } from '@/lib/supabase-vector-search'

export default function AuthTest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [testResults, setTestResults] = useState<any>({})

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    await authManager.initialize()
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { user, error } = await signUp({ email, password })
    
    if (error) {
      setMessage(`Sign up error: ${error.message}`)
    } else {
      setMessage('Sign up successful! Check your email for confirmation.')
      setUser(user)
    }
    
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { user, error } = await signIn({ email, password })
    
    if (error) {
      setMessage(`Sign in error: ${error.message}`)
    } else {
      setMessage('Sign in successful!')
      setUser(user)
    }
    
    setLoading(false)
  }

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await signOut()
    
    if (error) {
      setMessage(`Sign out error: ${error.message}`)
    } else {
      setMessage('Signed out successfully!')
      setUser(null)
    }
    
    setLoading(false)
  }

  const runDatabaseTests = async () => {
    if (!user) {
      setMessage('Please sign in first to run database tests')
      return
    }

    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Create a test memory
      const testMemory = {
        user_id: user.id,
        content: 'This is a test memory for authentication testing',
        embedding: new Array(1536).fill(0.1), // Test embedding
        source_app: 'auth-test',
        source_type: 'test',
        confidence_score: 0.9,
        intent_label: 'test'
      }

      const createdMemory = await createMemoryWithEmbedding(testMemory)
      results.memoryCreation = { success: true, data: createdMemory }

      // Test 2: Search for similar memories
      const similarMemories = await searchSimilarMemories(
        new Array(1536).fill(0.1),
        user.id,
        0.5,
        5
      )
      results.vectorSearch = { success: true, data: similarMemories }

      // Test 3: Test RLS policies
      const { data: userMemories, error: rlsError } = await fetch('/api/test-rls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      }).then(res => res.json())

      results.rlsTest = { success: !rlsError, data: userMemories, error: rlsError }

      setTestResults(results)
      setMessage('All database tests completed successfully!')

    } catch (error) {
      console.error('Database test error:', error)
      setMessage(`Database test error: ${error}`)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Supabase Authentication Test</h1>
      
      {/* Current User Status */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current Status</h2>
        {user ? (
          <div>
            <p><strong>Authenticated:</strong> Yes</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <p><strong>Authenticated:</strong> No</p>
        )}
      </div>

      {/* Authentication Forms */}
      {!user ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sign Up */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Sign Up
              </button>
            </form>
          </div>

          {/* Sign In */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Sign In</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Database Tests */
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Database Tests</h2>
          <button
            onClick={runDatabaseTests}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Run Database Tests
          </button>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {Object.entries(testResults).map(([test, result]: [string, any]) => (
              <div key={test} className="border p-4 rounded">
                <h3 className="font-semibold capitalize">{test.replace(/([A-Z])/g, ' $1')}</h3>
                <p className="text-sm text-gray-600">
                  Status: {result.success ? '✅ Success' : '❌ Failed'}
                </p>
                {result.error && (
                  <p className="text-sm text-red-600">Error: {result.error}</p>
                )}
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600">View Data</summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 