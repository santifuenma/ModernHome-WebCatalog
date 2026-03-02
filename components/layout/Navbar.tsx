import Link from 'next/link';
import styles from './Navbar.module.css';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
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
