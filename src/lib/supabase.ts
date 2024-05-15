import { supabaseAnonKey, supabaseProjectUrl } from '@/config'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseProjectUrl, supabaseAnonKey)
