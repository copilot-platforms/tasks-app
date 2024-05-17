import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { CreateAttachmentRequestSchema } from '@/types/dto/attachments.dto'
import { AttachmentsService } from '@api/attachments/attachments.service'
import httpStatus from 'http-status'
import { IdParams } from '@api/core/types/api'

export const createAttachment = async (req: NextRequest) => {
  const user = await authenticate(req)
  const data = CreateAttachmentRequestSchema.parse(await req.json())
  const attachmentsService = new AttachmentsService(user)
  const newAttachment = await attachmentsService.createAttachments(data)

  return NextResponse.json({ newAttachment }, { status: httpStatus.CREATED })
}

export const getAttachments = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const attachmentsService = new AttachmentsService(user)
  const attachments = await attachmentsService.getAttachments(id)
  return NextResponse.json({ attachments })
}

export const deleteAttachment = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const attachmentsService = new AttachmentsService(user)
  await attachmentsService.deleteAttachment(id)
  return new NextResponse(null, { status: httpStatus.NO_CONTENT })
}
