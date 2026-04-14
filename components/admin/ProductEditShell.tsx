'use client'

/**
 * ProductEditShell
 * Client component that acts as the two-column layout for the product edit page.
 * It owns the shared state (selectedStores, stockByStore) so that ProductForm and
 * StoreStockPanel can communicate without prop drilling through server components.
 */

import { useState } from 'react'
import { Product, StoreCode, MaterialSwatch } from '@/features/products/product.types'
import { Subcategoria } from '@/features/subcategorias/subcategoria.types'
import { ProductForm, StoreStockPanel } from '@/components/admin/ProductForm'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { SwatchesManager } from '@/components/admin/SwatchesManager'
import { DownloadsManager } from '@/components/admin/DownloadsManager'
import styles from '@/components/admin/ProductForm.module.css'

interface ProductEditShellProps {
    product: Product
    ambientes: { label: string, slug: string }[]
    subcategoriaMap: Record<string, Subcategoria[]>
    availableSwatches: MaterialSwatch[]
}

export function ProductEditShell({ product, ambientes, subcategoriaMap, availableSwatches }: ProductEditShellProps) {
    const [selectedStores, setSelectedStores] = useState<StoreCode[]>(
        product.stores?.map(s => s.storeCode) ?? []
    )
    const [stockByStore, setStockByStore] = useState<Record<string, number>>(
        Object.fromEntries(product.stores?.map(s => [s.storeCode, s.stock ?? 0]) ?? [])
    )

    const toggleStore = (code: StoreCode) => {
        setSelectedStores(prev =>
            prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code]
        )
    }

    const setStock = (code: StoreCode, value: number) => {
        setStockByStore(prev => ({ ...prev, [code]: Math.max(0, value) }))
    }

    return (
        <div className={styles.layout}>

            {/* ── Columna principal (izquierda) ───────────────────── */}
            <div className={styles.mainCol}>

                {/* Datos del producto */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Datos del producto</h2>
                    <ProductForm
                        initialData={product}
                        ambientes={ambientes}
                        subcategoriaMap={subcategoriaMap}
                        selectedStores={selectedStores}
                        stockByStore={stockByStore}
                    />
                </div>

                {/* Imágenes */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Imágenes del producto</h2>
                    <ImageUploader productId={product.id} images={product.images} />
                </div>

                {/* Swatches */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Muestras de material</h2>
                    <SwatchesManager
                        productId={product.id}
                        swatches={product.materialSwatches || []}
                        availableSwatches={availableSwatches}
                    />
                </div>

                {/* Descargables */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Archivo descargable</h2>
                    <DownloadsManager productId={product.id} download={product.download} />
                </div>

            </div>

            {/* ── Columna lateral (derecha) ───────────────────────── */}
            <div className={styles.sideCol}>
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Tiendas y Stock</h2>
                    <StoreStockPanel
                        selectedStores={selectedStores}
                        stockByStore={stockByStore}
                        onToggleStore={toggleStore}
                        onSetStock={setStock}
                    />
                </div>
            </div>

        </div>
    )
}
