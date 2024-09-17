import { BaseService } from '@api/core/services/base.service'

import { subWeeks, isBefore, subMinutes } from 'date-fns'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import { PrismaClient } from '@prisma/client'
import DBClient from '@/lib/db'

export class ScrapImageService {
  async removeScrapImages() {
    const oneWeekAgo = subWeeks(new Date(), 1)

    const threeMinutesAgo = subMinutes(new Date(), 3)
    const db: PrismaClient = DBClient.getInstance()

    const scrapImages = await db.scrapImages.findMany({
      where: {
        createdAt: {
          lt: threeMinutesAgo, //apply oneWeekAgo. three minutes ago is used for testing
        },
      },
      // Putting a buffer of 0.5s for each deletion (which should be more than very enough), we take 600 records at a time
      // for each worker
      take: 600,
    })
    const supabase = new SupabaseService()

    const tasks = await db.task.findMany({
      where: { id: { in: scrapImages.map((image) => image.id) } },
    })
    const scrapImagesToDelete = []

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
        const { error } = await supabase.supabase.storage.from(supabaseBucket).remove([image.filePath])
        if (error) {
          console.error(error)
          continue
        }
        scrapImagesToDelete.push(image.id)
      } catch (e: unknown) {
        console.error('What just happened...', e)
      }
    }
    await db.scrapImages.deleteMany({ where: { id: { in: scrapImagesToDelete } } })
  }
}
