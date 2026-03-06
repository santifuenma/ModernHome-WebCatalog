import { Ambiente } from './ambiente.types'

/**
 * mockAmbientes.ts
 * Datos de muestra de los ambientes del catálogo.
 * Sustituir por una query real a Supabase cuando la base de datos esté conectada.
 * El campo `slug` debe coincidir exactamente con el campo `ambiente` de los productos.
 */
export const mockAmbientes: Ambiente[] = [
    { label: 'Sala', slug: 'sala' },
    { label: 'Comedor', slug: 'comedor' },
    { label: 'Dormitorio', slug: 'dormitorio' },
    { label: 'Exterior', slug: 'exterior' },
    { label: 'Complementos', slug: 'complementos' },
]
