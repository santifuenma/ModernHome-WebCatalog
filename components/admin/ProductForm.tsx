'use client'

import { Subcategoria } from '@/features/subcategorias/subcategoria.types'
import { saveProduct } from '@/app/admin/actions'
import { Product, STORE_LABELS, StoreCode } from '@/features/products/product.types'
import { useState } from 'react'

interface ProductFormProps {
    initialData?: Product
    ambientes: { label: string, slug: string }[]
    subcategoriaMap: Record<string, Subcategoria[]>
}

export function ProductForm({ initialData, ambientes, subcategoriaMap }: ProductFormProps) {
    const isEditing = !!initialData
    const [loading, setLoading] = useState(false)

    const [selectedAmbiente, setSelectedAmbiente] = useState(initialData?.ambiente || 'general')
    const [selectedSubcategoria, setSelectedSubcategoria] = useState(initialData?.subcategoria || '')
    const [isNewSubcategoria, setIsNewSubcategoria] = useState(false)
    const [selectedStores, setSelectedStores] = useState<StoreCode[]>(initialData?.stores ?? [])

    const availableSubcategorias = subcategoriaMap[selectedAmbiente] || []

    const toggleStore = (code: StoreCode) => {
        setSelectedStores(prev =>
            prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code]
        )
    }

    return (
        <form 
            action={async (formData) => {
                setLoading(true)
                try {
                    await saveProduct(formData)
                } finally {
                    setLoading(false)
                }
            }} 
            style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px', 
                maxWidth: '600px', 
                marginTop: '20px' 
            }}
        >
            {isEditing && <input type="hidden" name="id" value={initialData.id} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Code *</label>
                <input required type="text" name="code" defaultValue={initialData?.code} placeholder="SKU-123" style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Name *</label>
                <input required type="text" name="name" defaultValue={initialData?.name} placeholder="Product Name" style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Slug (auto-generated if empty)</label>
                <input type="text" name="slug" defaultValue={initialData?.slug} placeholder="product-name" style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Brand *</label>
                <input required type="text" name="brand" defaultValue={initialData?.brand || 'general'} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Designer</label>
                <input type="text" name="designer" defaultValue={initialData?.designer} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Tiendas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    {(Object.entries(STORE_LABELS) as [StoreCode, string][]).map(([code, label]) => (
                        <label
                            key={code}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                border: '2px solid',
                                borderColor: selectedStores.includes(code) ? '#0070f3' : '#ccc',
                                backgroundColor: selectedStores.includes(code) ? '#e8f0fe' : 'transparent',
                                cursor: 'pointer',
                                fontWeight: selectedStores.includes(code) ? 600 : 400,
                                transition: 'all 0.15s ease',
                                userSelect: 'none',
                            }}
                        >
                            <input
                                type="checkbox"
                                name="stores"
                                value={code}
                                checked={selectedStores.includes(code)}
                                onChange={() => toggleStore(code)}
                                style={{ display: 'none' }}
                            />
                            <span style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                backgroundColor: selectedStores.includes(code) ? '#0070f3' : '#ccc',
                                flexShrink: 0,
                            }} />
                            <span style={{ fontSize: '13px' }}>{code}</span>
                            <span style={{ fontSize: '12px', color: '#666' }}>{label}</span>
                        </label>
                    ))}
                </div>
                {selectedStores.length === 0 && (
                    <span style={{ fontSize: '12px', color: '#999' }}>Sin tienda asignada (el producto no aparece en filtros de tienda)</span>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Stock *</label>
                <input required type="number" name="stock" defaultValue={initialData?.stock ?? 0} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Ambiente *</label>
                <select 
                    required 
                    name="ambiente" 
                    value={selectedAmbiente}
                    onChange={(e) => {
                        setSelectedAmbiente(e.target.value)
                        setSelectedSubcategoria('')
                        setIsNewSubcategoria(false)
                    }}
                    style={inputStyle}
                >
                    <option value="" disabled>Selecciona un ambiente</option>
                    {ambientes.map(a => (
                        <option key={a.slug} value={a.slug}>{a.label}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Subcategoria *</label>
                <select 
                    required={!isNewSubcategoria} 
                    name={isNewSubcategoria ? "_ignore_subcategoria" : "subcategoria"} 
                    value={isNewSubcategoria ? 'NEW' : selectedSubcategoria}
                    onChange={(e) => {
                        const val = e.target.value
                        if (val === 'NEW') {
                            setIsNewSubcategoria(true)
                            setSelectedSubcategoria('NEW')
                        } else {
                            setIsNewSubcategoria(false)
                            setSelectedSubcategoria(val)
                        }
                    }}
                    style={inputStyle}
                >
                    <option value="" disabled>Selecciona una subcategoría</option>
                    {availableSubcategorias.map(s => (
                        <option key={s.slug} value={s.slug}>{s.label}</option>
                    ))}
                    <option value="NEW">+ Agregar nueva...</option>
                </select>

                {isNewSubcategoria && (
                    <input 
                        required 
                        type="text" 
                        name="subcategoria" 
                        placeholder="Ej: mesas-de-centro" 
                        style={{ ...inputStyle, marginTop: '5px' }} 
                        autoFocus
                    />
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>URL (Enlace externo)</label>
                <input type="url" name="url" defaultValue={initialData?.url} placeholder="https://..." style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Materiales (uno por línea)</label>
                <textarea name="materials" defaultValue={initialData?.materials?.join('\n')} rows={3} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Dimensiones (una por línea)</label>
                <textarea name="dimensions" defaultValue={initialData?.dimensions?.join('\n')} rows={3} style={inputStyle} />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                style={{ 
                    padding: '12px', 
                    backgroundColor: loading ? '#ccc' : '#0070f3', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                }}
            >
                {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
        </form>
    )
}

const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px'
}
