'use client'

import React from 'react'

const ClientErrorBoundary = ({ error }: { error: Error & { digest: string } }) => {
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
      {error.message}
    </div>
  )
}

export default ClientErrorBoundary
