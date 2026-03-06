import { mockAmbientes } from './mockAmbientes'
import { Ambiente } from './ambiente.types'

/**
 * ambiente.service.ts
 * Lógica de negocio para ambientes del catálogo.
 * Los componentes UI consumen este servicio — nunca acceden directamente al mock o al repositorio.
 * Cuando se conecte Supabase, solo hay que cambiar la fuente de datos aquí.
 */

/**
 * getAmbientes
 * Devuelve la lista completa de ambientes disponibles en el catálogo.
 * Usada por la barra de filtros (Filtros.tsx) para renderizar los botones.
 */
export function getAmbientes(): Ambiente[] {
    return mockAmbientes
}
