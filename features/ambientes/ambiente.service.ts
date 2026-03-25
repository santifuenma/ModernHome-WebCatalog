import { Ambiente } from './ambiente.types'

/**
 * ambiente.service.ts
 * Lógica de negocio para ambientes del catálogo.
 * Los componentes UI consumen este servicio — nunca acceden directamente a los datos.
 *
 * TODO: Conectar a Supabase cuando la tabla `ambientes` esté lista:
 *   const { data } = await supabase.from('ambientes').select('*')
 *   return data
 */

// Datos temporales hasta que la tabla `ambientes` exista en Supabase
const AMBIENTES_MOCK: Ambiente[] = [
    { label: 'Sala', slug: 'sala' },
    { label: 'Comedor', slug: 'comedor' },
    { label: 'Dormitorio', slug: 'dormitorio' },
    { label: 'Exterior', slug: 'exterior' },
    { label: 'Complementos', slug: 'complementos' },
]

/**
 * getAmbientes
 * Devuelve la lista completa de ambientes disponibles en el catálogo.
 * Usada por la barra de filtros (Filtros.tsx) para renderizar los botones.
 */
export function getAmbientes(): Ambiente[] {
    return AMBIENTES_MOCK
}
