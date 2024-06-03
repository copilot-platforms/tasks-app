import { apiUrl } from '@/config'
import { CreateTemplateRequest } from '@/types/dto/templates.dto'
import { revalidateTag } from 'next/cache'

export const createNewTemplate = async (token: string, payload: CreateTemplateRequest) => {
  await fetch(`${apiUrl}/api/tasks/templates?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  revalidateTag('getAllTemplates')
}

export async function deleteTemplate(token: string, templateId: string) {
  await fetch(`${apiUrl}/api/tasks/templates/${templateId}?token=${token}`, {
    method: 'DELETE',
  })
  revalidateTag('getAllTemplates')
}

export async function editTemplate(token: string, templateId: string, payload: CreateTemplateRequest) {
  await fetch(`${apiUrl}/api/tasks/templates/${templateId}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  revalidateTag('getAllTemplates')
}
