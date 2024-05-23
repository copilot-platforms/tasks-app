import SupabaseClient from '@/lib/supabase'
import { type SupabaseClient as SupabaseJSClient } from '@supabase/supabase-js'

/**
 * Base Service with access to supabase client
 */
export class SupabaseService {
  public supabase: SupabaseJSClient = SupabaseClient.getInstance()
}
