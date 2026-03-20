import Link from 'next/link'
import { ProductCard } from '@/features/products/product.types'

interface ProductTableProps {
    products: ProductCard[]
}

export function ProductTable({ products }: ProductTableProps) {
    if (products.length === 0) {
        return <p>No products found.</p>
    }

    return (
        <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginTop: '20px',
            textAlign: 'left'
        }}>
            <thead>
                <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9' }}>
                    <th style={{ padding: '12px', width: '60px' }}>Image</th>
                    <th style={{ padding: '12px' }}>Code (Slug)</th>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Brand</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>
                            {product.image ? (
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                                />
                            ) : (
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '4px', border: '1px dashed #ccc' }} />
                            )}
                        </td>
                        <td style={{ padding: '12px' }}>
                            <strong>{product.slug?.split('-').pop()}</strong><br/>
                            <small style={{ color: '#666' }}>{product.slug}</small>
                        </td>
                        <td style={{ padding: '12px' }}>{product.name}</td>
                        <td style={{ padding: '12px' }}>{product.brand}</td>
                        <td style={{ padding: '12px' }}>
                            <Link 
                                href={`/admin/products/${product.id}`}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#0070f3',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            >
                                Edit
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
