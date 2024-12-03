import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import { signedUrlTtl } from '@/constants/attachments'
import { CreateTemplateRequest, UpdateTemplateRequest } from '@/types/dto/templates.dto'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { z } from 'zod'

export class TemplatesService extends BaseService {
  async getTaskTemplates() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.findMany({
      where: { workspaceId: this.user.workspaceId },
      relationLoadStrategy: 'join',
      include: { workflowState: true },
      orderBy: { updatedAt: 'desc' },
    })
    return templates
  }

  async createTaskTemplate(payload: CreateTemplateRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.create({
      data: {
        ...payload,
        workspaceId: this.user.workspaceId,
        createdById: z.string().parse(this.user.internalUserId),
      },
    })
    if (templates.body) {
      const newBody = await this.updateTaskIdOfAttachmentsAfterCreation(templates.body, templates.id)
      await this.db.taskTemplate.update({
        where: { id: templates.id },
        data: {
          body: newBody,
        },
      })
    } //updating storage path, url of attachments after template creation
    return templates
  }

  async updateTaskTemplate(id: string, payload: UpdateTemplateRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.TaskTemplates)

    let template = await this.db.taskTemplate.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: payload,
    })
    return template
  }

  async deleteTaskTemplate(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.TaskTemplates)

    let template = await this.db.taskTemplate.delete({
      where: { id, workspaceId: this.user.workspaceId },
    })
    return template
  }

  private async updateTaskIdOfAttachmentsAfterCreation(htmlString: string, template_id: string) {
    const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g //expression used to match all img srcs in provided HTML string.
    const attachmentTagRegex = /<\s*[a-zA-Z]+\s+[^>]*data-type="attachment"[^>]*src="([^"]+)"[^>]*>/g //expression used to match all attachment srcs in provided HTML string.
    let match
    const replacements: { originalSrc: string; newUrl: string }[] = []

    const newFilePaths: { originalSrc: string; newFilePath: string }[] = []
    const copyAttachmentPromises: Promise<void>[] = []
    const matches: { originalSrc: string; filePath: string; fileName: string }[] = []

    while ((match = imgTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    while ((match = attachmentTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    for (const { originalSrc, filePath, fileName } of matches) {
      const newFilePath = `${this.user.workspaceId}/templates/${template_id}/${fileName}`
      const supabaseActions = new SupabaseActions()
      copyAttachmentPromises.push(supabaseActions.moveAttachment(filePath, newFilePath))
      newFilePaths.push({ originalSrc, newFilePath })
    }

    await Promise.all(copyAttachmentPromises)

    const signedUrlPromises = newFilePaths.map(async ({ originalSrc, newFilePath }) => {
      const newUrl = await this.getSignedUrl(newFilePath)
      if (newUrl) {
        replacements.push({ originalSrc, newUrl })
      }
    })

    await Promise.all(signedUrlPromises)

    for (const { originalSrc, newUrl } of replacements) {
      htmlString = htmlString.replace(originalSrc, newUrl)
    }
    const filePaths = newFilePaths.map(({ newFilePath }) => newFilePath)
    await this.db.scrapImage.updateMany({
      where: {
        filePath: {
          in: filePaths,
        },
      },
      data: {
        taskId: template_id,
      },
    })
    return htmlString
  }

  private async getSignedUrl(filePath: string) {
    const supabase = new SupabaseService()
    const { data } = await supabase.supabase.storage.from(supabaseBucket).createSignedUrl(filePath, signedUrlTtl)

    const url = data?.signedUrl

    return url
  } // used to replace urls for images in template body
}
