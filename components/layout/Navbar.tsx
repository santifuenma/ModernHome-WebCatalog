import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link href="/" className={styles.link}>
                    Logo
                </Link>
            </div>

            <div className={styles.links}>
                <Link href="/" className={styles.link}>
                    Inicio
                </Link>
                <Link href="/catalogo" className={styles.link}>
                    Catálogo
                </Link>
                <Link href="/admin" className={styles.link}>
                    Admin
                </Link>
            </div>

            <div className={styles.actions}>
                {/* Espacio para futuras acciones (ej: login, carrito, etc.) */}
                <span>Acciones</span>
            </div>
        </nav>
    );
}
