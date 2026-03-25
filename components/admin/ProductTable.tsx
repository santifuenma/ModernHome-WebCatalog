import Link from 'next/link'
import { ProductCard } from '@/features/products/product.types'
import styles from './ProductTable.module.css'

interface ProductTableProps {
    products: ProductCard[]
}

export function ProductTable({ products }: ProductTableProps) {
    if (products.length === 0) {
        return <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No se encontraron productos.</p>
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th} style={{ width: '80px' }}>Img</th>
                        <th className={styles.th}>Código</th>
                        <th className={styles.th}>Nombre</th>
                        <th className={styles.th}>Marca</th>
                        <th className={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} className={styles.tr}>
                            <td className={styles.td}>
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className={styles.productImage}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </div>
                                )}
                            </td>
                            <td className={styles.td}>
                                <span className={styles.slugText}>{product.slug?.split('-').pop()}</span>
                                <span className={styles.slugId}>{product.slug}</span>
                            </td>
                            <td className={styles.td}>
                                {product.name}
                                {product.is_active === false && (
                                    <span className={styles.hiddenTag}>Oculto</span>
                                )}
                            </td>
                            <td className={styles.td}>{product.brand}</td>
                            <td className={styles.td}>
                                <Link 
                                    href={`/admin/products/${product.id}`}
                                    className={styles.editButton}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                    Editar
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
