import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
/** Anon key = publishable key (safe in browser). Use the "anon" / "public" key from Project Settings → API, not service_role. */
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy apps/dashboard/.env.example to .env and set values from your Supabase project.'
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
})

/** In dev only: host part of VITE_SUPABASE_URL for connection debugging (e.g. "xxx.supabase.co"). */
export const supabaseUrlHint =
  import.meta.env.DEV === true && url
    ? (() => {
        try {
          return new URL(url).host
        } catch {
          return 'invalid URL'
        }
      })()
    : ''
