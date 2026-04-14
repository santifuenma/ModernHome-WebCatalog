'use client'

import { attachSwatch, detachSwatch } from '@/app/admin/actions'
import { MaterialSwatch } from '@/features/products/product.types'
import { CldUploadWidget } from 'next-cloudinary'
import { useState } from 'react'
import styles from './ProductForm.module.css'

interface SwatchesManagerProps {
    productId: string
    swatches: MaterialSwatch[]
    availableSwatches?: MaterialSwatch[]
}

export function SwatchesManager({ productId, swatches, availableSwatches = [] }: SwatchesManagerProps) {
    const [isSaving, setIsSaving] = useState(false)

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
        <div>
            {/* Swatches activos */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {swatches.map((swatch, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '72px' }}>
                        <div style={{ width: '72px', height: '72px', border: '1px solid #e8e6e1', borderRadius: '8px', overflow: 'hidden' }}>
                            <img
                                src={swatch.image}
                                alt={swatch.name || 'muestra'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ fontSize: '10px', textAlign: 'center', color: '#888', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {swatch.name || 'Sin nombre'}
                        </div>
                        {swatch.id && (
                            <button
                                onClick={() => detachSwatch(swatch.id!, productId)}
                                className={styles.btnDangerSolid}
                                style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                }}
                                disabled={isSaving}
                                title="Eliminar muestra"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Subir nueva muestra */}
                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default'}
                    onSuccess={handleSuccess}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open()}
                            disabled={isSaving}
                            className={styles.btnOutline}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            {isSaving ? 'Guardando...' : '+ Subir nueva muestra'}
                        </button>
                    )}
                </CldUploadWidget>

                {/* Reutilizar existentes */}
                {availableSwatches.length > 0 && (
                    <div style={{ padding: '1rem', border: '1px solid #e8e6e1', borderRadius: '8px', background: '#fafaf9' }}>
                        <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            O reutilizar materiales existentes
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '160px', overflowY: 'auto' }}>
                            {availableSwatches.map((swatch, idx) => (
                                <button
                                    key={`available-${idx}`}
                                    type="button"
                                    onClick={() => handleAddExisting(swatch)}
                                    disabled={isSaving}
                                    title={`Añadir ${swatch.name || 'material'}`}
                                    style={{
                                        position: 'relative',
                                        width: '56px',
                                        height: '56px',
                                        padding: 0,
                                        border: '1.8px solid #e8e6e1',
                                        cursor: isSaving ? 'not-allowed' : 'pointer',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        opacity: isSaving ? 0.5 : 1,
                                        background: 'transparent',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.borderColor = '#A90404')}
                                    onMouseOut={e => (e.currentTarget.style.borderColor = '#e8e6e1')}
                                >
                                    <img
                                        src={swatch.image}
                                        alt={swatch.name || 'muestra'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ fontSize: '8px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', position: 'absolute', bottom: 0, width: '100%', padding: '2px 0' }}>
                                        {swatch.name || '+'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
