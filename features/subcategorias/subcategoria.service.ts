import { dbGetAllActiveSubcategories } from '../products/product.repository'
import { Subcategoria } from './subcategoria.types'

/**
 * subcategoria.service.ts
 * Lógica de negocio para subcategorías del catálogo.
 */

/**
 * getAllActiveSubcategorias
 * Fetch all subcategories directly from the database (active products only)
 * and returns them grouped by ambiente.
 */
export async function getAllActiveSubcategorias(): Promise<Record<string, Subcategoria[]>> {
    const rawData = await dbGetAllActiveSubcategories()
    
    // The repository function already formats it to the required shape:
    // Record<string, { label: string, slug: string, ambiente: string }[]>
    return rawData as Record<string, Subcategoria[]>
}
