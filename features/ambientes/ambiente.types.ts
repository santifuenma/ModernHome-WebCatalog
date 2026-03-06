/**
 * ambiente.types.ts
 * Define el tipo de datos para un ambiente del catálogo (sala, dormitorio, etc.).
 * Cuando se conecte Supabase, este tipo mapeará la respuesta de la tabla `ambientes`.
 */

export interface Ambiente {
    /** Texto visible en la UI (ej: "Dormitorio") */
    label: string

    /** Identificador de URL (ej: "dormitorio") — debe coincidir con el campo `ambiente` en productos */
    slug: string
}
