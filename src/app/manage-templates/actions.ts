'use server'
import { apiUrl } from '@/config'
import { CreateTemplateRequest, UpdateTemplateRequest } from '@/types/dto/templates.dto'

export const createNewTemplate = async (token: string, payload: CreateTemplateRequest) => {
  const resp = await fetch(`${apiUrl}/api/tasks/templates?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const { data } = await resp.json()
  return data
}

export const createSubTemplate = async (token: string, id: string, payload: CreateTemplateRequest) => {
  const resp = await fetch(`${apiUrl}/api/tasks/templates/${id}?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const { data } = await resp.json()
  return data
}

export async function deleteTemplate(token: string, templateId: string) {
  await fetch(`${apiUrl}/api/tasks/templates/${templateId}?token=${token}`, {
    method: 'DELETE',
  })
}

export async function editTemplate(token: string, templateId: string, payload: UpdateTemplateRequest) {
  await fetch(`${apiUrl}/api/tasks/templates/${templateId}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
