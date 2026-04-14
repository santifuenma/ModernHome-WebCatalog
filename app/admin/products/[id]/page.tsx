import { getProductById, getAllUniqueSwatches } from '@/features/products/product.service'
import { getAmbientes } from '@/features/ambientes/ambiente.service'
import { getAllActiveSubcategorias } from '@/features/subcategorias/subcategoria.service'
import { removeProduct } from '@/app/admin/actions'
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
