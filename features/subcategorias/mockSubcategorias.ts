import { Subcategoria } from './subcategoria.types'

/**
 * mockSubcategorias.ts
 * Datos de muestra de subcategorías agrupadas por ambiente.
 * Sustituir por una query real a Supabase cuando la base de datos esté conectada.
 * El campo `slug` debe coincidir con el campo `subcategoria` en los productos.
 */
export const mockSubcategorias: Subcategoria[] = [

    // ─── SALA ────────────────────────────────────────────────────────────
    { label: 'Sofás', slug: 'sofas', ambiente: 'sala' },
    { label: 'Butacas', slug: 'butacas', ambiente: 'sala' },
    { label: 'Sillones', slug: 'sillones', ambiente: 'sala' },
    { label: 'Mesas de centro', slug: 'mesas-de-centro', ambiente: 'sala' },
    { label: 'Mesas laterales', slug: 'mesas-laterales', ambiente: 'sala' },
    { label: 'Mueble de TV', slug: 'mueble-de-tv', ambiente: 'sala' },

    // ─── COMEDOR ──────────────────────────────────────────────────────────
    { label: 'Mesas', slug: 'mesas', ambiente: 'comedor' },
    { label: 'Sillas', slug: 'sillas', ambiente: 'comedor' },
    { label: 'Aparadores', slug: 'aparadores', ambiente: 'comedor' },

    // ─── DORMITORIO ───────────────────────────────────────────────────────
    { label: 'Camas', slug: 'camas', ambiente: 'dormitorio' },
    { label: 'Mesitas', slug: 'mesitas', ambiente: 'dormitorio' },

    // ─── EXTERIOR ─────────────────────────────────────────────────────────
    { label: 'Muebles', slug: 'muebles', ambiente: 'exterior' },

    // ─── COMPLEMENTOS ─────────────────────────────────────────────────────
    { label: 'Iluminación', slug: 'iluminacion', ambiente: 'complementos' },
    { label: 'Decoración', slug: 'decoracion', ambiente: 'complementos' },
]
