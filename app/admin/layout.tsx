import { createSupabaseServerClient } from '@/infrastructure/supabase/server'
import { logoutAction } from '@/app/admin/login/actions'
import Navbar from '@/components/layout/Navbar'
import styles from './admin.layout.module.css'

/**
 * AdminLayout
 * Wraps all /admin/** routes.
 * - No session (login page): shows Navbar + children only
 * - Session present (authenticated admin pages): renders the top bar with logout
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Login page — show Navbar but no admin shell
    if (!user) {
        return (
            <>
                <Navbar />
                {children}
            </>
        )
    }

    return (
        <div className={styles.shell}>
            <header className={styles.topBar}>
                <span className={styles.brand}>Admin · <span>Modern Home</span></span>
                <form action={logoutAction}>
                    <button type="submit" className={styles.logoutBtn}>
                        Cerrar sesión
                    </button>
                </form>
            </header>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    )
}
