import DBClient from '@/lib/db'
import { CreateAttachmentRequestSchema } from '@/types/dto/attachments.dto'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { Task, Comment } from '@prisma/client'
import Bottleneck from 'bottleneck'
import fs from 'fs'
import path from 'path'

const ATTACHMENT_TAG_REGEX = /<\s*[a-zA-Z]+\s+[^>]*data-type="attachment"[^>]*src="([^"]+)"[^>]*>/g
const IMG_TAG_REGEX = /<img\s+[^>]*src="([^"]+)"[^>]*>/g

type MinimalTask = Pick<Task, 'id' | 'body' | 'createdById' | 'workspaceId'>
type MinimalComment = Pick<Comment, 'id' | 'content' | 'initiatorId' | 'workspaceId'>

interface AttachmentRequest {
  createdById: string
  workspaceId: string
  attachmentRequest: ReturnType<typeof CreateAttachmentRequestSchema.parse>
}

interface ProcessedAttachments {
  taskAttachmentRequests: AttachmentRequest[]
  commentAttachmentRequests: AttachmentRequest[]
  filesNotFoundInBucket: string[]
}

async function extractAttachmentsFromContent(
  content: string,
  supabaseActions: SupabaseActions,
  filesNotFound: string[],
): Promise<Array<{ filePath: string; fileSize?: number; fileType?: string; fileName?: string }>> {
  const attachments: Array<{ filePath: string; fileSize?: number; fileType?: string; fileName?: string }> = []
  const regexes = [IMG_TAG_REGEX, ATTACHMENT_TAG_REGEX]

  for (const regex of regexes) {
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(content)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      if (!filePath) continue
      const fileMetaData = await supabaseActions.getMetaData(filePath)
      if (!fileMetaData) {
        filesNotFound.push(filePath)
        continue
      }
      const fileName = filePath.split('/').pop()
      attachments.push({
        filePath,
        fileSize: fileMetaData.size,
        fileType: fileMetaData.contentType,
        fileName,
      })
    }
  }
  return attachments
}

async function createAttachmentRequests(tasks: MinimalTask[], comments: MinimalComment[]): Promise<ProcessedAttachments> {
  const taskAttachmentRequests: AttachmentRequest[] = []
  const commentAttachmentRequests: AttachmentRequest[] = []
  const filesNotFoundInBucket: string[] = []
  const supabaseActions = new SupabaseActions()

  for (const task of tasks) {
    const bodyString = task.body ?? ''
    const attachments = await extractAttachmentsFromContent(bodyString, supabaseActions, filesNotFoundInBucket)
    for (const attachment of attachments) {
      taskAttachmentRequests.push({
        createdById: task.createdById,
        workspaceId: task.workspaceId,
        attachmentRequest: CreateAttachmentRequestSchema.parse({
          taskId: task.id,
          ...attachment,
        }),
      })
    }
  }

  for (const comment of comments) {
    const contentString = comment.content ?? ''
    const attachments = await extractAttachmentsFromContent(contentString, supabaseActions, filesNotFoundInBucket)
    for (const attachment of attachments) {
      commentAttachmentRequests.push({
        createdById: comment.initiatorId,
        workspaceId: comment.workspaceId,
        attachmentRequest: CreateAttachmentRequestSchema.parse({
          commentId: comment.id,
          ...attachment,
        }),
      })
    }
  }

  if (taskAttachmentRequests.length) {
    console.info('🔥 Task attachments to be populated:', taskAttachmentRequests.length)
  }
  if (commentAttachmentRequests.length) {
    console.info('🔥 Comment attachments to be populated:', commentAttachmentRequests.length)
  }
  if (filesNotFoundInBucket.length) {
    console.warn('⚠️  Files not found in bucket:', filesNotFoundInBucket.length)
    const csvContent = 'filePath\n' + filesNotFoundInBucket.map((f) => `"${f.replace(/"/g, '""')}"`).join('\n')

    const outputPath = path.join(process.cwd(), 'files_not_found.csv')
    fs.writeFileSync(outputPath, csvContent)

    console.log(`📄 CSV written to ${outputPath}`)
  }

  return { taskAttachmentRequests, commentAttachmentRequests, filesNotFoundInBucket }
}

async function createAttachmentsInDatabase(
  db: ReturnType<typeof DBClient.getInstance>,
  attachmentRequests: AttachmentRequest[],
) {
  let created = 0
  let skippedCount = 0

  const dbBottleneck = new Bottleneck({ minTime: 200, maxConcurrent: 50 })
  const createPromises = []
  const failedRequests: AttachmentRequest[] = []

  for (const { createdById, workspaceId, attachmentRequest } of attachmentRequests) {
    const existing = await db.attachment.findFirst({
      where: { filePath: attachmentRequest.filePath },
    })
    if (existing) {
      skippedCount++
      continue
    }

    const createPromise = dbBottleneck.schedule(async () => {
      try {
        await db.attachment.create({
          data: {
            ...attachmentRequest,
            createdById,
            workspaceId,
          },
        })
        created++
        console.info(
          `✨ Created attachment ${created}/${attachmentRequests.length - skippedCount}: ${attachmentRequest.fileName}`,
        )
        return
      } catch (error) {
        console.error('Failed to create attachment.', attachmentRequest)
        failedRequests.push({
          attachmentRequest,
          createdById,
          workspaceId,
        })
        return false
      }
    })

    createPromises.push(createPromise)
  }
  await Promise.all(createPromises)
  writeFailedRequestsToCSV(failedRequests)
  console.info(`📊 Created: ${created}`)
}

async function run() {
  console.info('🧑🏻‍💻 Backfilling attachment entries for tasks and comments')

  const db = DBClient.getInstance()
  const [tasks, comments] = await Promise.all([
    db.task.findMany({
      select: {
        id: true,
        body: true,
        createdById: true,
        workspaceId: true,
      },
    }),
    db.comment.findMany({
      select: {
        id: true,
        content: true,
        initiatorId: true,
        workspaceId: true,
      },
    }),
  ])

  const { taskAttachmentRequests, commentAttachmentRequests } = await createAttachmentRequests(tasks, comments)

  await createAttachmentsInDatabase(db, [...taskAttachmentRequests, ...commentAttachmentRequests])

  console.info('✅ Backfill complete')
}

run()

export const writeFailedRequestsToCSV = (failedRequests: AttachmentRequest[], fileName = 'failed_requests.csv') => {
  if (!failedRequests.length) return

  const headers = ['createdById', 'workspaceId', 'taskId', 'commentId', 'filePath', 'fileSize', 'fileType', 'fileName']

  const csvLines = failedRequests.map((req) => {
    const { createdById, workspaceId, attachmentRequest } = req
    return [
      createdById,
      workspaceId,
      attachmentRequest.taskId ?? '',
      attachmentRequest.commentId ?? '',
      attachmentRequest.filePath,
      attachmentRequest.fileSize,
      attachmentRequest.fileType,
      attachmentRequest.fileName,
    ]
      .map((v) => `"${v}"`)
      .join(',')
  })

  const csvContent = [headers.join(','), ...csvLines].join('\n')

  fs.writeFileSync(fileName, csvContent, { encoding: 'utf-8' })
  console.log(`✅ Failed requests written to ${fileName}`)
}
