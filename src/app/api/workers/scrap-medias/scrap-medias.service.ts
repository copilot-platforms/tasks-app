import { subWeeks, isBefore, subMinutes } from 'date-fns'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket, ScrapImageExpiryPeriod } from '@/config'
import { PrismaClient, ScrapMedia } from '@prisma/client'
import DBClient from '@/lib/db'
import APIError from '@/app/api/core/exceptions/api'
import { z } from 'zod'

export class ScrapMediaService {
  async removeScrapMedias() {
    const expiryPeriod = new Date(Date.now() - z.number().parse(ScrapImageExpiryPeriod))

    const db: PrismaClient = DBClient.getInstance()
    const scrapMedias = await db.scrapMedia.findMany({
      where: {
        updatedAt: {
          lt: expiryPeriod,
        },
      },
      // Putting a buffer of 0.5s for each deletion (which should be more than very enough), we take 600 records at a time
      // for each worker
      take: 600,
    })
    const supabase = new SupabaseService()

    const taskIds = scrapMedias.map((image) => image.taskId).filter((taskId): taskId is string => taskId !== null)

    const templateIds = scrapMedias
      .map((image) => image.templateId)
      .filter((templateId): templateId is string => templateId !== null)

    const tasks = taskIds.length
      ? await db.task.findMany({
          where: {
            id: { in: taskIds },
          },
        })
      : []

    const taskTemplates =
      templateIds.length > 0
        ? await db.taskTemplate.findMany({
            where: {
              id: { in: templateIds },
            },
          })
        : []

    const scrapMediasToDelete = []
    const scrapMediasToDeleteFromBucket = []

    for (const image of scrapMedias) {
      try {
        // For each scrap image, check if the task or taskTemplate still has the img url in its body
        const task = tasks.find((_task) => _task.id === image.taskId)
        const taskTemplate = taskTemplates.find((_template) => _template.id === image.templateId)

        const isInTaskBody = task && (task.body || '').includes(image.filePath)
        const isInTemplateBody = taskTemplate && (taskTemplate.body || '').includes(image.filePath)

        if (!task && !taskTemplate) {
          console.error('Could not find task for scrap image', image)
          scrapMediasToDelete.push(image.id)
          scrapMediasToDeleteFromBucket.push(image.filePath)
          continue
        }
        // If image is in task body
        if (isInTaskBody || isInTemplateBody) {
          scrapMediasToDelete.push(image.id)
          continue
        }
        // If image is not in task body

        scrapMediasToDeleteFromBucket.push(image.filePath)
        scrapMediasToDelete.push(image.id)
      } catch (e: unknown) {
        console.error('Error processing scrap image', e)
      }
    }
    if (scrapMediasToDeleteFromBucket.length !== 0) {
      const { error } = await supabase.supabase.storage.from(supabaseBucket).remove(scrapMediasToDeleteFromBucket)
      if (error) {
        console.error(error)
        throw new APIError(404, 'unable to delete some date from supabase')
      }
      await db.attachment.deleteMany({ where: { filePath: { in: scrapMediasToDeleteFromBucket } } })
    }
    if (scrapMediasToDelete.length !== 0) {
      const idsToDelete = scrapMediasToDelete.map((id) => `'${id}'`).join(', ')
      await db.$executeRawUnsafe(`
        DELETE FROM "ScrapMedias"
        WHERE "id" IN (${idsToDelete})
      `)
    }
  }
}
