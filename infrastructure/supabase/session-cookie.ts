/**
 * session-cookie.ts
 * Detecta si una petición trae la cookie de sesión de Supabase.
 *
 * @supabase/ssr guarda la sesión en `sb-<referencia-del-proyecto>-auth-token` y, si es
 * larga, la reparte en `sb-<referencia>-auth-token.0`, `.1`, ... La referencia es el primer
 * trozo del nombre del host de Supabase (la misma regla que usa supabase-js por defecto).
 *
 * Sirve para no llamar a Supabase Auth cuando no hay nada que validar: un visitante anónimo
 * no trae esa cookie.
 */

function sessionCookieBase(supabaseUrl: string | undefined): string | null {
    if (!supabaseUrl) return null
    try {
        return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
    } catch {
        return null
    }
}

/**
 * True si algún nombre de cookie es la cookie de sesión (entera o por trozos).
 * Si no se puede saber cuál es (URL ausente o inválida), devuelve true: es lo más seguro,
 * porque equivale a validar siempre.
 */
export function hasSupabaseSessionCookie(cookieNames: readonly string[], supabaseUrl: string | undefined): boolean {
    const base = sessionCookieBase(supabaseUrl)
    if (!base) return true

    return cookieNames.some(name => name === base || (name.startsWith(`${base}.`) && /^\d+$/.test(name.slice(base.length + 1))))
}
