import APIError from '@/app/api/core/exceptions/api'
import { supabaseBucket } from '@/config'
import SupabaseClient from '@/lib/supabase'
import { type SupabaseClient as SupabaseJSClient } from '@supabase/supabase-js'
import httpStatus from 'http-status'

/**
 * Base Service with access to supabase client
 */
export class SupabaseService {
  public supabase: SupabaseJSClient = SupabaseClient.getInstance()

  async removeAttachmentsFromBucket(attachmentsToDelete: string[]) {
    if (attachmentsToDelete.length !== 0) {
      const { error } = await this.supabase.storage.from(supabaseBucket).remove(attachmentsToDelete)
      if (error) {
        console.error(error)
        throw new APIError(httpStatus.NOT_FOUND, 'unable to delete some date from supabase')
      }
    }
  }
}
