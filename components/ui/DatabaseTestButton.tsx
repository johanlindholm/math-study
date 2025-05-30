'use client'

import { useState } from 'react'

export function DatabaseTestButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const testDatabase = async () => {
    setStatus('loading')
    setMessage('Testing...')

    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage('DB OK')
      } else {
        setStatus('error')
        setMessage(data.error || 'DB Error')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Connection failed')
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={testDatabase}
        disabled={status === 'loading'}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          status === 'loading'
            ? 'bg-gray-400 cursor-not-allowed'
            : status === 'success'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : status === 'error'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Test Database
      </button>
      {message && (
        <span
          className={`font-medium ${
            status === 'success'
              ? 'text-green-600'
              : status === 'error'
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          {message}
        </span>
      )}
    </div>
  )
}