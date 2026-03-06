import { mockSubcategorias } from './mockSubcategorias'
import { Subcategoria } from './subcategoria.types'

/**
 * subcategoria.service.ts
 * Lógica de negocio para subcategorías del catálogo.
 * Los componentes UI consumen este servicio — nunca acceden directamente al mock o repositorio.
 * Cuando se conecte Supabase, solo hay que cambiar la fuente de datos aquí.
 */

/**
 * getSubcategoriasByAmbiente
 * Devuelve las subcategorías disponibles para un ambiente concreto.
 * Usada por la barra de filtros para renderizar la fila secundaria de subcategorías.
 */
export function getSubcategoriasByAmbiente(ambiente: string): Subcategoria[] {
    return mockSubcategorias.filter(s => s.ambiente === ambiente)
}
