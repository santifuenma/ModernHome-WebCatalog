import { searchProductsAdmin } from '@/features/products/product.service'
import { dbGetAllActiveSubcategories } from '@/features/products/product.repository'
import { ProductTable } from '@/components/admin/ProductTable'
import { ProductFiltersBar } from '@/components/admin/ProductFiltersBar'
import { AdminPagination } from '@/components/admin/AdminPagination'
import Link from 'next/link'

interface AdminProductsPageProps {
    searchParams: Promise<{
        q?: string
        status?: string
        images?: string
        store?: string
        ambiente?: string
        subcategoria?: string
        stock?: string
        page?: string
    }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page || '1', 10))

    // Build AdminFilters from URL params
    const filters = {
        query: sp.q || undefined,
        status: (sp.status as 'active' | 'hidden' | 'all') || undefined,
        images: (sp.images as 'with' | 'without' | 'all') || undefined,
        store: sp.store || undefined,
        ambiente: sp.ambiente || undefined,
        subcategoria: sp.subcategoria || undefined,
        stock: (sp.stock as 'instock' | 'nostock' | 'all') || undefined,
    }

    // Fetch data concurrently
    const [data, subcategoriaMap] = await Promise.all([
        searchProductsAdmin(filters, page),
        dbGetAllActiveSubcategories(),
    ])

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Products Manager</h1>
                    <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                        {data.totalItems} producto{data.totalItems !== 1 ? 's' : ''} encontrado{data.totalItems !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link 
                    href="/admin/products/new"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                >
                    + New Product
                </Link>
            </div>

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
