'use client'

import { useState, useEffect } from 'react'

export default function SimpleTest() {
  const [message, setMessage] = useState('Initial state')

  useEffect(() => {
    setMessage('Client-side JavaScript is working!')
  }, [])

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded">
      <h3 className="font-bold mb-2">Simple Test:</h3>
      <p>{message}</p>
    </div>
  )
} 