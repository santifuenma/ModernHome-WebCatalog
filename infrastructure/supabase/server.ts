import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * createSupabaseServerClient
 * Supabase client for use in Server Components and Route Handlers.
 * Reads cookies via next/headers so it can access the session server-side.
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignored in Server Components — middleware handles session refresh
                    }
                },
            },
        }
    )
}
