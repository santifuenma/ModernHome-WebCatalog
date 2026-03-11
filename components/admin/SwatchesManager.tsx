'use client'

import { attachSwatch, detachSwatch } from '@/app/admin/actions'
import { MaterialSwatch } from '@/features/products/product.types'
import { CldUploadWidget } from 'next-cloudinary'
import { useState } from 'react'

interface SwatchesManagerProps {
    productId: string
    swatches: MaterialSwatch[]
    availableSwatches?: MaterialSwatch[]
}

export function SwatchesManager({ productId, swatches, availableSwatches = [] }: SwatchesManagerProps) {
    const [isSaving, setIsSaving] = useState(false)

    // Helper to extract Cloudinary public ID from our buildCloudinaryUrl result
    // We assume the URL ends with the public IP. In a robust setup we'd store the publicId in the Swatch itself.
    const extractPublicId = (url: string) => {
        const parts = url.split('/')
        return parts[parts.length - 1].split('?')[0]
    }

    const handleSuccess = async (result: any) => {
        const publicId = result?.info?.public_id
        if (publicId) {
            const name = prompt('Nombre del material (opcional):')
            setIsSaving(true)
            await attachSwatch(productId, name || null, publicId)
            setIsSaving(false)
        }
    }

    const handleAddExisting = async (existingSwatch: MaterialSwatch) => {
        const publicId = extractPublicId(existingSwatch.image)
        if (publicId) {
            setIsSaving(true)
            await attachSwatch(productId, existingSwatch.name || null, publicId)
            setIsSaving(false)
        }
    }

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Material Swatches</h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {swatches.map((swatch, idx) => {
                    return (
                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #ddd' }}>
                            <img 
                                src={swatch.image} 
                                alt={swatch.name || 'swatch'} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ fontSize: '10px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.8)', position: 'absolute', bottom: 0, width: '100%' }}>
                                {swatch.name || 'Sin nombre'}
                            </div>
                            
                            {swatch.id && (
                                <button 
                                    onClick={() => detachSwatch(swatch.id!, productId)}
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
                                        lineHeight: '1',
                                        opacity: isSaving ? 0.5 : 1
                                    }}
                                    disabled={isSaving}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Upload New Swatch Block */}
                <div>
                    <CldUploadWidget 
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'}
                        onSuccess={handleSuccess}
                    >
                        {({ open }) => (
                            <button 
                                type="button" 
                                onClick={() => open()}
                                disabled={isSaving}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#0070f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                + Upload New Material
                            </button>
                        )}
                    </CldUploadWidget>
                </div>

                {/* Select Existing Swatch Block */}
                {availableSwatches.length > 0 && (
                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Or Reuse Existing Materials</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxHeight: '150px', overflowY: 'auto' }}>
                            {availableSwatches.map((swatch, idx) => (
                                <button
                                    key={`available-${idx}`}
                                    onClick={() => handleAddExisting(swatch)}
                                    disabled={isSaving}
                                    style={{
                                        position: 'relative',
                                        width: '60px',
                                        height: '60px',
                                        padding: 0,
                                        border: '1px solid transparent',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        opacity: isSaving ? 0.5 : 1
                                    }}
                                    title={`Añadir ${swatch.name || 'material'}`}
                                >
                                    <img 
                                        src={swatch.image} 
                                        alt={swatch.name || 'swatch'} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{ fontSize: '9px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', position: 'absolute', bottom: 0, width: '100%' }}>
                                        {swatch.name || '+'}
                                    </div>
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        backgroundColor: 'rgba(0,112,243,0)', transition: 'background-color 0.2s'
                                    }} 
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,112,243,0.3)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,112,243,0)'}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
