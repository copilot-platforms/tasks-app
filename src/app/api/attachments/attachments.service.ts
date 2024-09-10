import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { UserAction } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { z } from 'zod'
import { supabaseBucket } from '@/config'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { SupabaseService } from '@api/core/services/supabase.service'

export class AttachmentsService extends BaseService {
  async getAttachments(taskId: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Attachments)
    const attachments = await this.db.attachment.findMany({
      where: {
        taskId: taskId,
        workspaceId: this.user.workspaceId,
      },
    })

    return attachments
  }

  async createAttachments(data: CreateAttachmentRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Attachments)
    const newAttachment = await this.db.attachment.create({
      data: {
        ...data,
        createdById: z.string().parse(this.user.internalUserId),
        workspaceId: this.user.workspaceId,
      },
    })
    return newAttachment
  }

  async createMultipleAttachments(data: CreateAttachmentRequest[]) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Attachments)
    const userId = z.string().parse(this.user.internalUserId)
    const newAttachments = await this.db.$transaction(async (prisma) => {
      const createPromises = data.map((attachmentData) =>
        prisma.attachment.create({
          data: {
            ...attachmentData,
            createdById: userId,
            workspaceId: this.user.workspaceId,
          },
        }),
      )
      return await Promise.all(createPromises)
    })
    return newAttachments
  }

  async deleteAttachment(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Attachments)
    const deletedAttachment = await this.db.attachment.delete({ where: { id: id, workspaceId: this.user.workspaceId } })
    return deletedAttachment
  }

  async signUrlUpload(fileName: string) {
    const policyGate = new PoliciesService(this.user)
    const supabase = new SupabaseService()
    policyGate.authorize(UserAction.Create, Resource.Attachments)
    const { data, error } = await supabase.supabase.storage.from(supabaseBucket).createSignedUploadUrl(fileName)
    if (error) {
      throw new APIError(httpStatus.BAD_REQUEST)
    }
    return data
  }

  async getSignedUrl(filePath: string) {
    console.log('hit')
    const policyGate = new PoliciesService(this.user)
    const supabase = new SupabaseService()
    policyGate.authorize(UserAction.Create, Resource.Attachments)
    const { data, error } = await supabase.supabase.storage.from(supabaseBucket).createSignedUrl(filePath, 60) // only 60 seconds expiry time here for testing purposes
    console.log(data)
    if (error) {
      console.log(error)
      throw new APIError(httpStatus.BAD_REQUEST)
    }

    return data.signedUrl
  }
}
