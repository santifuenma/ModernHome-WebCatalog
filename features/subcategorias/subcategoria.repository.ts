import { Subcategoria } from './subcategoria.types'

/**
 * subcategoria.repository.ts
 * Capa de acceso a datos para subcategorías.
 * Actualmente devuelve datos mock — reemplazar con queries a Supabase cuando esté conectado.
 *
 * TODO: Implementar con Supabase:
 * const { data } = await supabase.from('subcategorias').select('*').eq('ambiente', ambiente)
 */
export async function fetchSubcategoriasByAmbiente(ambiente: string): Promise<Subcategoria[]> {
    const { mockSubcategorias } = await import('./mockSubcategorias')
    return mockSubcategorias.filter(s => s.ambiente === ambiente)
}
