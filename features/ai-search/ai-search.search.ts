import { toSearchParams } from '@/features/products/admin-search-params'
import { interpretSearch, AiSearchError, AiSearchErrorCode } from './ai-search.service'
import { validateFilters, toAdminFilters } from './ai-search.validate'
import type { AiFilters } from './ai-search.schema'
import type { Catalog } from './ai-search.prompt'

const ADMIN_PRODUCTS_PATH = '/admin/products'

export type AiSearchOutcome =
    | {
        ok: true
        /** Dirección del listado ya filtrado, p. ej. /admin/products?subcategoria=mesas&minw=200 */
        url: string
        /** Lo que la IA entendió, para mostrarlo al admin. */
        filters: AiFilters
        /** Campos que la IA devolvió y se descartaron por inválidos. */
        dropped: string[]
    }
    | { ok: false; code: AiSearchErrorCode; error: string }

/**
 * La búsqueda completa: frase → IA → validación → dirección con los filtros.
 * No lanza por errores esperados (IA caída, límite de tasa...): los devuelve como `ok: false`.
 */
export async function runAiSearch(
    text: string,
    catalog: Catalog,
    client?: Parameters<typeof interpretSearch>[2],
): Promise<AiSearchOutcome> {
    try {
        const { raw } = await interpretSearch(text, catalog, client)
        const { filters, dropped } = validateFilters(raw, catalog)
        const query = toSearchParams(toAdminFilters(filters)).toString()

        return {
            ok: true,
            url: query ? `${ADMIN_PRODUCTS_PATH}?${query}` : ADMIN_PRODUCTS_PATH,
            filters,
            dropped,
        }
    } catch (err) {
        if (err instanceof AiSearchError) return { ok: false, code: err.code, error: err.message }
        throw err
    }
}
