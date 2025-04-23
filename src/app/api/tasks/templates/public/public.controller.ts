import { IdParams } from '@/app/api/core/types/api'
import authenticate from '@/app/api/core/utils/authenticate'
import { PublicTemplateSerializer } from '@/app/api/tasks/templates/public/public.serializer'
import { TemplatesService } from '@/app/api/tasks/templates/templates.service'
import { NextRequest, NextResponse } from 'next/server'

export const getTaskTemplatesPublic = async (req: NextRequest) => {
  const user = await authenticate(req)
  const nextToken = req.nextUrl.searchParams.get('nextToken') || undefined // implement token based pagination here
  const templateService = new TemplatesService(user)
  const templates = await templateService.getTaskTemplates()
  return NextResponse.json({ data: PublicTemplateSerializer.serialize(templates) })
}

export const getTaskTemplatePublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const templatesService = new TemplatesService(user)
  const template = await templatesService.getOneTemplate(id)
  return NextResponse.json({ ...PublicTemplateSerializer.serialize(template) })
}
