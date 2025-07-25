import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\n/g, '') || ''

// Service role client for server-side operations only
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey) 