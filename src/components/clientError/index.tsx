'use client'

import React from 'react'

//used to throw custom error message
const ClientError = ({ message }: { message: string }) => {
  if (!message) {
    return null
  }
  throw new Error(message)
}

export default ClientError
