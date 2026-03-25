import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/infrastructure/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createSupabaseMiddlewareClient(request)

    // Refresh the session if it has expired.
    // IMPORTANT: always use getUser() — never getSession() — as getUser()
    // re-validates the token with the Supabase server, preventing spoofing.
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isAdminRoute = pathname.startsWith('/admin')
    const isLoginPage  = pathname === '/admin/login'

    // Unauthenticated user trying to access any /admin route → login
    if (isAdminRoute && !isLoginPage && !user) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/admin/login'
        return NextResponse.redirect(loginUrl)
    }

    // Authenticated user visiting the login page → send to dashboard
    if (isLoginPage && user) {
        const adminUrl = request.nextUrl.clone()
        adminUrl.pathname = '/admin'
        return NextResponse.redirect(adminUrl)
    }

    // Always return the supabase response so refreshed session cookies
    // are forwarded to the browser.
    return response
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
