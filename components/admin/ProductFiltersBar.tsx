'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { STORE_LABELS } from '@/features/products/product.types'
import styles from './ProductFiltersBar.module.css'

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

    return (
        <div className={styles.card}>
            <div className={styles.filterGrid}>

                {/* Text search */}
                <div className={styles.fieldGroup}>
                    <span className={styles.label}>Búsqueda</span>
                    <div className={styles.searchLayout}>
                        <input
                            type="text"
                            placeholder="Código o nombre..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitSearch()}
                            className={`${styles.input} ${styles.searchInput}`}
                        />
                        <button onClick={submitSearch} className={styles.button}>
                            Buscar
                        </button>
                    </div>
                </div>

                {/* Status */}
                <div className={styles.fieldGroup}>
                    <span className={styles.label}>Estado</span>
                    <select className={styles.select} value={current.status} onChange={e => update('status', e.target.value)}>
                        <option value="">Todos</option>
                        <option value="active">Solo activos</option>
                        <option value="hidden">Solo ocultos</option>
                    </select>
                </div>

                {/* Images */}
                <div className={styles.fieldGroup}>
                    <span className={styles.label}>Imágenes</span>
                    <select className={styles.select} value={current.images} onChange={e => update('images', e.target.value)}>
                        <option value="">Todos</option>
                        <option value="with">Con imagen</option>
                        <option value="without">Sin imagen</option>
                    </select>
                </div>

                {/* Stock */}
                <div className={styles.fieldGroup}>
                    <span className={styles.label}>Stock</span>
                    <select className={styles.select} value={current.stock} onChange={e => update('stock', e.target.value)}>
                        <option value="">Todos</option>
                        <option value="instock">En stock (&gt; 0)</option>
                        <option value="nostock">Sin stock (= 0)</option>
                    </select>
                </div>

                {/* Store */}
                <div className={styles.fieldGroup}>
                    <span className={styles.label}>Tienda</span>
                    <select className={styles.select} value={current.store} onChange={e => update('store', e.target.value)}>
                        <option value="">Todas</option>
                        {Object.entries(STORE_LABELS).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                    </select>
                </div>

                {/* Ambiente */}
                <div className={styles.fieldGroup}>
                    <span className={styles.label}>Ambiente</span>
                    <select className={styles.select} value={current.ambiente} onChange={e => update('ambiente', e.target.value)}>
                        <option value="">Todos</option>
                        {Object.keys(ambienteMap).map(a => (
                            <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Subcategoria (only show if ambiente selected) */}
                {subcategoriasForAmbiente.length > 0 && (
                    <div className={styles.fieldGroup}>
                        <span className={styles.label}>Subcategoría</span>
                        <select className={styles.select} value={current.subcategoria} onChange={e => update('subcategoria', e.target.value)}>
                            <option value="">Todas</option>
                            {subcategoriasForAmbiente.map(s => (
                                <option key={s.slug} value={s.slug}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Clear all */}
                {hasFilters && (
                    <button onClick={clearAll} className={`${styles.button} ${styles.clearButton}`}>
                        ✕ Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    )
}
