import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import { signedUrlTtl } from '@/constants/attachments'

export const getSignedUrl = async (filePath: string) => {
  const supabase = new SupabaseService()
  const { data } = await supabase.supabase.storage.from(supabaseBucket).createSignedUrl(filePath, signedUrlTtl)

  const url = data?.signedUrl

  return url
} // used to replace urls for images in task body
