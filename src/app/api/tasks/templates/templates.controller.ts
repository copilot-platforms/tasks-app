import { CreateTemplateRequestSchema, UpdateTemplateRequestSchema } from '@/types/dto/templates.dto'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { TemplatesService } from '@api/tasks/templates/templates.service'
import httpStatus from 'http-status'
import { NextRequest, NextResponse } from 'next/server'

export const getTaskTemplates = async (req: NextRequest) => {
  const user = await authenticate(req)

  const templatesService = new TemplatesService(user)
  const data = await templatesService.getTaskTemplates()

  return NextResponse.json({ data })
}

export const createTaskTemplate = async (req: NextRequest) => {
  const user = await authenticate(req)

  const payload = CreateTemplateRequestSchema.parse(await req.json())
  const templatesService = new TemplatesService(user)
  const data = await templatesService.createTaskTemplate(payload)

  return NextResponse.json({ data })
}

export const updateTaskTemplate = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const payload = UpdateTemplateRequestSchema.parse(await req.json())
  const templatesService = new TemplatesService(user)
  const data = await templatesService.updateTaskTemplate(id, payload)

  return NextResponse.json({ data })
}

export const deleteTaskTemplate = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const templatesService = new TemplatesService(user)
  await templatesService.deleteTaskTemplate(id)

  return new NextResponse(null, { status: httpStatus.NO_CONTENT })
}
