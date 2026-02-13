import { createClient } from '@supabase/supabase-js'

// Note: access to the database with the service role key bypasses Row Level Security.
// We are using this because authentication is handled by NextAuth, not Supabase Auth.
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
