import { subWeeks, isBefore, subMinutes } from 'date-fns'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import { PrismaClient, ScrapImage } from '@prisma/client'
import DBClient from '@/lib/db'
import APIError from '@/app/api/core/exceptions/api'

export class ScrapImageService {
  async removeScrapImages() {
    const oneWeekAgo = subWeeks(new Date(), 1)

    const threeMinutesAgo = subMinutes(new Date(), 3)
    const db: PrismaClient = DBClient.getInstance()
    const scrapImages = await db.scrapImage.findMany({
      where: {
        updatedAt: {
          lt: threeMinutesAgo, //apply oneWeekAgo. three minutes ago is used for testing
        },
      },
      // Putting a buffer of 0.5s for each deletion (which should be more than very enough), we take 600 records at a time
      // for each worker
      take: 600,
    })
    const supabase = new SupabaseService()

    const tasks = await db.task.findMany({
      where: { id: { in: scrapImages.map((image: ScrapImage) => image.id) } },
    })
    const scrapImagesToDelete = []
    const scrapImagesToDeleteFromBucket = []

    for (const image of scrapImages) {
      try {
        // For each scrap image, check if the task still has the img url in its body
        const task = tasks.find((_task) => _task.id === image.taskId)
        if (!task) {
          console.error('Could not find task for scrap image', image)
          continue
        }
        // If image is in task body
        if ((task.body || '').includes(image.filePath)) {
          scrapImagesToDelete.push(image.id)
          continue
        }
        // If image is not in task body

        scrapImagesToDeleteFromBucket.push(image.filePath)
        scrapImagesToDelete.push(image.id)
      } catch (e: unknown) {
        console.error('What just happened...', e)
      }
    }
    if (scrapImagesToDeleteFromBucket.length !== 0) {
      const { error } = await supabase.supabase.storage.from(supabaseBucket).remove(scrapImagesToDeleteFromBucket)
      if (error) {
        console.error(error)
        throw new APIError(404, 'unable to delete some date from supabase')
      }
    }
    await db.scrapImage.deleteMany({ where: { id: { in: scrapImagesToDelete } } })
  }
}
