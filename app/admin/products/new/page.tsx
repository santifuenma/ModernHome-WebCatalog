import { ProductForm } from '@/components/admin/ProductForm'
import Link from 'next/link'

export default function NewProductPage() {
    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/admin/products" style={{ color: '#0070f3', textDecoration: 'none' }}>
                &larr; Back to Products
            </Link>
            <h1 style={{ marginTop: '20px' }}>Create New Product</h1>
            <ProductForm />
        </div>
    )
}
