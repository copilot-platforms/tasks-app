'use client'

import { isProd } from '@/config'
import React from 'react'

const ClientErrorBoundary = ({ error }: { error: Error & { digest: string } }) => {
  const errorMessage =
    error.message === 'Please provide a Valid Token' ? error.message : isProd ? 'Something went wrong' : error.message
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        marginTop: '20vh',
        justifyContent: 'center',
        fontSize: 'clamp(20px, 4vw, 42px)',
        fontFamily: 'monospace',
      }}
    >
      {errorMessage}
    </div>
  )
}

export default ClientErrorBoundary
