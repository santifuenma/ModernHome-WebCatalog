import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/infrastructure/supabase/middleware', () => ({ createSupabaseMiddlewareClient: vi.fn() }))

import { createSupabaseMiddlewareClient } from '@/infrastructure/supabase/middleware'
import { middleware } from './middleware'

const SESSION_COOKIE = 'sb-abcdwxyz-auth-token'

/** Prepara un cliente de Supabase falso. `claims` = lo que devolvería getClaims() para un token válido. */
function setup(claims: { sub: string } | null, response: NextResponse = NextResponse.next()) {
    const getClaims = vi.fn(async () => ({ data: claims ? { claims } : null, error: null }))
    const getUser = vi.fn()
    vi.mocked(createSupabaseMiddlewareClient).mockReturnValue({
        supabase: { auth: { getClaims, getUser } },
        get response() { return response },
    } as never)
    return { getClaims, getUser }
}

const request = (path: string, cookie?: string) =>
    new NextRequest(`http://localhost${path}`, cookie ? { headers: { cookie } } : undefined)

const passes = (res: Response) => res.headers.get('x-middleware-next') === '1'
const redirectsTo = (res: Response, path: string) =>
    res.status === 307 && new URL(res.headers.get('location')!).pathname === path

beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdwxyz.supabase.co'
    vi.mocked(createSupabaseMiddlewareClient).mockReset()
})

describe('middleware: visitantes anónimos (sin cookie de sesión)', () => {
    it('el catálogo público pasa SIN llamar a Supabase Auth', async () => {
        const { getClaims, getUser } = setup(null)
        const res = await middleware(request('/catalogo/sala'))
        expect(passes(res)).toBe(true)
        expect(getClaims).not.toHaveBeenCalled()
        expect(getUser).not.toHaveBeenCalled()
    })

    it('cualquier ruta de /admin redirige al login, también sin llamar a Supabase Auth', async () => {
        const { getClaims, getUser } = setup(null)
        for (const path of ['/admin', '/admin/products', '/admin/products/new', '/admin/import', '/admin/inventory']) {
            expect(redirectsTo(await middleware(request(path)), '/admin/login')).toBe(true)
        }
        expect(getClaims).not.toHaveBeenCalled()
        expect(getUser).not.toHaveBeenCalled()
    })

    it('la página de login es accesible', async () => {
        const { getClaims } = setup(null)
        expect(passes(await middleware(request('/admin/login')))).toBe(true)
        expect(getClaims).not.toHaveBeenCalled()
    })

    it('otras cookies (tema, analítica...) no cuentan como sesión', async () => {
        const { getClaims } = setup({ sub: 'u1' })
        const res = await middleware(request('/admin/products', 'theme=dark; _ga=1; sb-otroproyecto-auth-token=x'))
        expect(redirectsTo(res, '/admin/login')).toBe(true)
        expect(getClaims).not.toHaveBeenCalled()
    })
})

describe('middleware: con cookie de sesión', () => {
    it('sesión válida: entra en /admin y se valida UNA vez con getClaims (nunca con getUser)', async () => {
        const { getClaims, getUser } = setup({ sub: 'u1' })
        const res = await middleware(request('/admin/products', `${SESSION_COOKIE}=token`))
        expect(passes(res)).toBe(true)
        expect(getClaims).toHaveBeenCalledTimes(1)
        expect(getUser).not.toHaveBeenCalled()
    })

    it('funciona también con la cookie repartida en trozos', async () => {
        const { getClaims } = setup({ sub: 'u1' })
        const res = await middleware(request('/admin', `${SESSION_COOKIE}.0=a; ${SESSION_COOKIE}.1=b`))
        expect(passes(res)).toBe(true)
        expect(getClaims).toHaveBeenCalledTimes(1)
    })

    it('sesión inválida o caducada: /admin redirige al login', async () => {
        setup(null)
        for (const path of ['/admin', '/admin/products', '/admin/products/123']) {
            expect(redirectsTo(await middleware(request(path, `${SESSION_COOKIE}=caducado`)), '/admin/login')).toBe(true)
        }
    })

    it('sesión válida en el login: redirige al panel', async () => {
        setup({ sub: 'u1' })
        expect(redirectsTo(await middleware(request('/admin/login', `${SESSION_COOKIE}=token`)), '/admin')).toBe(true)
    })

    it('sesión inválida en el login: se queda en el login', async () => {
        setup(null)
        expect(passes(await middleware(request('/admin/login', `${SESSION_COOKIE}=caducado`)))).toBe(true)
    })

    it('en el catálogo público también se valida (así se renueva la sesión del admin)', async () => {
        const { getClaims } = setup({ sub: 'u1' })
        const res = await middleware(request('/catalogo', `${SESSION_COOKIE}=token`))
        expect(passes(res)).toBe(true)
        expect(getClaims).toHaveBeenCalledTimes(1)
    })

    it('un claims sin identificador de usuario no cuenta como sesión', async () => {
        setup({} as { sub: string })
        expect(redirectsTo(await middleware(request('/admin/products', `${SESSION_COOKIE}=raro`)), '/admin/login')).toBe(true)
    })
})

describe('middleware: cookies de sesión renovadas', () => {
    it('devuelve la respuesta vigente, la que lleva las cookies renovadas', async () => {
        const renovada = NextResponse.next()
        renovada.cookies.set(SESSION_COOKIE, 'token-nuevo')
        setup({ sub: 'u1' }, renovada)

        const res = await middleware(request('/admin/products', `${SESSION_COOKIE}=token-viejo`))
        expect(res).toBe(renovada)
        expect(res.cookies.get(SESSION_COOKIE)?.value).toBe('token-nuevo')
    })

    it('una redirección también lleva las cookies renovadas', async () => {
        const renovada = NextResponse.next()
        renovada.cookies.set(SESSION_COOKIE, 'token-nuevo')
        setup({ sub: 'u1' }, renovada)

        const res = await middleware(request('/admin/login', `${SESSION_COOKIE}=token-viejo`))
        expect(redirectsTo(res, '/admin')).toBe(true)
        expect(res.cookies.get(SESSION_COOKIE)?.value).toBe('token-nuevo')
    })
})
