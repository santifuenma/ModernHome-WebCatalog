import Link from 'next/link';
import styles from './Navbar.module.css';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <a 
                href="https://api.whatsapp.com/message/M4RDJQKE3ALUJ1?autoload=1&app_absent=0&utm_source=ig" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.contactLink}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Contáctanos</span>
            </a>

            <div className={styles.logo_container}>
                <div className={styles.logo}>
                    <Link href="/" className={styles.link}>
                        <Image
                            src="/icons/logo_modern_home.svg"
                            alt="Logo Modern Home"
                            width={200}
                            height={0}
                        />
                    </Link>
                </div>
                <p className={styles.logo_text}>NUESTRO CATÁLOGO</p>
            </div>

            <div className={styles.admin_icon}>
                <Link href="/admin" className={styles.link} title="Administración">
                    <Image
                        src="/icons/icono_admin.svg"
                        alt="Icono de Admin"
                        width={25}
                        height={25}
                    />
                </Link>
            </div>
        </nav>
    );
}
