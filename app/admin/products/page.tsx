import { searchProductsAdmin, getProductCards } from '@/features/products/product.service'
import { ProductSearchBar } from '@/components/admin/ProductSearchBar'
import { ProductTable } from '@/components/admin/ProductTable'
import Link from 'next/link'

interface AdminProductsPageProps {
    searchParams: Promise<{ q?: string }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
    // Note: In Next.js 15, searchParams is a Promise.
    const resolvedSearchParams = await searchParams
    const query = resolvedSearchParams.q || ''

    let data
    if (query) {
        data = await searchProductsAdmin(query, 1) // simplifying page 1 only for admin MVP
    } else {
        data = await getProductCards(1) // Load active ones on default view
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Products Manager</h1>
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

            <ProductSearchBar />

            <ProductTable products={data.items} />
        </div>
    )
}
