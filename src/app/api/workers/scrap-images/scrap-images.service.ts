import { BaseService } from '@api/core/services/base.service'

import { subWeeks, isBefore, subMinutes } from 'date-fns'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'

export class ScrapImageService extends BaseService {
  async removeScrapImages() {
    const oneWeekAgo = subWeeks(new Date(), 1)
    const threeMinutesAgo = subMinutes(new Date(), 3)
    const scrapImages = await this.db.scrapImages.findMany({
      where: {
        createdAt: {
          lt: threeMinutesAgo, //aplly oneWeekAgo. three minutes ago is used for testing
        },
      },
    })
    const supabase = new SupabaseService()

    for (const image of scrapImages) {
      const task = await this.db.task.findUnique({
        where: {
          id: image.taskId,
        },
      })
      await this.db.scrapImages.delete({
        where: { id: image.id },
      })
      if (task && (task.body as string).includes(image.filePath)) {
        continue
      }

      await supabase.supabase.storage.from(supabaseBucket).remove([image.filePath])
    }
  }
}
