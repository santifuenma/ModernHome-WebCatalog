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

/**
 * El inverso de parseAdminFilters: convierte filtros en los parámetros de la URL de
 * /admin/products. Lo usa la búsqueda con IA para escribir la dirección por el admin.
 */
export function toSearchParams(filters: AdminFilters): URLSearchParams {
    const params = new URLSearchParams()

    const set = (key: keyof AdminSearchParams, value: string | number | undefined) => {
        if (value !== undefined && value !== '') params.set(key, String(value))
    }

    set('q', filters.query?.trim())
    set('status', filters.status)
    set('images', filters.images)
    set('store', filters.store)
    set('ambiente', filters.ambiente)
    set('subcategoria', filters.subcategoria)
    set('stock', filters.stock)

    // La coma separa los materiales en la URL, así que no puede ir dentro de uno
    const materials = (filters.materials ?? []).map(m => m.replace(/,/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean)
    if (materials.length > 0) set('mat', materials.join(','))

    set('minw', filters.minWidthCm)
    set('maxw', filters.maxWidthCm)
    set('mind', filters.minDepthCm)
    set('maxd', filters.maxDepthCm)
    set('minh', filters.minHeightCm)
    set('maxh', filters.maxHeightCm)

    return params
}
