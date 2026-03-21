import Link from 'next/link'
import { ExportCatalogButton } from '@/components/admin/ExportCatalogButton'

export const metadata = {
    title: 'Admin Dashboard',
}

export default function AdminPage() {
    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the minimalist admin panel.</p>
            
            <div style={{ marginTop: '20px' }}>
                <Link 
                    href="/admin/products"
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#333',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                >
                    Manage Products
                </Link>
                <Link 
                    href="/admin/inventory"
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#10b981', // Emerald green 
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        marginLeft: '15px'
                    }}
                >
                    Comparar Inventario
                </Link>
                <Link 
                    href="/admin/import"
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#eab308', // Yellow/Gold
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        marginLeft: '15px'
                    }}
                >
                    Importar Productos
                </Link>
                <Link 
                    href="/admin/deactivate"
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: '#ef4444', // Red
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        marginLeft: '15px'
                    }}
                >
                    Desactivar Antiguos
                </Link>
                <ExportCatalogButton />
            </div>
        </div>
    )
}
