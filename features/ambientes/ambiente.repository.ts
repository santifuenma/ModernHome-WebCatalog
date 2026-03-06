import { Ambiente } from './ambiente.types'

/**
 * ambiente.repository.ts
 * Capa de acceso a datos para ambientes.
 * Actualmente devuelve datos mock — reemplazar con queries a Supabase cuando esté conectado.
 *
 * TODO: Implementar con Supabase:
 * const { data } = await supabase.from('ambientes').select('*')
 */
export async function fetchAmbientes(): Promise<Ambiente[]> {
    // Placeholder: retorna mock data hasta que Supabase esté configurado
    const { mockAmbientes } = await import('./mockAmbientes')
    return mockAmbientes
}
