export const fetchCache = 'force-no-store'

import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { ITemplate } from '@/types/interfaces'
import { PropsWithChildren } from 'react'

interface TemplatesFetcherProps extends PropsWithChildren {
  token: string
}

const getAllTemplates = async (token: string): Promise<ITemplate[]> => {
  const res = await fetch(`${apiUrl}/api/tasks/templates?token=${token}`, {
    next: { tags: ['getAllTemplates'] },
  })
  const { data } = await res.json()
  return data
}

export const TemplatesFetcher = async ({ token, children }: TemplatesFetcherProps) => {
  const templates = await getAllTemplates(token)

  return <ClientSideStateUpdate templates={templates}>{children}</ClientSideStateUpdate>
}
