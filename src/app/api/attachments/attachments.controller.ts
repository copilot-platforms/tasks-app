import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { CreateAttachmentRequest, CreateAttachmentRequestSchema } from '@/types/dto/attachments.dto'
import { AttachmentsService } from '@api/attachments/attachments.service'
import httpStatus from 'http-status'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { IdParams } from '@api/core/types/api'

export const createAttachment = async (request: NextRequest) => {
  const user = await authenticate(request)
  const body = (await request.json()) as HandleUploadBody
  const attachmentsService = new AttachmentsService(user)
  const fileUploadResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
      if (!user.internalUserId) {
        throw new Error('Not authorized')
      }
      return {
        tokenPayload: JSON.stringify({
          data: clientPayload,
        }),
      }
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const data: CreateAttachmentRequest = {
        taskId: tokenPayload && JSON.parse(JSON.parse(tokenPayload).data).taskId,
        url: blob.url,
      }
      await attachmentsService.createAttachments(data)
    },
  })

  return NextResponse.json(fileUploadResponse)
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
