import type { z } from 'zod'
import type { AdminFilters } from '@/features/products/product.repository'
import { stripFilterSyntax } from '@/features/products/search-terms'
import { buildFilterSchema, AiFilters } from './ai-search.schema'
import type { Catalog } from './ai-search.prompt'

export interface ValidationResult {
    /** Solo los filtros válidos y con sentido. */
    filters: AiFilters
    /** Campos que la IA envió pero se descartaron por inválidos o desconocidos (para avisar al admin). */
    dropped: string[]
}

/** Etiqueta con la que se avisa de campos que la IA devolvió y no existen en el esquema. */
export const UNKNOWN_FIELDS = 'campos desconocidos'

const MEASURE_LIMIT = 1000

// Ningún mueble del catálogo pasa de unos 430 cm. Por encima de esto casi seguro es un error de unidades de la IA
// (p. ej. 1 metro escrito como 1000) y un filtro así dejaría la lista vacía sin que el admin sepa por qué.
const PLAUSIBLE_MAX_CM = 600

const RANGES = [
    ['minWidthCm', 'maxWidthCm'],
    ['minDepthCm', 'maxDepthCm'],
    ['minHeightCm', 'maxHeightCm'],
] as const

/** Quita vacíos y duplicados, y respeta los límites del esquema. Si no queda nada, devuelve undefined. */
function cleanMaterials(value: unknown): unknown {
    if (!Array.isArray(value)) return value // la validación lo rechazará

    const terms = [...new Set(
        value
            .filter((item): item is string => typeof item === 'string')
            .map(item => stripFilterSyntax(item).trim().toLowerCase())
            .filter(item => item.length >= 2 && item.length <= 40),
    )].slice(0, 10)

    return terms.length > 0 ? terms : undefined
}

function cleanQuery(value: unknown): unknown {
    if (typeof value !== 'string') return value
    // Sin caracteres de sintaxis del filtro: así ni siquiera llegan a la URL
    return stripFilterSyntax(value).trim() || undefined
}

/**
 * Valida lo que devolvió la IA CAMPO A CAMPO: un campo malo no tira los demás.
 * Nunca lanza: lo peor que puede pasar es devolver menos filtros.
 */
export function validateFilters(raw: unknown, catalog: Catalog): ValidationResult {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return { filters: {}, dropped: ['respuesta'] }
    }

    const shape = buildFilterSchema(catalog.ambientes, catalog.subcategorias).shape as Record<string, z.ZodType>
    const kept: Record<string, unknown> = {}
    const dropped: string[] = []
    let hasUnknownFields = false

    for (const [key, original] of Object.entries(raw)) {
        // hasOwn y no `shape[key]`: así "constructor" o "__proto__" cuentan como campos desconocidos
        if (!Object.hasOwn(shape, key)) {
            hasUnknownFields = true
            continue
        }

        const value = key === 'materials' ? cleanMaterials(original)
            : key === 'q' ? cleanQuery(original)
            : original

        // Vacío o null = "sin filtro": no es un error
        if (value === undefined || value === null) continue

        const parsed = shape[key].safeParse(value)
        if (parsed.success && parsed.data !== undefined) kept[key] = parsed.data
        else dropped.push(key)
    }

    // Los nombres de campos desconocidos NO se devuelven: se muestran al admin y salen del modelo,
    // así que podrían llevar texto arbitrario. Se avisa con una etiqueta fija.
    if (hasUnknownFields) dropped.push(UNKNOWN_FIELDS)

    // Medidas sin efecto: "mínimo 0" y "máximo 1000" no filtran nada (la IA a veces las rellena "por completar")
    for (const [min, max] of RANGES) {
        if (kept[min] === 0) delete kept[min]
        if (typeof kept[max] === 'number' && kept[max] >= MEASURE_LIMIT) delete kept[max]
    }

    // Medidas imposibles para un mueble: se descartan con aviso
    for (const [min, max] of RANGES) {
        for (const key of [min, max]) {
            const value = kept[key]
            if (typeof value === 'number' && value > PLAUSIBLE_MAX_CM) {
                delete kept[key]
                dropped.push(key)
            }
        }
    }

    // Mínimo mayor que máximo: casi seguro la frase estaba invertida
    for (const [min, max] of RANGES) {
        const lo = kept[min]
        const hi = kept[max]
        if (typeof lo === 'number' && typeof hi === 'number' && lo > hi) {
            kept[min] = hi
            kept[max] = lo
        }
    }

    return { filters: kept as AiFilters, dropped }
}

/** Vocabulario de la IA → vocabulario de los filtros del panel (la única diferencia es q → query). */
export function toAdminFilters(filters: AiFilters): AdminFilters {
    const { q, ...rest } = filters
    return { ...rest, query: q }
}
