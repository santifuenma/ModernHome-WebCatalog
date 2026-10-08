import { describe, it, expect } from 'vitest'
import { sanitizeSearchTerms, stripFilterSyntax } from './search-terms'

describe('sanitizeSearchTerms', () => {
    it('pasa a minúsculas y recorta espacios', () => {
        expect(sanitizeSearchTerms(['Madera', ' NOGAL ', 'mdf'])).toEqual(['madera', 'nogal', 'mdf'])
    })

    it('quita las tildes, igual que la base de datos', () => {
        expect(sanitizeSearchTerms(['mármol', 'MÁRMOL', 'ñandú', 'pingüino'])).toEqual(['marmol', 'marmol', 'nandu', 'pinguino'])
    })

    it('conserva los espacios internos y las letras fuera de la tabla', () => {
        expect(sanitizeSearchTerms(['madera maciza', 'façade'])).toEqual(['madera maciza', 'façade'])
    })

    it('descarta palabras vacías o que quedan vacías tras limpiar', () => {
        expect(sanitizeSearchTerms(['mármol', '%', '', '  ', '(),'])).toEqual(['marmol'])
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

describe('stripFilterSyntax', () => {
    it('quita los caracteres de sintaxis pero conserva tildes y mayúsculas', () => {
        expect(stripFilterSyntax('Diseño "Ñandú" (50%), nuevo\\')).toBe('Diseño Ñandú 50 nuevo')
    })

    it('un intento de inyección queda inofensivo', () => {
        expect(stripFilterSyntax('x",name.ilike."%')).toBe('xname.ilike.')
    })
})
