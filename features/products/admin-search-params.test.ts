import { describe, it, expect } from 'vitest'
import { parseAdminFilters, toSearchParams } from './admin-search-params'

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

describe('toSearchParams', () => {
    it('escribe los nombres de parámetro que lee parseAdminFilters', () => {
        const params = toSearchParams({
            query: 'dorian', status: 'hidden', images: 'without', store: 'V',
            ambiente: 'comedor', subcategoria: 'mesas', stock: 'nostock',
            materials: ['madera', 'nogal'],
            minWidthCm: 200, maxWidthCm: 300, minDepthCm: 80, maxDepthCm: 120, minHeightCm: 70, maxHeightCm: 80.5,
        })
        expect(Object.fromEntries(params)).toEqual({
            q: 'dorian', status: 'hidden', images: 'without', store: 'V',
            ambiente: 'comedor', subcategoria: 'mesas', stock: 'nostock',
            mat: 'madera,nogal',
            minw: '200', maxw: '300', mind: '80', maxd: '120', minh: '70', maxh: '80.5',
        })
    })

    it('sin filtros devuelve parámetros vacíos', () => {
        expect(toSearchParams({}).toString()).toBe('')
    })

    it('no escribe los campos vacíos ni la lista de materiales vacía', () => {
        expect(toSearchParams({ query: '  ', materials: [], store: '' }).toString()).toBe('')
    })

    it('conserva el cero como valor (mínimo 0 es un número válido)', () => {
        expect(toSearchParams({ minHeightCm: 0 }).get('minh')).toBe('0')
    })

    it('una coma dentro de un material no rompe la lista', () => {
        expect(toSearchParams({ materials: ['madera, nogal', 'mdf'] }).get('mat')).toBe('madera nogal,mdf')
    })

    it('ida y vuelta: parseAdminFilters(toSearchParams(f)) devuelve f', () => {
        const filters = {
            query: 'dorian', status: 'active' as const, store: 'SM', ambiente: 'sala',
            materials: ['madera', 'mdf'], minWidthCm: 190.5, maxHeightCm: 80,
        }
        const back = parseAdminFilters(Object.fromEntries(toSearchParams(filters)))
        expect(back).toMatchObject(filters)
    })
})
