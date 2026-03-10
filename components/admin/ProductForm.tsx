'use client'

import { saveProduct } from '@/app/admin/actions'
import { Product } from '@/features/products/product.types'
import { useState } from 'react'

interface ProductFormProps {
    initialData?: Product
}

export function ProductForm({ initialData }: ProductFormProps) {
    const isEditing = !!initialData
    const [loading, setLoading] = useState(false)

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
                <label>Store *</label>
                <input required type="text" name="store" defaultValue={initialData?.store || 'LM'} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Stock *</label>
                <input required type="number" name="stock" defaultValue={initialData?.stock ?? 0} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Ambiente *</label>
                <input required type="text" name="ambiente" defaultValue={initialData?.ambiente || 'general'} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Subcategoria *</label>
                <input required type="text" name="subcategoria" defaultValue={initialData?.subcategoria || 'general'} style={inputStyle} />
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
