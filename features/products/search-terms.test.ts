import { describe, it, expect } from 'vitest'
import { sanitizeSearchTerms } from './search-terms'

describe('sanitizeSearchTerms', () => {
    it('pasa a minúsculas y recorta espacios', () => {
        expect(sanitizeSearchTerms(['Madera', ' NOGAL ', 'mdf'])).toEqual(['madera', 'nogal', 'mdf'])
    })

    it('conserva tildes y espacios internos', () => {
        expect(sanitizeSearchTerms(['mármol', 'madera maciza'])).toEqual(['mármol', 'madera maciza'])
    })

    it('descarta palabras vacías o que quedan vacías tras limpiar', () => {
        expect(sanitizeSearchTerms(['mármol', '%', '', '  ', '(),'])).toEqual(['mármol'])
    })

    it('elimina los caracteres con significado en el filtro', () => {
        const [term] = sanitizeSearchTerms(['ma%de,ra(")\\'])
        expect(term).toBe('madera')
    })

    it('neutraliza un intento de cerrar la condición e inyectar otra', () => {
        const [term] = sanitizeSearchTerms(['madera",name.ilike."%'])
        expect(term).not.toMatch(/["%,()]/)
    })

    it('tolera null, undefined y lista vacía', () => {
        expect(sanitizeSearchTerms(null)).toEqual([])
        expect(sanitizeSearchTerms(undefined)).toEqual([])
        expect(sanitizeSearchTerms([])).toEqual([])
    })
})
