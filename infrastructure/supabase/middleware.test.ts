import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

type CookieOptions = {
    cookies: {
        getAll: () => { name: string; value: string }[]
        setAll: (cookies: { name: string; value: string; options?: object }[]) => void
    }
}

let captured: CookieOptions | undefined

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn((_url: string, _key: string, options: CookieOptions) => {
        captured = options
        return { auth: {} }
    }),
}))

import { createSupabaseMiddlewareClient } from './middleware'

beforeEach(() => {
    captured = undefined
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdwxyz.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
})

describe('createSupabaseMiddlewareClient', () => {
    it('lee las cookies de la petición', () => {
        const request = new NextRequest('http://localhost/admin', { headers: { cookie: 'a=1; b=2' } })
        createSupabaseMiddlewareClient(request)
        expect(captured!.cookies.getAll().map(c => c.name)).toEqual(['a', 'b'])
    })

    it('tras renovar la sesión, `response` es la respuesta nueva con las cookies renovadas', () => {
        const request = new NextRequest('http://localhost/admin')
        const client = createSupabaseMiddlewareClient(request)
        const antes = client.response

        // Supabase renueva la sesión y llama a setAll
        captured!.cookies.setAll([{ name: 'sb-abcdwxyz-auth-token', value: 'renovado', options: { path: '/' } }])

        expect(client.response).not.toBe(antes)
        expect(client.response.cookies.get('sb-abcdwxyz-auth-token')?.value).toBe('renovado')
        // Quien guardara la respuesta de antes no vería la cookie: por eso se expone con un getter
        expect(antes.cookies.get('sb-abcdwxyz-auth-token')).toBeUndefined()
    })

    it('las cookies renovadas también las ve el resto de la petición', () => {
        const request = new NextRequest('http://localhost/admin', { headers: { cookie: 'sb-abcdwxyz-auth-token=viejo' } })
        createSupabaseMiddlewareClient(request)
        captured!.cookies.setAll([{ name: 'sb-abcdwxyz-auth-token', value: 'nuevo' }])
        expect(request.cookies.get('sb-abcdwxyz-auth-token')?.value).toBe('nuevo')
    })
})
