/**
 * search-terms.ts
 * Limpia las palabras de búsqueda antes de insertarlas en una expresión de
 * filtro de PostgREST (p. ej. `materials_search.ilike."%madera%"`).
 *
 * Esos caracteres tienen significado en la expresión: la coma separa
 * condiciones, las comillas y los paréntesis agrupan, y `%` es un comodín.
 * Si una palabra los contuviera (error de la IA o intento de inyección),
 * podría cerrar la condición y añadir otras que nadie pidió.
 *
 * También quita las tildes: materials_search se guarda sin ellas, así que
 * "mármol" y "marmol" deben buscar lo mismo.
 */

const UNSAFE_CHARS = /[%,()"\\]/g

/**
 * Quita solo los caracteres con significado en la sintaxis del filtro (no las tildes ni las
 * mayúsculas). Para texto que se busca tal cual, como el nombre o el código de un producto.
 */
export function stripFilterSyntax(text: string): string {
    return text.replace(UNSAFE_CHARS, '')
}

// Debe coincidir con el translate() de database/migrations/003_materials_search_unaccent.sql
const ACCENTED = 'áéíóúüñ'
const PLAIN = 'aeiouun'

/** "mármol" → "marmol". Solo las letras de ACCENTED, igual que la base de datos. */
function stripAccents(text: string): string {
    return text.replace(/[áéíóúüñ]/g, c => PLAIN[ACCENTED.indexOf(c)])
}

export function sanitizeSearchTerms(terms: string[] | null | undefined): string[] {
    return (terms ?? [])
        .map(term => stripAccents(stripFilterSyntax(term).trim().toLowerCase()))
        .filter(Boolean)
}
