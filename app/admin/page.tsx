import Link from 'next/link'

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
            </div>
        </div>
    )
}
