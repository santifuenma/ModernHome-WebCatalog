import { dbGetAllActiveSubcategories } from '../products/product.repository'
import { Subcategoria } from './subcategoria.types'

/**
 * subcategoria.repository.ts
 * Capa de acceso a datos para subcategorías.
 * Delega en el repositorio de productos, ya que las subcategorías se derivan
 * de los productos activos en la base de datos.
 *
 * TODO: When a dedicated `subcategorias` table exists in Supabase, replace
 * the delegation below with a direct query:
 *   const { data } = await supabase.from('subcategorias').select('*').eq('active', true)
 */
export async function fetchAllActiveSubcategorias(): Promise<Record<string, Subcategoria[]>> {
    const rawData = await dbGetAllActiveSubcategories()
    return rawData as Record<string, Subcategoria[]>
}
