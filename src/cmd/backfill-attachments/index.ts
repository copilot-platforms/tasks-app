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

const LOG_EVERY = 500

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
  const metaLimiter = new Bottleneck({
    maxConcurrent: 20,
    minTime: 50,
  })

  const matches: string[] = []
  const regexes = [IMG_TAG_REGEX, ATTACHMENT_TAG_REGEX]

  for (const regex of regexes) {
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1])
    }
  }

  const attachmentPromises = matches.map((originalSrc) =>
    metaLimiter.schedule(async () => {
      const filePath = getFilePathFromUrl(originalSrc)
      if (!filePath) return null

      const meta = await supabaseActions.getMetaData(filePath)
      if (!meta) {
        filesNotFound.push(filePath)
        return null
      }

      return {
        filePath,
        fileSize: meta.size,
        fileType: meta.contentType,
        fileName: filePath.split('/').pop(),
      }
    }),
  )

  const results = await Promise.all(attachmentPromises)
  return results.filter(Boolean) as any[]
}
async function createAttachmentRequests(tasks: MinimalTask[], comments: MinimalComment[]): Promise<ProcessedAttachments> {
  const itemLimiter = new Bottleneck({
    maxConcurrent: 10,
  })
  let processedTasks = 0
  let processedComments = 0
  const taskAttachmentRequests: AttachmentRequest[] = []
  const commentAttachmentRequests: AttachmentRequest[] = []
  const filesNotFoundInBucket: string[] = []
  const supabaseActions = new SupabaseActions()

  const processTask = async (task: MinimalTask) => {
    const attachments = await extractAttachmentsFromContent(task.body ?? '', supabaseActions, filesNotFoundInBucket)

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
    processedTasks++
    if (processedTasks % LOG_EVERY === 0) {
      console.info(`⏳ Tasks processed: ${processedTasks}/${tasks.length}`)
    }
  }

  const processComment = async (comment: MinimalComment) => {
    const attachments = await extractAttachmentsFromContent(comment.content ?? '', supabaseActions, filesNotFoundInBucket)

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
    processedComments++
    if (processedComments % LOG_EVERY === 0) {
      console.info(`⏳ Comments processed: ${processedComments}/${comments.length}`)
    }
  }

  await Promise.all([
    ...tasks.map((t) => itemLimiter.schedule(() => processTask(t))),
    ...comments.map((c) => itemLimiter.schedule(() => processComment(c))),
  ])

  console.info('🔥 Task attachments:', taskAttachmentRequests.length)
  console.info('🔥 Comment attachments:', commentAttachmentRequests.length)

  if (filesNotFoundInBucket.length) {
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
  const failedRequests: AttachmentRequest[] = []

  console.info(`🔍 Checking for existing attachments...`)

  const filePaths = attachmentRequests.map((req) => req.attachmentRequest.filePath)

  const existingAttachments = await db.attachment.findMany({
    where: {
      filePath: {
        in: filePaths,
      },
    },
    select: {
      filePath: true,
    },
  })

  const existingFilePathsSet = new Set(existingAttachments.map((a) => a.filePath))

  console.info(`✅ Found ${existingAttachments.length} existing attachments, will skip these`)

  const newAttachmentRequests = attachmentRequests.filter((req) => {
    const exists = existingFilePathsSet.has(req.attachmentRequest.filePath)
    if (exists) skippedCount++
    return !exists
  })

  console.info(`📝 Creating ${newAttachmentRequests.length} new attachments...`)

  const dbBottleneck = new Bottleneck({
    maxConcurrent: 100,
    minTime: 5,
  })

  const createPromises = newAttachmentRequests.map(({ createdById, workspaceId, attachmentRequest }, index) =>
    dbBottleneck.schedule(async () => {
      try {
        await db.attachment.create({
          data: {
            ...attachmentRequest,
            createdById,
            workspaceId,
          },
        })
        created++

        if (created % 100 === 0) {
          console.info(` Progress: ${created}/${newAttachmentRequests.length} attachments created`)
        }

        return true
      } catch (error) {
        console.error('Failed to create attachment.', attachmentRequest, error)
        failedRequests.push({
          attachmentRequest,
          createdById,
          workspaceId,
        })
        return false
      }
    }),
  )

  await Promise.all(createPromises)

  if (failedRequests.length > 0) {
    writeFailedRequestsToCSV(failedRequests)
  }

  console.info(`📊 Summary:`)
  console.info(`✅ Created: ${created}`)
  console.info(`⏭️  Skipped (already exist): ${skippedCount}`)
  console.info(`❌ Failed: ${failedRequests.length}`)
}

async function run() {
  console.info('🧑🏻‍💻 Backfilling attachment entries for tasks and comments')

  const db = DBClient.getInstance()

  const BATCH_SIZE = 5000
  const allTasks: MinimalTask[] = []
  const allComments: MinimalComment[] = []

  console.info('📥 Fetching tasks in batches...')
  let lastTaskId: string | undefined = undefined
  let taskBatchCount = 0

  while (true) {
    const tasks: MinimalTask[] = await db.task.findMany({
      take: BATCH_SIZE,
      ...(lastTaskId && { skip: 1, cursor: { id: lastTaskId } }),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        body: true,
        createdById: true,
        workspaceId: true,
      },
    })

    if (tasks.length === 0) break

    allTasks.push(...tasks)
    lastTaskId = tasks[tasks.length - 1].id
    taskBatchCount++
    console.info(`✅ Fetched task batch ${taskBatchCount} (${tasks.length} tasks) - Total: ${allTasks.length}`)
  }

  console.info('📥 Fetching comments in batches...')
  let lastCommentId: string | undefined = undefined
  let commentBatchCount = 0

  while (true) {
    const comments: MinimalComment[] = await db.comment.findMany({
      take: BATCH_SIZE,
      ...(lastCommentId && { skip: 1, cursor: { id: lastCommentId } }),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        content: true,
        initiatorId: true,
        workspaceId: true,
      },
    })

    if (comments.length === 0) break

    allComments.push(...comments)
    lastCommentId = comments[comments.length - 1].id
    commentBatchCount++
    console.info(
      `✅ Fetched comment batch ${commentBatchCount} (${comments.length} comments) - Total: ${allComments.length}`,
    )
  }

  console.info(`Total fetched: ${allTasks.length} tasks and ${allComments.length} comments`)

  console.info('Creating attachment requests.')
  const { taskAttachmentRequests, commentAttachmentRequests } = await createAttachmentRequests(allTasks, allComments)

  console.info('Creating attachments in database.')
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
