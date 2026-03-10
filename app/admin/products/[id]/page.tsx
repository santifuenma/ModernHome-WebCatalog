import { getProductById } from '@/features/products/product.service'
import { ProductForm } from '@/components/admin/ProductForm'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { SwatchesManager } from '@/components/admin/SwatchesManager'
import { DownloadsManager } from '@/components/admin/DownloadsManager'
import { removeProduct } from '@/app/admin/actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditProductPageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params
    const product = await getProductById(id)

    if (!product) {
        notFound()
    }

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/admin/products" style={{ color: '#0070f3', textDecoration: 'none' }}>
                &larr; Back to Products
            </Link>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <h1>Edit Product: {product.code}</h1>
                
                <form action={async () => {
                    'use server'
                    await removeProduct(product.id)
                }}>
                    <button 
                        type="submit" 
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#e00',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Delete Product
                    </button>
                </form>
            </div>

            <ProductForm initialData={product} />

            <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

            <ImageUploader productId={product.id} images={product.images} />

            <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

            <SwatchesManager productId={product.id} swatches={product.materialSwatches || []} />

            <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

            <DownloadsManager productId={product.id} download={product.download} />
        </div>
    )
}
