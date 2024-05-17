import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import {
  CreateAttachmentRequest,
  CreateAttachmentRequestSchema,
  CustomUploadBodySchema,
  CustomUploadPayloadSchema,
} from '@/types/dto/attachments.dto'
import { AttachmentsService } from '@api/attachments/attachments.service'
import httpStatus from 'http-status'
import { IdParams } from '@api/core/types/api'
import APIError from '../core/exceptions/api'

export const createAttachment = async (req: NextRequest) => {
  const user = await authenticate(req)
  console.log(user)
  const body = CreateAttachmentRequestSchema.parse(await req.json())
  const attachmentsService = new AttachmentsService(user)
  const newAttachment = await attachmentsService.createAttachments(body)
  return NextResponse.json(newAttachment)
}

export const getAttachments = async (req: NextRequest) => {
  const taskId = req.nextUrl.searchParams.get('taskId')
  if (!taskId) {
    throw new APIError(httpStatus.BAD_REQUEST)
  }
  const user = await authenticate(req)
  const attachmentsService = new AttachmentsService(user)
  const attachments = await attachmentsService.getAttachments(taskId)
  return NextResponse.json({ attachments })
}

export const deleteAttachment = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const attachmentsService = new AttachmentsService(user)
  await attachmentsService.deleteAttachment(id)
  return new NextResponse(null, { status: httpStatus.NO_CONTENT })
}
