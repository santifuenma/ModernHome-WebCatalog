import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/infrastructure/supabase/middleware'
import { hasSupabaseSessionCookie } from '@/infrastructure/supabase/session-cookie'

export async function middleware(request: NextRequest) {
    const client = createSupabaseMiddlewareClient(request)

    // Only a request that carries a Supabase session cookie has anything to validate or renew.
    // Anonymous visitors (the public catalog) skip Supabase Auth entirely.
    let isAuthenticated = false
    if (hasSupabaseSessionCookie(request.cookies.getAll().map(c => c.name), process.env.NEXT_PUBLIC_SUPABASE_URL)) {
        // getClaims() verifies the token's signature and expiry (it never trusts the cookie as is),
        // and renews the session if it has expired. With asymmetric signing keys it does so locally,
        // without a network call per request; with a symmetric secret it falls back to getUser().
        // Server Actions still re-check with getUser() (requireAuth), which always asks Supabase.
        const { data } = await client.supabase.auth.getClaims()
        isAuthenticated = Boolean(data?.claims?.sub)
    }

    const { pathname } = request.nextUrl
    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginPage  = pathname === '/admin/login'

    // A redirect must carry the cookies of a renewed session too
    const redirectTo = (target: string) => {
        const url = request.nextUrl.clone()
        url.pathname = target
        const redirect = NextResponse.redirect(url)
        client.response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie))
        return redirect
    }

    // Unauthenticated user trying to access any /admin route → login
    if (isAdminRoute && !isLoginPage && !isAuthenticated) {
        return redirectTo('/admin/login')
    }

    // Authenticated user visiting the login page → send to dashboard
    if (isLoginPage && isAuthenticated) {
        return redirectTo('/admin')
    }

    // Always return the CURRENT supabase response (read after the auth call) so that
    // refreshed session cookies are forwarded to the browser.
    return client.response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image  (image optimisation)
         * - favicon.ico
         * - public image/font files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
