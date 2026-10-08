/**
 * search-terms.ts
 * Limpia las palabras de búsqueda antes de insertarlas en una expresión de
 * filtro de PostgREST (p. ej. `materials_search.ilike."%madera%"`).
 *
 * Esos caracteres tienen significado en la expresión: la coma separa
 * condiciones, las comillas y los paréntesis agrupan, y `%` es un comodín.
 * Si una palabra los contuviera (error de la IA o intento de inyección),
 * podría cerrar la condición y añadir otras que nadie pidió.
 */

const UNSAFE_CHARS = /[%,()"\\]/g

export function sanitizeSearchTerms(terms: string[] | null | undefined): string[] {
    return (terms ?? [])
        .map(term => term.replace(UNSAFE_CHARS, '').trim().toLowerCase())
        .filter(Boolean)
}
