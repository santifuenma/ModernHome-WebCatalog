'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/infrastructure/supabase/server'

/**
 * loginAction
 * Authenticates an admin user with email + password via Supabase Auth.
 * Signature matches React useActionState: (prevState, formData) => string | undefined
 * Returns an error message string on failure; redirects to /admin on success.
 */
export async function loginAction(
    _prevState: string | undefined,
    formData: FormData
): Promise<string | undefined> {
    const email    = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return 'Email y contraseña son obligatorios.'
    }

    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        // Return a generic error — never expose internal Supabase error details
        return 'Credenciales incorrectas. Verifica tu email y contraseña.'
    }

    redirect('/admin')
}

/**
 * logoutAction
 * Signs out the current admin session and redirects to the login page.
 */
export async function logoutAction(): Promise<void> {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    redirect('/admin/login')
}
