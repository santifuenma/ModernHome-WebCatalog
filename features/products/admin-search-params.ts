import type { AdminFilters } from './product.repository'

/** Parámetros de la URL de /admin/products (siempre llegan como texto). */
export interface AdminSearchParams {
    q?: string
    status?: string
    images?: string
    store?: string
    ambiente?: string
    subcategoria?: string
    stock?: string
    mat?: string      // materiales separados por coma: "madera,nogal,mdf"
    minw?: string     // ancho (lado frontal) mínimo, en cm
    maxw?: string
    mind?: string     // profundidad
    maxd?: string
    minh?: string     // alto
    maxh?: string
    page?: string
}

/** "200" → 200. Ignora lo que no sea un número válido y positivo ("abc", "-5", ""). */
function parseNumberParam(value?: string): number | undefined {
    if (!value?.trim()) return undefined
    const n = Number(value)
    return Number.isFinite(n) && n >= 0 ? n : undefined
}

/** "madera,nogal" → ["madera", "nogal"]. Devuelve undefined si no hay ninguna. */
function parseListParam(value?: string): string[] | undefined {
    const items = (value ?? '').split(',').map(s => s.trim()).filter(Boolean)
    return items.length > 0 ? items : undefined
}

export function parseAdminFilters(sp: AdminSearchParams): AdminFilters {
    return {
        query: sp.q || undefined,
        status: (sp.status as AdminFilters['status']) || undefined,
        images: (sp.images as AdminFilters['images']) || undefined,
        store: sp.store || undefined,
        ambiente: sp.ambiente || undefined,
        subcategoria: sp.subcategoria || undefined,
        stock: (sp.stock as AdminFilters['stock']) || undefined,
        materials: parseListParam(sp.mat),
        minWidthCm: parseNumberParam(sp.minw),
        maxWidthCm: parseNumberParam(sp.maxw),
        minDepthCm: parseNumberParam(sp.mind),
        maxDepthCm: parseNumberParam(sp.maxd),
        minHeightCm: parseNumberParam(sp.minh),
        maxHeightCm: parseNumberParam(sp.maxh),
    }
}
