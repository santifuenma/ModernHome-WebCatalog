import type { AdminFilters } from './product.repository'
import { STORE_LABELS, StoreCode } from './product.types'

export interface FilterChip {
    /** Parámetros de la URL que hay que borrar para quitar este filtro. */
    params: string[]
    /** Texto legible, p. ej. "Largo ≥ 200 cm". */
    label: string
}

const MAX_MATERIALS_SHOWN = 3

const STATUS_LABELS: Record<string, string> = { active: 'Activos', hidden: 'Ocultos' }
const IMAGES_LABELS: Record<string, string> = { with: 'Con imagen', without: 'Sin imagen' }
const STOCK_LABELS: Record<string, string> = { instock: 'Con stock', nostock: 'Sin stock' }

/** "mesas-de-centro" → "mesas de centro" */
function readable(slug: string): string {
    return slug.replace(/-/g, ' ')
}

function rangeLabel(name: string, min?: number, max?: number): string | null {
    if (min !== undefined && max !== undefined) {
        return min === max ? `${name} = ${min} cm` : `${name} ${min}–${max} cm`
    }
    if (min !== undefined) return `${name} ≥ ${min} cm`
    if (max !== undefined) return `${name} ≤ ${max} cm`
    return null
}

/**
 * Convierte los filtros activos en etiquetas que se muestran (y se pueden quitar una a una).
 * Las dos puntas de una medida (mínimo y máximo) forman una sola etiqueta.
 */
export function getFilterChips(filters: AdminFilters): FilterChip[] {
    const chips: FilterChip[] = []

    if (filters.query) chips.push({ params: ['q'], label: `Texto: ${filters.query}` })
    if (filters.ambiente) chips.push({ params: ['ambiente'], label: `Ambiente: ${filters.ambiente}` })
    if (filters.subcategoria) chips.push({ params: ['subcategoria'], label: `Subcategoría: ${readable(filters.subcategoria)}` })
    if (filters.store) {
        chips.push({ params: ['store'], label: `Tienda: ${STORE_LABELS[filters.store as StoreCode] ?? filters.store}` })
    }
    if (filters.stock && STOCK_LABELS[filters.stock]) chips.push({ params: ['stock'], label: STOCK_LABELS[filters.stock] })
    if (filters.status && STATUS_LABELS[filters.status]) chips.push({ params: ['status'], label: STATUS_LABELS[filters.status] })
    if (filters.images && IMAGES_LABELS[filters.images]) chips.push({ params: ['images'], label: IMAGES_LABELS[filters.images] })

    if (filters.materials?.length) {
        const shown = filters.materials.slice(0, MAX_MATERIALS_SHOWN).join(', ')
        const extra = filters.materials.length - MAX_MATERIALS_SHOWN
        chips.push({ params: ['mat'], label: `Material: ${shown}${extra > 0 ? ` +${extra}` : ''}` })
    }

    const measures: [string, string[], number | undefined, number | undefined][] = [
        ['Largo', ['minw', 'maxw'], filters.minWidthCm, filters.maxWidthCm],
        ['Profundidad', ['mind', 'maxd'], filters.minDepthCm, filters.maxDepthCm],
        ['Alto', ['minh', 'maxh'], filters.minHeightCm, filters.maxHeightCm],
    ]
    for (const [name, params, min, max] of measures) {
        const label = rangeLabel(name, min, max)
        if (label) chips.push({ params, label })
    }

    return chips
}
