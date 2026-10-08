import { searchProductsAdmin } from '@/features/products/product.service'
import { dbGetAllActiveSubcategories } from '@/features/products/product.repository'
import { ProductTable } from '@/components/admin/ProductTable'
import { ProductFiltersBar } from '@/components/admin/ProductFiltersBar'
import { AiSearchBar } from '@/components/admin/AiSearchBar'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { parseAdminFilters, AdminSearchParams } from '@/features/products/admin-search-params'
import Link from 'next/link'

interface AdminProductsPageProps {
    searchParams: Promise<AdminSearchParams>
}

import styles from './products.module.css'

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page || '1', 10))

    // Build AdminFilters from URL params
    const filters = parseAdminFilters(sp)

    // Fetch data concurrently
    const [data, subcategoriaMap] = await Promise.all([
        searchProductsAdmin(filters, page),
        dbGetAllActiveSubcategories(),
    ])

    return (
        <div className={styles.container}>
            <Link href="/admin" className={styles.backLink}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                        fill="currentColor"
                    />
                </svg>
                Atrás
            </Link>

            <div className={styles.headerRow}>
                <div className={styles.titleWrapper}>
                    <h1 className={styles.title}>Gestión de Productos</h1>
                    <p className={styles.subtitle}>
                        {data.totalItems} producto{data.totalItems !== 1 ? 's' : ''} encontrado{data.totalItems !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link href="/admin/products/new" className={styles.newButton}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nuevo Producto
                </Link>
            </div>

            <AiSearchBar />

            <ProductFiltersBar ambienteMap={subcategoriaMap} />

            <ProductTable products={data.items} />

            <AdminPagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                totalItems={data.totalItems}
            />
        </div>
    )
}
