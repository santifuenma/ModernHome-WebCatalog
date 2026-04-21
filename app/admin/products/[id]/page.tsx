import { getProductById, getAllUniqueSwatches } from '@/features/products/product.service'
import { getAmbientes } from '@/features/ambientes/ambiente.service'
import { getAllActiveSubcategorias } from '@/features/subcategorias/subcategoria.service'
import { removeProduct, toggleProductVisibility } from '@/app/admin/actions'
import { ProductEditShell } from '@/components/admin/ProductEditShell'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '@/components/admin/ProductForm.module.css'

interface EditProductPageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params
    const [product, availableSwatches, subcategoriaMap] = await Promise.all([
        getProductById(id),
        getAllUniqueSwatches(),
        getAllActiveSubcategorias()
    ])
    const ambientes = getAmbientes()

    if (!product) {
        notFound()
    }

    const isActive = product.is_active !== false

    return (
        <div className={styles.page}>
            {/* Back link */}
            <Link href="/admin/products" className={styles.backLink}>
                ← Volver a productos
            </Link>

            {/* Page header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    {product.code ?? 'Producto sin código'}
                </h1>

                <div className={styles.headerActions}>
                    {/* Botón ocultar / publicar */}
                    <form action={async () => {
                        'use server'
                        await toggleProductVisibility(product.id, isActive)
                    }}>
                        <button
                            type="submit"
                            className={`${styles.toggleButton} ${!isActive ? styles.toggleButtonPublish : ''}`}
                        >
                            {isActive ? (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                    Ocultar
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Publicar
                                </>
                            )}
                        </button>
                    </form>

                    {/* Botón eliminar */}
                    <form action={async () => {
                        'use server'
                        await removeProduct(product.id)
                    }}>
                        <button type="submit" className={styles.deleteButton}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                            Eliminar producto
                        </button>
                    </form>
                </div>
            </div>

            {/* Main layout — 2 columns */}
            <ProductEditShell
                product={product}
                ambientes={ambientes}
                subcategoriaMap={subcategoriaMap}
                availableSwatches={availableSwatches}
            />
        </div>
    )
}
