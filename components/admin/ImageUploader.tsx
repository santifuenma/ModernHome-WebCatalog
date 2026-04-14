'use client'

import { attachImage, detachImage } from '@/app/admin/actions'
import { ProductImage } from '@/features/products/product.types'
import { CldUploadWidget } from 'next-cloudinary'
import styles from './ProductForm.module.css'

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
        <div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {images.map((img) => (
                    <div key={img.id ?? img.url} style={{ position: 'relative', width: '120px', height: '120px', border: '1px solid #e8e6e1', borderRadius: '8px', overflow: 'hidden' }}>
                        <img
                            src={img.url}
                            alt={img.alt || 'imagen del producto'}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        {img.id && (
                            <button
                                onClick={() => detachImage(img.id!, productId)}
                                className={styles.btnDangerSolid}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                }}
                                title="Eliminar imagen"
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
                        className={styles.btnOutline}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Subir imagen
                    </button>
                )}
            </CldUploadWidget>
        </div>
    )
}
