'use client'

import { Subcategoria } from '@/features/subcategorias/subcategoria.types'
import { saveProduct } from '@/app/admin/actions'
import { Product, STORE_LABELS, StoreCode } from '@/features/products/product.types'
import { useState } from 'react'
import styles from './ProductForm.module.css'

// ─────────────────────────────────────────────────────────────────
// ProductForm
// Renders the main product data form.
// When used inside ProductEditShell (edit mode), selectedStores and
// stockByStore are passed as controlled props from the parent.
// When used standalone (create mode), it manages its own state.
// ─────────────────────────────────────────────────────────────────

interface ProductFormProps {
    initialData?: Product
    ambientes: { label: string, slug: string }[]
    subcategoriaMap: Record<string, Subcategoria[]>
    // Controlled props (passed from ProductEditShell in edit mode)
    selectedStores?: StoreCode[]
    stockByStore?: Record<string, number>
}

export function ProductForm({ initialData, ambientes, subcategoriaMap, selectedStores: controlledStores, stockByStore: controlledStock }: ProductFormProps) {
    const isEditing = !!initialData
    const isControlled = controlledStores !== undefined

    const [loading, setLoading] = useState(false)
    const amb = initialData?.ambiente
    const [selectedAmbiente, setSelectedAmbiente] = useState(
        amb && amb !== 'general' ? amb : ''
    )
    const [selectedSubcategoria, setSelectedSubcategoria] = useState(initialData?.subcategoria || '')
    const [isNewSubcategoria, setIsNewSubcategoria] = useState(false)

    // Uncontrolled state (only used in standalone / create mode)
    const [localStores, setLocalStores] = useState<StoreCode[]>(
        initialData?.stores?.map(s => s.storeCode) ?? []
    )
    const [localStock, setLocalStock] = useState<Record<string, number>>(
        Object.fromEntries(initialData?.stores?.map(s => [s.storeCode, s.stock ?? 0]) ?? [])
    )

    const selectedStores = isControlled ? controlledStores! : localStores
    const stockByStore = isControlled ? controlledStock! : localStock

    const toggleStore = (code: StoreCode) => {
        if (!isControlled) {
            setLocalStores(prev => prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code])
        }
    }

    const setStock = (code: StoreCode, value: number) => {
        if (!isControlled) {
            setLocalStock(prev => ({ ...prev, [code]: Math.max(0, value) }))
        }
    }

    const availableSubcategorias = subcategoriaMap[selectedAmbiente] || []

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
            className={styles.form}
        >
            {isEditing && <input type="hidden" name="id" value={initialData.id} />}

            {/* Hidden fields for stores + stock (always submitted with the form) */}
            {selectedStores.map(code => (
                <input key={code} type="hidden" name="stores" value={code} />
            ))}
            {selectedStores.map(code => (
                <input key={`stock_${code}`} type="hidden" name={`stock_${code}`} value={stockByStore[code] ?? 0} />
            ))}

            {/* ── Identificación ────────────────────────────── */}
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Código *</label>
                    <input
                        required
                        type="text"
                        name="code"
                        defaultValue={initialData?.code}
                        placeholder="SKU-123"
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Slug</label>
                    <input
                        type="text"
                        name="slug"
                        defaultValue={initialData?.slug}
                        placeholder="auto-generado"
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Nombre *</label>
                <input
                    required
                    type="text"
                    name="name"
                    defaultValue={initialData?.name}
                    placeholder="Nombre del producto"
                    className={styles.input}
                />
            </div>

            {/* ── Marca y diseñador ──────────────────────────── */}
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Marca *</label>
                    <input
                        required
                        type="text"
                        name="brand"
                        defaultValue={initialData?.brand || 'general'}
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Diseñador</label>
                    <input
                        type="text"
                        name="designer"
                        defaultValue={initialData?.designer}
                        placeholder="Opcional"
                        className={styles.input}
                    />
                </div>
            </div>

            {/* ── Categorización ─────────────────────────────── */}
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label}>Ambiente *</label>
                    <select
                        required
                        name="ambiente"
                        value={selectedAmbiente}
                        onChange={(e) => {
                            setSelectedAmbiente(e.target.value)
                            setSelectedSubcategoria('')
                            setIsNewSubcategoria(false)
                        }}
                        className={styles.select}
                    >
                        <option value="" disabled>Selecciona un ambiente</option>
                        {ambientes.map(a => (
                            <option key={a.slug} value={a.slug}>{a.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Subcategoría *</label>
                    <select
                        required={!isNewSubcategoria}
                        name={isNewSubcategoria ? '_ignore_subcategoria' : 'subcategoria'}
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
                        className={styles.select}
                    >
                        <option value="" disabled>Selecciona subcategoría</option>
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
                            placeholder="ej: mesas-de-centro"
                            className={styles.input}
                            style={{ marginTop: '0.4rem' }}
                            autoFocus
                        />
                    )}
                </div>
            </div>

            {/* ── URL externa ────────────────────────────────── */}
            <div className={styles.field}>
                <label className={styles.label}>URL externa</label>
                <input
                    type="url"
                    name="url"
                    defaultValue={initialData?.url}
                    placeholder="https://..."
                    className={styles.input}
                />
            </div>

            {/* ── Características ────────────────────────────── */}
            <div className={styles.field}>
                <label className={styles.label}>Materiales (uno por línea)</label>
                <textarea
                    name="materials"
                    defaultValue={initialData?.materials?.join('\n')}
                    rows={3}
                    className={styles.textarea}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Dimensiones (una por línea)</label>
                <textarea
                    name="dimensions"
                    defaultValue={initialData?.dimensions?.join('\n')}
                    rows={3}
                    className={styles.textarea}
                />
            </div>

            {/* Standalone mode (create): show the store panel embedded in the form */}
            {!isControlled && (
                <div>
                    <p className={styles.label} style={{ marginBottom: '0.6rem' }}>Tiendas y Stock</p>
                    <StoreStockPanel
                        selectedStores={selectedStores}
                        stockByStore={stockByStore}
                        onToggleStore={toggleStore}
                        onSetStock={setStock}
                    />
                </div>
            )}

            {/* ── Botón guardar ──────────────────────────────── */}
            <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
            >
                {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────────
// StoreStockPanel — panel de tiendas + stock con controles +/−
// ─────────────────────────────────────────────────────────────────

interface StoreStockPanelProps {
    selectedStores: StoreCode[]
    stockByStore: Record<string, number>
    onToggleStore: (code: StoreCode) => void
    onSetStock: (code: StoreCode, value: number) => void
}

export function StoreStockPanel({ selectedStores, stockByStore, onToggleStore, onSetStock }: StoreStockPanelProps) {
    return (
        <div>
            {/* Grid de chips de tienda */}
            <div className={styles.storeGrid}>
                {(Object.entries(STORE_LABELS) as [StoreCode, string][]).map(([code, label]) => {
                    const active = selectedStores.includes(code)
                    return (
                        <button
                            key={code}
                            type="button"
                            onClick={() => onToggleStore(code)}
                            className={`${styles.storeChip} ${active ? styles.storeChipActive : ''}`}
                        >
                            <span className={`${styles.storeDot} ${active ? styles.storeDotActive : ''}`} />
                            <span className={styles.storeCode}>{code}</span>
                            <span className={styles.storeName}>{label}</span>
                        </button>
                    )
                })}
            </div>

            {selectedStores.length === 0 && (
                <p className={styles.noStoreHint}>
                    Sin tienda asignada — el producto no aparecerá en filtros de tienda.
                </p>
            )}

            {/* Panel de stock por tienda */}
            {selectedStores.length > 0 && (
                <div className={styles.stockPanel}>
                    <p className={styles.stockPanelTitle}>Stock por tienda</p>

                    {selectedStores.map(code => (
                        <div key={code} className={styles.stockRow}>
                            <div className={styles.stockLabel}>
                                <span className={styles.stockCode}>{code}</span>
                                <span className={styles.stockStoreName}>{STORE_LABELS[code]}</span>
                            </div>

                            <div className={styles.stockControl}>
                                <button
                                    type="button"
                                    className={styles.stockBtn}
                                    onClick={() => onSetStock(code, (stockByStore[code] ?? 0) - 1)}
                                    aria-label={`Reducir stock de ${code}`}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    className={styles.stockInput}
                                    value={stockByStore[code] ?? 0}
                                    min={0}
                                    onChange={e => onSetStock(code, Number(e.target.value))}
                                    aria-label={`Stock de ${STORE_LABELS[code]}`}
                                />
                                <button
                                    type="button"
                                    className={styles.stockBtn}
                                    onClick={() => onSetStock(code, (stockByStore[code] ?? 0) + 1)}
                                    aria-label={`Aumentar stock de ${code}`}
                                >
                                    +
                                </button>
                            </div>

                            <span className={styles.stockUnits}>uds.</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
