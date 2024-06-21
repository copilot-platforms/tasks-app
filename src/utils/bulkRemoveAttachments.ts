import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { SupabaseActions } from '@/utils/SupabaseActions'

export const bulkRemoveAttachments = async (attachments: CreateAttachmentRequest[]) => {
  const supabaseActions = new SupabaseActions()
  const removalPromises = attachments.map((el) => supabaseActions.removeAttachment(el.filePath))
  await Promise.all(removalPromises)
}
