'use client'

import React from 'react'

const getErrorMessage = (error: Error & { digest: string }) => {
  if (error.message) {
    return error.message
  }
  return 'Something went wrong'
}

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
      {getErrorMessage(error)}
    </div>
  )
}

export default ClientErrorBoundary
