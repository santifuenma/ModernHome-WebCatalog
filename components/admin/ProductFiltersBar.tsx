'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

const STORES = ['LM', 'SM', 'DP', 'CT', 'BT']

interface AmbienteData {
    label: string
    slug: string
}

interface ProductFiltersBarProps {
    ambienteMap: Record<string, AmbienteData[]>
}

export function ProductFiltersBar({ ambienteMap }: ProductFiltersBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const current = {
        q: searchParams.get('q') ?? '',
        status: searchParams.get('status') ?? '',
        images: searchParams.get('images') ?? '',
        store: searchParams.get('store') ?? '',
        ambiente: searchParams.get('ambiente') ?? '',
        subcategoria: searchParams.get('subcategoria') ?? '',
        stock: searchParams.get('stock') ?? '',
    }

    // Local state for text input — only fires on search button click or Enter
    const [inputValue, setInputValue] = useState(current.q)

    const update = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // If ambiente changes, reset subcategoria
        if (key === 'ambiente') params.delete('subcategoria')

        router.push(`${pathname}?${params.toString()}`)
    }, [router, pathname, searchParams])

    const clearAll = () => {
        setInputValue('')
        router.push(pathname)
    }

    const submitSearch = () => {
        update('q', inputValue.trim())
    }

    const hasFilters = Object.values(current).some(v => v !== '') || inputValue !== current.q

    const currentAmbienteSlug = current.ambiente
    const subcategoriasForAmbiente = ambienteMap[currentAmbienteSlug] ?? []

    const selectStyle = {
        padding: '8px 10px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '13px',
        backgroundColor: '#fff',
        color: '#333',
        cursor: 'pointer',
        minWidth: '140px',
    }

    const labelStyle = {
        fontSize: '11px',
        fontWeight: '600' as const,
        color: '#888',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        marginBottom: '3px',
        display: 'block',
    }

    return (
        <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                {/* Text search */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={labelStyle}>Búsqueda</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                            type="text"
                            placeholder="Código o nombre..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitSearch()}
                            style={{ ...selectStyle, minWidth: '200px' }}
                        />
                        <button
                            onClick={submitSearch}
                            style={{
                                padding: '8px 14px',
                                backgroundColor: '#0070f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '13px',
                            }}
                        >
                            Buscar
                        </button>
                    </div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={labelStyle}>Estado</span>
                    <select style={selectStyle} value={current.status} onChange={e => update('status', e.target.value)}>
                        <option value="">Todos</option>
                        <option value="active">Solo activos</option>
                        <option value="hidden">Solo ocultos</option>
                    </select>
                </div>

                {/* Images */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={labelStyle}>Imágenes</span>
                    <select style={selectStyle} value={current.images} onChange={e => update('images', e.target.value)}>
                        <option value="">Todos</option>
                        <option value="with">Con imagen</option>
                        <option value="without">Sin imagen</option>
                    </select>
                </div>

                {/* Stock */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={labelStyle}>Stock</span>
                    <select style={selectStyle} value={current.stock} onChange={e => update('stock', e.target.value)}>
                        <option value="">Todos</option>
                        <option value="instock">En stock (&gt; 0)</option>
                        <option value="nostock">Sin stock (= 0)</option>
                    </select>
                </div>

                {/* Store */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={labelStyle}>Tienda</span>
                    <select style={selectStyle} value={current.store} onChange={e => update('store', e.target.value)}>
                        <option value="">Todas</option>
                        {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Ambiente */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={labelStyle}>Ambiente</span>
                    <select style={selectStyle} value={current.ambiente} onChange={e => update('ambiente', e.target.value)}>
                        <option value="">Todos</option>
                        {Object.keys(ambienteMap).map(a => (
                            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Subcategoria (only show if ambiente selected) */}
                {subcategoriasForAmbiente.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={labelStyle}>Subcategoría</span>
                        <select style={selectStyle} value={current.subcategoria} onChange={e => update('subcategoria', e.target.value)}>
                            <option value="">Todas</option>
                            {subcategoriasForAmbiente.map(s => (
                                <option key={s.slug} value={s.slug}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Clear all */}
                {hasFilters && (
                    <button
                        onClick={clearAll}
                        style={{
                            padding: '8px 14px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fca5a5',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            alignSelf: 'flex-end',
                        }}
                    >
                        ✕ Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    )
}
