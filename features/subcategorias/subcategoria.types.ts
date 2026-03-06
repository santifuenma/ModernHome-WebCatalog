/**
 * subcategoria.types.ts
 * Define el tipo de datos para una subcategoría del catálogo.
 * Cuando se conecte Supabase, este tipo mapeará la tabla `subcategorias`.
 */

export interface Subcategoria {
    /** Texto visible en la UI (ej: "Sofás") */
    label: string

    /** Identificador de URL (ej: "sofas") — debe coincidir con el campo `subcategoria` en productos */
    slug: string

    /** Ambiente al que pertenece esta subcategoría (ej: "sala") */
    ambiente: string
}
