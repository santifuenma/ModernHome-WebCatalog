import { describe, it, expect } from 'vitest'
import { getFilterChips } from './admin-filter-chips'

const labels = (filters: Parameters<typeof getFilterChips>[0]) => getFilterChips(filters).map(c => c.label)

describe('getFilterChips', () => {
    it('sin filtros no hay etiquetas', () => {
        expect(getFilterChips({})).toEqual([])
    })

    it('describe los filtros simples y dice qué parámetro borrar', () => {
        expect(getFilterChips({ query: 'dorian', ambiente: 'comedor', subcategoria: 'mesas-de-centro', store: 'V' })).toEqual([
            { params: ['q'], label: 'Texto: dorian' },
            { params: ['ambiente'], label: 'Ambiente: comedor' },
            { params: ['subcategoria'], label: 'Subcategoría: mesas de centro' },
            { params: ['store'], label: 'Tienda: Valencia' },
        ])
    })

    it('traduce stock, estado e imágenes', () => {
        expect(labels({ stock: 'nostock', status: 'hidden', images: 'without' }))
            .toEqual(['Sin stock', 'Ocultos', 'Sin imagen'])
        expect(labels({ stock: 'instock', status: 'active', images: 'with' }))
            .toEqual(['Con stock', 'Activos', 'Con imagen'])
    })

    it('"all" no es un filtro', () => {
        expect(labels({ stock: 'all', status: 'all', images: 'all' })).toEqual([])
    })

    it('una tienda desconocida se muestra tal cual', () => {
        expect(labels({ store: 'ZZ' })).toEqual(['Tienda: ZZ'])
    })

    it('materiales: muestra tres y resume el resto', () => {
        expect(labels({ materials: ['madera'] })).toEqual(['Material: madera'])
        expect(labels({ materials: ['madera', 'wood', 'mdf', 'nogal', 'roble'] })).toEqual(['Material: madera, wood, mdf +2'])
        expect(getFilterChips({ materials: ['madera'] })[0].params).toEqual(['mat'])
    })

    it('medidas: mínimo, máximo, rango e igualdad', () => {
        expect(labels({ minWidthCm: 200 })).toEqual(['Largo ≥ 200 cm'])
        expect(labels({ maxHeightCm: 80 })).toEqual(['Alto ≤ 80 cm'])
        expect(labels({ minDepthCm: 90, maxDepthCm: 110 })).toEqual(['Profundidad 90–110 cm'])
        expect(labels({ minWidthCm: 80, maxWidthCm: 80 })).toEqual(['Largo = 80 cm'])
    })

    it('mínimo y máximo de una medida forman una sola etiqueta que borra los dos parámetros', () => {
        const chips = getFilterChips({ minWidthCm: 190, maxWidthCm: 210 })
        expect(chips).toEqual([{ params: ['minw', 'maxw'], label: 'Largo 190–210 cm' }])
    })

    it('el mínimo 0 también es un filtro que se muestra', () => {
        expect(labels({ minHeightCm: 0 })).toEqual(['Alto ≥ 0 cm'])
    })
})
