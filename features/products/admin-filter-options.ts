import { STORE_LABELS } from './product.types'

export interface FilterOption {
    value: string
    label: string
}

export interface FilterGroup {
    /** Parámetro de la URL que controla este grupo (p. ej. "ambiente"). */
    param: 'ambiente' | 'subcategoria' | 'status' | 'stock' | 'store' | 'images'
    title: string
    options: FilterOption[]
    /** Texto que se muestra cuando el grupo no tiene opciones. */
    emptyHint?: string
}

/** Subcategorías agrupadas por ambiente, tal como las devuelve dbGetAllActiveSubcategories. */
export type AmbienteMap = Record<string, { label: string; slug: string }[]>

export interface FilterGroups {
    product: FilterGroup[]
    inventory: FilterGroup[]
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Grupos de filtros del panel desplegable. Son exactamente los filtros que ya existen:
 * cada grupo es de una sola elección, porque la URL admite un valor por filtro.
 * Si no hay ambiente elegido, las subcategorías son las de todos los ambientes.
 */
export function getFilterGroups(ambienteMap: AmbienteMap, selectedAmbiente?: string): FilterGroups {
    const subcategorias = selectedAmbiente
        ? ambienteMap[selectedAmbiente] ?? []
        : [...new Map(Object.values(ambienteMap).flat().map(s => [s.slug, s])).values()]

    return {
        product: [
            {
                param: 'ambiente',
                title: 'Ambiente',
                options: Object.keys(ambienteMap).map(a => ({ value: a, label: capitalize(a) })),
            },
            {
                param: 'subcategoria',
                title: 'Subcategoría',
                options: subcategorias.map(s => ({ value: s.slug, label: s.label })),
                emptyHint: 'No hay subcategorías para este ambiente.',
            },
        ],
        inventory: [
            {
                param: 'status',
                title: 'Estado',
                options: [
                    { value: 'active', label: 'Activos' },
                    { value: 'hidden', label: 'Ocultos' },
                ],
            },
            {
                param: 'stock',
                title: 'Stock',
                options: [
                    { value: 'instock', label: 'Con stock' },
                    { value: 'nostock', label: 'Sin stock' },
                ],
            },
            {
                param: 'store',
                title: 'Tienda',
                options: Object.entries(STORE_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
                param: 'images',
                title: 'Imágenes',
                options: [
                    { value: 'with', label: 'Con imágenes' },
                    { value: 'without', label: 'Sin imágenes' },
                ],
            },
        ],
    }
}
