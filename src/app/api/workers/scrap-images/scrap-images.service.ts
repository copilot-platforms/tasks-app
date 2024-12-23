import { subWeeks, isBefore, subMinutes } from 'date-fns'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { ScrapImageExpiryPeriod, supabaseBucket } from '@/config'
import { PrismaClient, ScrapImage } from '@prisma/client'
import DBClient from '@/lib/db'
import APIError from '@/app/api/core/exceptions/api'
import { z } from 'zod'

export class ScrapImageService {
  async removeScrapImages() {
    const expiryPeriod = new Date(Date.now() - z.number().parse(ScrapImageExpiryPeriod))

    const db: PrismaClient = DBClient.getInstance()
    const scrapImages = await db.scrapImage.findMany({
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

    const taskIds = scrapImages.map((image) => image.taskId).filter((taskId): taskId is string => taskId !== null)

    const templateIds = scrapImages
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

    const scrapImagesToDelete = []
    const scrapImagesToDeleteFromBucket = []

    for (const image of scrapImages) {
      try {
        // For each scrap image, check if the task or taskTemplate still has the img url in its body
        const task = tasks.find((_task) => _task.id === image.taskId)
        const taskTemplate = taskTemplates.find((_template) => _template.id === image.templateId)

        const isInTaskBody = task && (task.body || '').includes(image.filePath)
        const isInTemplateBody = taskTemplate && (taskTemplate.body || '').includes(image.filePath)

        if (!task && !taskTemplate) {
          console.error('Could not find task for scrap image', image)
          scrapImagesToDelete.push(image.id)
          scrapImagesToDeleteFromBucket.push(image.filePath)
          continue
        }
        // If image is in task body
        if (isInTaskBody || isInTemplateBody) {
          scrapImagesToDelete.push(image.id)
          continue
        }
        // If image is not in task body

        scrapImagesToDeleteFromBucket.push(image.filePath)
        scrapImagesToDelete.push(image.id)
      } catch (e: unknown) {
        console.error('Error processing scrap image', e)
      }
    }
    if (scrapImagesToDeleteFromBucket.length !== 0) {
      const { error } = await supabase.supabase.storage.from(supabaseBucket).remove(scrapImagesToDeleteFromBucket)
      if (error) {
        console.error(error)
        throw new APIError(404, 'unable to delete some date from supabase')
      }
    }
    if (scrapImagesToDelete.length !== 0) {
      const idsToDelete = scrapImagesToDelete.map((id) => `'${id}'`).join(', ')
      await db.$executeRawUnsafe(`
        DELETE FROM "ScrapImages"
        WHERE "id" IN (${idsToDelete})
      `)
    }
  }
}
