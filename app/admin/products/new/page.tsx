import { ProductForm } from '@/components/admin/ProductForm'
import { getAmbientes } from '@/features/ambientes/ambiente.service'
import { getAllActiveSubcategorias } from '@/features/subcategorias/subcategoria.service'
import Link from 'next/link'
import styles from '@/components/admin/ProductForm.module.css'

export default async function NewProductPage() {
    const ambientes = getAmbientes()
    const subcategoriaMap = await getAllActiveSubcategorias()

    return (
        <div className={styles.page}>
            <Link href="/admin/products" className={styles.backLink}>
                ← Volver a productos
            </Link>

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Nuevo producto</h1>
            </div>

            <div className={styles.card} style={{ maxWidth: '680px' }}>
                <h2 className={styles.sectionTitle}>Datos del producto</h2>
                <ProductForm ambientes={ambientes} subcategoriaMap={subcategoriaMap} />
            </div>
        </div>
    )
}
