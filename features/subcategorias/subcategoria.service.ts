import { fetchAllActiveSubcategorias } from './subcategoria.repository'
import { Subcategoria } from './subcategoria.types'

/**
 * subcategoria.service.ts
 * Lógica de negocio para subcategorías del catálogo.
 */

/**
 * getAllActiveSubcategorias
 * Devuelve todas las subcategorías activas agrupadas por ambiente.
 */
export async function getAllActiveSubcategorias(): Promise<Record<string, Subcategoria[]>> {
    return fetchAllActiveSubcategorias()
}

