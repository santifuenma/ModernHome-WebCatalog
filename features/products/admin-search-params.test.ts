import { describe, it, expect } from 'vitest'
import { parseAdminFilters } from './admin-search-params'

describe('parseAdminFilters', () => {
    it('convierte los textos numéricos a número', () => {
        expect(parseAdminFilters({ minw: '200', maxw: '300.5', mind: '50', maxd: '90', minh: '10', maxh: '80' })).toMatchObject({
            minWidthCm: 200, maxWidthCm: 300.5,
            minDepthCm: 50, maxDepthCm: 90,
            minHeightCm: 10, maxHeightCm: 80,
        })
    })

    it('acepta el cero', () => {
        expect(parseAdminFilters({ minh: '0' }).minHeightCm).toBe(0)
    })

    it('ignora valores que no son un número válido y positivo', () => {
        const f = parseAdminFilters({ minw: 'abc', maxw: '', minh: '-5', maxh: 'Infinity', mind: '   ' })
        expect(f.minWidthCm).toBeUndefined()
        expect(f.maxWidthCm).toBeUndefined()
        expect(f.minHeightCm).toBeUndefined()
        expect(f.maxHeightCm).toBeUndefined()
        expect(f.minDepthCm).toBeUndefined()
    })

    it('separa los materiales por coma y descarta los vacíos', () => {
        expect(parseAdminFilters({ mat: 'madera, nogal,,mdf' }).materials).toEqual(['madera', 'nogal', 'mdf'])
    })

    it('un parámetro de materiales vacío no genera filtro', () => {
        expect(parseAdminFilters({ mat: '' }).materials).toBeUndefined()
        expect(parseAdminFilters({ mat: ' , ' }).materials).toBeUndefined()
        expect(parseAdminFilters({}).materials).toBeUndefined()
    })

    it('mantiene los filtros que ya existían', () => {
        expect(parseAdminFilters({
            q: 'mesa', status: 'active', images: 'with', store: 'V',
            ambiente: 'comedor', subcategoria: 'mesas', stock: 'instock',
        })).toMatchObject({
            query: 'mesa', status: 'active', images: 'with', store: 'V',
            ambiente: 'comedor', subcategoria: 'mesas', stock: 'instock',
        })
    })

    it('sin parámetros no activa ningún filtro', () => {
        const f = parseAdminFilters({})
        expect(Object.values(f).every(v => v === undefined)).toBe(true)
    })
})
