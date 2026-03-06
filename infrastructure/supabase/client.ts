import { createBrowserClient } from '@supabase/ssr'

/**
 * createSupabaseBrowserClient
 * Supabase client for use in Client Components ('use client').
 * Uses the public anon key — safe to expose in the browser.
 */
export function createSupabaseBrowserClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
}
