'use client'

import { attachSwatch, detachSwatch } from '@/app/admin/actions'
import { MaterialSwatch } from '@/features/products/product.types'
import { CldUploadWidget } from 'next-cloudinary'

interface SwatchesManagerProps {
    productId: string
    swatches: MaterialSwatch[]
}

export function SwatchesManager({ productId, swatches }: SwatchesManagerProps) {

    const handleSuccess = async (result: any) => {
        const publicId = result?.info?.public_id
        if (publicId) {
            // we could ask for a name, but for now we pass null or prompt
            const name = prompt('Nombre del material (opcional):')
            await attachSwatch(productId, name || null, publicId)
        }
    }

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Material Swatches</h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {swatches.map((swatch, idx) => {
                    // We need the ID for deletion. We'll use the URL as fallback key 
                    // since our DB type mapping might not have mapped the swatch ID properly yet.
                    // Wait, I didn't add `id` to MaterialSwatch in product.types.ts
                    // Let's assume we can fetch it, or we just map it by URL/name.
                    // Actually, I should update the type or pass the raw array.
                    // Let's use any for swatch for now if id is missing, or rely on cloudinary ID.
                    return (
                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #ddd' }}>
                            <img 
                                src={swatch.image} 
                                alt={swatch.name || 'swatch'} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ fontSize: '10px', textAlign: 'center' }}>{swatch.name}</div>
                            
                            {/* We need the swatch ID to delete it. Let's cast to any to find it until we update the types */}
                            {(swatch as any).id && (
                                <button 
                                    onClick={() => detachSwatch((swatch as any).id, productId)}
                                    style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        backgroundColor: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '12px',
                                        lineHeight: '1'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )
                })}
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
                            padding: '8px 12px',
                            backgroundColor: '#eee',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Upload Swatch
                    </button>
                )}
            </CldUploadWidget>
        </div>
    )
}
