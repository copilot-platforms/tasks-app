import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import { signedUrlTtl } from '@/constants/attachments'
import { CreateTemplateRequest, UpdateTemplateRequest } from '@/types/dto/templates.dto'
import { copyTemplateMediaToTask } from '@/utils/signedTemplateUrlReplacer'
import { getFilePathFromUrl, replaceImageSrc } from '@/utils/signedUrlReplacer'
import { getSignedUrl } from '@/utils/signUrl'
import { sanitize } from '@/utils/sql'
import { SupabaseActions } from '@/utils/SupabaseActions'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { Prisma } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

export class TemplatesService extends BaseService {
  async getTaskTemplates(queryFilters: { limit?: number; lastIdCursor?: string }) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.TaskTemplates)

    const findOptions: Prisma.TaskTemplateFindManyArgs = {
      where: { workspaceId: this.user.workspaceId },
      relationLoadStrategy: 'join',
      include: { workflowState: true },
      orderBy: { updatedAt: 'desc' },
    }

    if (queryFilters.limit) {
      findOptions.take = queryFilters.limit
    }

    if (queryFilters.lastIdCursor) {
      findOptions.cursor = { id: queryFilters.lastIdCursor }
      findOptions.skip = 1
    }

    return this.db.taskTemplate.findMany(findOptions)
  }

  async getAppliedTemplateDescription(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.TaskTemplates)

    const template = await this.db.taskTemplate.findFirst({
      where: { workspaceId: this.user.workspaceId, id },
    })
    if (!template) {
      throw new APIError(httpStatus.NOT_FOUND, 'Could not find template to apply')
    }
    let replacedBody
    if (template.body) {
      replacedBody = await copyTemplateMediaToTask(this.user.workspaceId, template.body)
      replacedBody = replacedBody && (await replaceImageSrc(replacedBody, getSignedUrl))
    }
    return { ...template, body: replacedBody || template.body }
  }

  async getOneTemplate(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.TaskTemplates)

    const template = await this.db.taskTemplate.findFirst({
      where: { workspaceId: this.user.workspaceId, id },
    })
    if (!template) {
      throw new APIError(httpStatus.NOT_FOUND, 'Could not find template')
    }
    return template
  }

  async createTaskTemplate(payload: CreateTemplateRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.TaskTemplates)

    // If template with same title already exists, append successive "copy" string after it
    // E.g. "hello" -> "hello copy" -> "hello copy copy"
    let title = sanitize(payload.title.trim())
    // For some reason normal parameterized string doesn't work so using Prisma.raw with sanitized strings
    const query = Prisma.sql`
      SELECT COUNT(*) AS count
      FROM "TaskTemplates"
      WHERE "title" ~ '^${Prisma.raw(`${title}`)}( copy)*$'
        AND "workspaceId" = '${Prisma.raw(`${this.user.workspaceId}`)}'
        AND "deletedAt" IS NULL;
    `
    const result = await this.db.$queryRaw<{ count: bigint }[]>`${query}`

    const count = result[0]?.count
    for (let i = 0; i < count; i++) {
      title += ' copy'
    }

    let templates = await this.db.taskTemplate.create({
      data: {
        ...payload,
        title,
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
    await this.db.scrapMedia.updateMany({
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

  async hasMoreTemplatesAfterCursor(id: string): Promise<boolean> {
    return !!(
      await this.db.taskTemplate.findMany({
        where: { workspaceId: this.user.workspaceId },
        cursor: { id },
        orderBy: { updatedAt: 'desc' },
        skip: 1,
      })
    ).length
  }
}
