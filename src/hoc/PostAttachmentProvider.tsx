'use client'

import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import React, { createContext, useContext } from 'react'

type AttachmentContextType = {
  postAttachment: (payload: CreateAttachmentRequest) => Promise<void>
}

const AttachmentContext = createContext<AttachmentContextType | null>(null)

export function usePostAttachment() {
  const context = useContext(AttachmentContext)

  if (!context) {
    throw new Error('useAttachment must be used within <AttachmentProvider>')
  }

  return context
}

export function AttachmentProvider({
  postAttachment,
  children,
}: {
  postAttachment: AttachmentContextType['postAttachment']
  children: React.ReactNode
}) {
  return <AttachmentContext.Provider value={{ postAttachment }}>{children}</AttachmentContext.Provider>
}
