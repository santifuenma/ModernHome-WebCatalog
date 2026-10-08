import { describe, it, expect } from 'vitest'
import { validateFilters, toAdminFilters } from './ai-search.validate'

const catalog = { ambientes: ['sala', 'comedor'], subcategorias: ['sofas', 'mesas'] }

describe('validateFilters: respuestas correctas', () => {
    it('conserva todos los filtros válidos', () => {
        const raw = { subcategoria: 'mesas', store: 'V', stock: 'instock', materials: ['madera'], minWidthCm: 200 }
        expect(validateFilters(raw, catalog)).toEqual({ filters: raw, dropped: [] })
    })

    it('{} es válido y no descarta nada', () => {
        expect(validateFilters({}, catalog)).toEqual({ filters: {}, dropped: [] })
    })

    it('ignora los campos null o undefined sin avisar', () => {
        expect(validateFilters({ store: null, stock: undefined }, catalog)).toEqual({ filters: {}, dropped: [] })
    })
})

describe('validateFilters: rescata lo bueno de respuestas malas (casos reales de las pruebas)', () => {
    it('un campo inválido no tira los demás', () => {
        const raw = { store: 'LM', status: 'hidden', images: 'nostock' }
        expect(validateFilters(raw, catalog)).toEqual({
            filters: { store: 'LM', status: 'hidden' },
            dropped: ['images'],
        })
    })

    it('respuesta rellenada "por completar": se queda solo con lo real', () => {
        const raw = {
            status: 'hidden', images: '', materials: [''],
            minWidthCm: 0, maxWidthCm: 1000, minDepthCm: 0, maxDepthCm: 1000, minHeightCm: 0, maxHeightCm: 1000,
        }
        const result = validateFilters(raw, catalog)
        expect(result.filters).toEqual({ status: 'hidden' })
        expect(result.dropped).toEqual(['images'])
    })

    it('descarta ambiente y subcategoría que no existen en el catálogo', () => {
        const result = validateFilters({ ambiente: 'cocina', subcategoria: 'camas', store: 'V' }, catalog)
        expect(result.filters).toEqual({ store: 'V' })
        expect(result.dropped).toEqual(['ambiente', 'subcategoria'])
    })

    it('descarta campos desconocidos, también los peligrosos', () => {
        const raw = JSON.parse('{"price":10,"__proto__":{"x":1},"constructor":"y","store":"V"}')
        const result = validateFilters(raw, catalog)
        expect(result.filters).toEqual({ store: 'V' })
        expect(result.dropped.sort()).toEqual(['__proto__', 'constructor', 'price'])
    })

    it('medidas fuera de rango o con tipo equivocado', () => {
        const result = validateFilters({ minWidthCm: -5, maxHeightCm: '80', minDepthCm: 50 }, catalog)
        expect(result.filters).toEqual({ minDepthCm: 50 })
        expect(result.dropped).toEqual(['minWidthCm', 'maxHeightCm'])
    })
})

describe('validateFilters: limpieza', () => {
    it('materiales: recorta, pasa a minúsculas, quita duplicados, vacíos y demasiado cortos', () => {
        const result = validateFilters({ materials: [' Madera ', 'madera', '', 'a', 'MDF', 5] }, catalog)
        expect(result.filters.materials).toEqual(['madera', 'mdf'])
        expect(result.dropped).toEqual([])
    })

    it('materiales: se queda con los 10 primeros', () => {
        const many = Array.from({ length: 15 }, (_, i) => 'material' + i)
        expect(validateFilters({ materials: many }, catalog).filters.materials).toHaveLength(10)
    })

    it('materiales que no son una lista se descartan con aviso', () => {
        expect(validateFilters({ materials: 'madera' }, catalog).dropped).toEqual(['materials'])
    })

    it('q: se recorta y, si queda vacío, se ignora', () => {
        expect(validateFilters({ q: '  dorian ' }, catalog).filters.q).toBe('dorian')
        expect(validateFilters({ q: '   ' }, catalog)).toEqual({ filters: {}, dropped: [] })
    })

    it('q: quita los caracteres de sintaxis del filtro (inyección)', () => {
        const result = validateFilters({ q: 'x",name.ilike."%' }, catalog)
        expect(result.filters.q).toBe('xname.ilike.')
        expect(result.filters.q).not.toMatch(/["%,()\\]/)
    })

    it('q formado solo por caracteres de sintaxis se ignora', () => {
        expect(validateFilters({ q: '"%,()' }, catalog)).toEqual({ filters: {}, dropped: [] })
    })

    it('materiales: quita los caracteres de sintaxis del filtro', () => {
        const result = validateFilters({ materials: ['madera",name.ilike."%', 'mdf'] }, catalog)
        expect(result.filters.materials).toEqual(['maderaname.ilike.', 'mdf'])
    })

    it('q demasiado largo se descarta con aviso', () => {
        expect(validateFilters({ q: 'x'.repeat(61) }, catalog).dropped).toEqual(['q'])
    })

    it('mínimo mayor que máximo: los intercambia', () => {
        const result = validateFilters({ minWidthCm: 300, maxWidthCm: 100 }, catalog)
        expect(result.filters).toEqual({ minWidthCm: 100, maxWidthCm: 300 })
    })

    it('medidas imposibles para un mueble (error de unidades) se descartan con aviso', () => {
        const result = validateFilters({ minDepthCm: 1000, minHeightCm: 40, maxHeightCm: 40, maxWidthCm: 2500 }, catalog)
        expect(result.filters).toEqual({ minHeightCm: 40, maxHeightCm: 40 })
        expect(result.dropped.sort()).toEqual(['maxWidthCm', 'minDepthCm'])
    })

    it('600 cm todavía se acepta', () => {
        expect(validateFilters({ maxWidthCm: 600 }, catalog).filters).toEqual({ maxWidthCm: 600 })
    })

    it('mínimo igual al máximo se respeta', () => {
        expect(validateFilters({ minHeightCm: 80, maxHeightCm: 80 }, catalog).filters)
            .toEqual({ minHeightCm: 80, maxHeightCm: 80 })
    })
})

describe('validateFilters: entradas que no son un objeto', () => {
    it('null, texto, número y lista devuelven vacío con aviso, sin lanzar', () => {
        for (const raw of [null, undefined, 'hola', 42, [1, 2]]) {
            expect(validateFilters(raw, catalog)).toEqual({ filters: {}, dropped: ['respuesta'] })
        }
    })
})

describe('toAdminFilters', () => {
    it('renombra q como query y conserva el resto', () => {
        expect(toAdminFilters({ q: 'dorian', store: 'V', minWidthCm: 200 }))
            .toEqual({ query: 'dorian', store: 'V', minWidthCm: 200 })
    })

    it('sin q, query queda indefinido', () => {
        expect(toAdminFilters({ store: 'V' }).query).toBeUndefined()
    })
})
