import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * createSupabaseMiddlewareClient
 * Edge-compatible Supabase client for use in middleware.ts only.
 * Reads / writes cookies directly on NextRequest + NextResponse
 * (cannot use next/headers in the Edge Runtime).
 *
 * Returns the client and a `response` getter. When Supabase renews the session it calls
 * `setAll`, which REPLACES the response so the new cookies are forwarded to the browser:
 * the caller must read `response` after using the client and must not keep an earlier copy
 * (a copy taken before would not carry the renewed cookies).
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Write cookies back onto the request so subsequent
                    // server-side reads within the same request see them.
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // Re-create the response with the updated request so
                    // Set-Cookie headers are forwarded to the browser.
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    return {
        supabase,
        get response() {
            return response
        },
    }
}
