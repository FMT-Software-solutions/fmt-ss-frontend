import { createClient } from '@supabase/supabase-js'

/**
 * Points at the PRINT-CALC-PRO project, not the fmt-ss one the marketing site
 * uses — attendance data lives with the desktop app.
 *
 * The anon key is public by design. This client can reach exactly five
 * SECURITY DEFINER functions and has no table access at all: every attendance
 * table either has no anon policy or no anon grant. Identity is the employee's
 * PIN, checked server-side, not this key.
 */
const url = import.meta.env.VITE_PSP_SUPABASE_URL
const anonKey = import.meta.env.VITE_PSP_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Failing loudly at boot beats every page showing "invalid link", which is
  // what a missing key looks like from the outside.
  throw new Error(
    'Missing VITE_PSP_SUPABASE_URL / VITE_PSP_SUPABASE_ANON_KEY. Set them in the monorepo root .env and in Netlify.'
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // Nobody signs in here. Employees are identified by a token and a PIN, so
    // there is no session to persist or refresh.
    persistSession: false,
    autoRefreshToken: false,
  },
})
