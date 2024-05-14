import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { CreateAttachmentRequest, CustomUploadBodySchema, CustomUploadPayloadSchema } from '@/types/dto/attachments.dto'
import { AttachmentsService } from '@api/attachments/attachments.service'
import httpStatus from 'http-status'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { IdParams, TaskIdParams } from '@api/core/types/api'
import APIError from '../core/exceptions/api'

export const createAttachment = async (request: NextRequest) => {
  const user = await authenticate(request)
  const body = CustomUploadBodySchema.parse(await request.json()) as HandleUploadBody
  const attachmentsService = new AttachmentsService(user)

  const fileUploadResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
      if (!user.internalUserId) {
        throw new APIError(httpStatus.UNAUTHORIZED, 'User not authorized to create an attachment')
      }
      return {
        tokenPayload: JSON.stringify({
          data: clientPayload,
        }),
      }
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const data: CreateAttachmentRequest = {
        taskId: tokenPayload && JSON.parse(CustomUploadPayloadSchema.parse(JSON.parse(tokenPayload))?.data)?.taskId,
        url: blob.url,
      }
      await attachmentsService.createAttachments(data)
    },
  })

  return NextResponse.json(fileUploadResponse, { status: httpStatus.CREATED })
}

export const getAttachments = async (req: NextRequest, { params: { taskId } }: TaskIdParams) => {
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
