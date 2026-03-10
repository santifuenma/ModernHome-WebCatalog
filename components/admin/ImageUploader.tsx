'use client'

import { attachImage, detachImage } from '@/app/admin/actions'
import { ProductImage } from '@/features/products/product.types'
import { CldUploadWidget } from 'next-cloudinary'

interface ImageUploaderProps {
    productId: string
    images: ProductImage[]
}

export function ImageUploader({ productId, images }: ImageUploaderProps) {

    const handleSuccess = async (result: any) => {
        const publicId = result?.info?.public_id
        if (publicId) {
            await attachImage(productId, publicId)
        }
    }

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Product Images</h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {images.map((img) => (
                    <div key={img.id ?? img.url} style={{ position: 'relative', width: '150px', height: '150px', border: '1px solid #ddd' }}>
                        <img 
                            src={img.url} 
                            alt={img.alt || 'product image'} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                        {img.id && (
                            <button 
                                onClick={() => detachImage(img.id!, productId)}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    lineHeight: '1'
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'}
                onSuccess={handleSuccess}
            >
                {({ open }) => (
                    <button 
                        type="button" 
                        onClick={() => open()}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#eee',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Upload an Image
                    </button>
                )}
            </CldUploadWidget>
        </div>
    )
}
