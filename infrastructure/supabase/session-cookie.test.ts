import { describe, it, expect } from 'vitest'
import { hasSupabaseSessionCookie } from './session-cookie'

const URL_OK = 'https://abcdwxyz.supabase.co'

describe('hasSupabaseSessionCookie', () => {
    it('reconoce la cookie de sesión entera', () => {
        expect(hasSupabaseSessionCookie(['theme', 'sb-abcdwxyz-auth-token'], URL_OK)).toBe(true)
    })

    it('reconoce la cookie de sesión repartida en trozos (.0, .1...)', () => {
        expect(hasSupabaseSessionCookie(['sb-abcdwxyz-auth-token.0'], URL_OK)).toBe(true)
        expect(hasSupabaseSessionCookie(['sb-abcdwxyz-auth-token.0', 'sb-abcdwxyz-auth-token.1'], URL_OK)).toBe(true)
    })

    it('un visitante anónimo no trae cookie de sesión', () => {
        expect(hasSupabaseSessionCookie([], URL_OK)).toBe(false)
        expect(hasSupabaseSessionCookie(['theme', '_ga', 'next-auth.csrf'], URL_OK)).toBe(false)
    })

    it('no confunde otras cookies de Supabase con la de sesión', () => {
        // El verificador de PKCE no es una sesión
        expect(hasSupabaseSessionCookie(['sb-abcdwxyz-auth-token-code-verifier'], URL_OK)).toBe(false)
        // Un trozo sin número, o con letras, no vale
        expect(hasSupabaseSessionCookie(['sb-abcdwxyz-auth-token.', 'sb-abcdwxyz-auth-token.x'], URL_OK)).toBe(false)
    })

    it('ignora la sesión de otro proyecto de Supabase', () => {
        expect(hasSupabaseSessionCookie(['sb-otroproyecto-auth-token'], URL_OK)).toBe(false)
    })

    it('si no se puede saber el nombre de la cookie, asume que hay sesión (valida siempre)', () => {
        expect(hasSupabaseSessionCookie([], undefined)).toBe(true)
        expect(hasSupabaseSessionCookie([], '')).toBe(true)
        expect(hasSupabaseSessionCookie([], 'no es una url')).toBe(true)
    })
})
