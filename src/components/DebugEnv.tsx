'use client'

import { useState, useEffect } from 'react'

export default function DebugEnv() {
  const [envVars, setEnvVars] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        const response = await fetch('/api/debug-env')
        const data = await response.json()
        setEnvVars(data)
      } catch (error) {
        console.error('Error fetching env vars:', error)
        setEnvVars({ error: 'Failed to fetch environment variables' })
      } finally {
        setLoading(false)
      }
    }

    fetchEnvVars()
  }, [])

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold mb-2">Environment Variables Debug:</h3>
      {loading ? (
        <p>Loading environment variables...</p>
      ) : (
        <pre className="text-sm">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      )}
    </div>
  )
} 