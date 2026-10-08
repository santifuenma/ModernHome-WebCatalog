import { z } from 'zod'
import { STORE_LABELS, StoreCode } from '@/features/products/product.types'

const STORE_CODES = Object.keys(STORE_LABELS) as [StoreCode, ...StoreCode[]]

/** Enum opcional con los valores del momento. Si la lista está vacía, el campo no acepta nada. */
function optionalEnum(values: string[]): z.ZodType<string | undefined> {
    return values.length > 0
        ? z.enum(values as [string, ...string[]]).optional()
        : z.never().optional()
}

const cm = () => z.number().min(0).max(1000).optional()

/**
 * Esquema de los filtros que la IA puede devolver.
 * Los ambientes y subcategorías se pasan por parámetro porque dependen del catálogo.
 */
export function buildFilterSchema(ambientes: string[], subcategorias: string[]) {
    return z.strictObject({
        q: z.string().trim().min(1).max(60).optional()
            .describe('Texto libre: nombre o código de un producto concreto, p. ej. "dorian".'),
        ambiente: optionalEnum(ambientes)
            .describe('Ambiente de la casa del producto.'),
        subcategoria: optionalEnum(subcategorias)
            .describe('Tipo de producto (sofás, mesas, camas...).'),
        store: z.enum(STORE_CODES).optional()
            .describe('Código de la tienda que tiene el producto.'),
        stock: z.enum(['instock', 'nostock']).optional()
            .describe('instock = con existencias; nostock = sin existencias.'),
        status: z.enum(['active', 'hidden']).optional()
            .describe('active = publicado en el catálogo; hidden = oculto.'),
        images: z.enum(['with', 'without']).optional()
            .describe('with = tiene imágenes; without = no tiene imágenes.'),
        materials: z.array(z.string().trim().min(2).max(40)).min(1).max(10).optional()
            .describe('Palabras clave de material, incluidos sinónimos en español e inglés, con y sin tilde. Basta con que coincida una.'),
        minWidthCm: cm().describe('Largo o ancho frontal mínimo, en centímetros.'),
        maxWidthCm: cm().describe('Largo o ancho frontal máximo, en centímetros.'),
        minDepthCm: cm().describe('Profundidad mínima, en centímetros.'),
        maxDepthCm: cm().describe('Profundidad máxima, en centímetros.'),
        minHeightCm: cm().describe('Altura mínima, en centímetros.'),
        maxHeightCm: cm().describe('Altura máxima, en centímetros.'),
    })
}

export type AiFilters = z.infer<ReturnType<typeof buildFilterSchema>>
