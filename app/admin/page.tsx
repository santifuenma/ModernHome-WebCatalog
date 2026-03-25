import Link from 'next/link'
import { ExportCatalogButton } from '@/components/admin/ExportCatalogButton'
import styles from './page.module.css'

export const metadata = {
    title: 'Admin Dashboard',
}

export default function AdminPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <p className={styles.subtitle}>Panel de control unificado y optimizado</p>
            </div>

            {/* SECCIÓN 1: Gestión Diaria */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Gestión de Catálogo</h2>
                <div className={styles.grid}>
                    <Link href="/admin/products" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>Inventario Web</h3>
                            <p className={styles.cardDesc}>Añade, edita imágenes, materiales y despublica productos individualmente en tiempo real.</p>
                        </div>
                        <span className={styles.cardAction}>Gestionar →</span>
                    </Link>
                </div>
            </section>

            {/* SECCIÓN 2: Operaciones Masivas */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Operaciones Masivas (Excel)</h2>
                <div className={styles.grid}>
                    <Link href="/admin/inventory" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <path d="M12 18v-6"></path>
                                <path d="M9 15h6"></path>
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>Comparar Inventario</h3>
                            <p className={styles.cardDesc}>Sube un Excel de tu local para ver qué productos faltan o sobran respecto a la web.</p>
                        </div>
                        <span className={styles.cardAction}>Comparar →</span>
                    </Link>

                    <Link href="/admin/import" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>Importar Nuevos</h3>
                            <p className={styles.cardDesc}>Sube el Excel maestro para crear de forma masiva los productos nuevos de temporada.</p>
                        </div>
                        <span className={styles.cardAction}>Importar →</span>
                    </Link>

                    <Link href="/admin/deactivate" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 3h18v18H3zM15 9l-6 6m0-6l6 6"></path>
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>Desactivar Antiguos</h3>
                            <p className={styles.cardDesc}>Sube un listado de descatalogados para ocultarlos (sin borrarlos permanentemente).</p>
                        </div>
                        <span className={styles.cardAction}>Desactivar →</span>
                    </Link>

                    {/* La Exportación tiene su propia lógica interactiva incrustada en formato Card */}
                    <div className={`${styles.card} ${styles.exportCard}`}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>Exportar Web</h3>
                            <p className={styles.cardDesc}>Descarga un Excel con todo lo que actualmente está publicado en la web.</p>
                        </div>
                        <ExportCatalogButton />
                    </div>
                </div>
            </section>
        </div>
    )
}
