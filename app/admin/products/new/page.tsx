import { ProductForm } from '@/components/admin/ProductForm'
import { getAmbientes } from '@/features/ambientes/ambiente.service'
import { getAllActiveSubcategorias } from '@/features/subcategorias/subcategoria.service'
import Link from 'next/link'

export default async function NewProductPage() {
    const ambientes = getAmbientes()
    const subcategoriaMap = await getAllActiveSubcategorias()

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/admin/products" style={{ color: '#0070f3', textDecoration: 'none' }}>
                &larr; Back to Products
            </Link>
            <h1 style={{ marginTop: '20px' }}>Create New Product</h1>
            <ProductForm ambientes={ambientes} subcategoriaMap={subcategoriaMap} />
        </div>
    )
}
