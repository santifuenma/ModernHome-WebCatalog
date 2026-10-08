import { describe, it, expect } from 'vitest'
import { getFilterGroups } from './admin-filter-options'

const ambienteMap = {
    sala: [
        { label: 'Sofas', slug: 'sofas' },
        { label: 'Mesas', slug: 'mesas' },
    ],
    comedor: [
        { label: 'Mesas', slug: 'mesas' },
        { label: 'Sillas', slug: 'sillas' },
    ],
}

const byParam = (groups: ReturnType<typeof getFilterGroups>, param: string) =>
    [...groups.product, ...groups.inventory].find(g => g.param === param)!

describe('getFilterGroups', () => {
    it('ofrece exactamente los filtros que ya existen, en dos secciones', () => {
        const groups = getFilterGroups(ambienteMap)
        expect(groups.product.map(g => g.param)).toEqual(['ambiente', 'subcategoria'])
        expect(groups.inventory.map(g => g.param)).toEqual(['status', 'stock', 'store', 'images'])
    })

    it('ambiente: un valor por cada ambiente, con la primera letra en mayúscula', () => {
        expect(byParam(getFilterGroups(ambienteMap), 'ambiente').options).toEqual([
            { value: 'sala', label: 'Sala' },
            { value: 'comedor', label: 'Comedor' },
        ])
    })

    it('subcategoría con un ambiente elegido: solo las de ese ambiente', () => {
        expect(byParam(getFilterGroups(ambienteMap, 'comedor'), 'subcategoria').options).toEqual([
            { value: 'mesas', label: 'Mesas' },
            { value: 'sillas', label: 'Sillas' },
        ])
    })

    it('subcategoría sin ambiente: las de todos, sin repetir las que se llaman igual', () => {
        const values = byParam(getFilterGroups(ambienteMap), 'subcategoria').options.map(o => o.value)
        expect(values).toEqual(['sofas', 'mesas', 'sillas'])
    })

    it('un ambiente desconocido no rompe nada: no hay subcategorías', () => {
        expect(byParam(getFilterGroups(ambienteMap, 'jardin'), 'subcategoria').options).toEqual([])
    })

    it('sin ambientes en el catálogo, no hay opciones pero los filtros de inventario siguen', () => {
        const groups = getFilterGroups({})
        expect(byParam(groups, 'ambiente').options).toEqual([])
        expect(byParam(groups, 'store').options).toHaveLength(5)
    })

    it('usa los mismos valores que entiende la URL', () => {
        const groups = getFilterGroups(ambienteMap)
        expect(byParam(groups, 'status').options.map(o => o.value)).toEqual(['active', 'hidden'])
        expect(byParam(groups, 'stock').options.map(o => o.value)).toEqual(['instock', 'nostock'])
        expect(byParam(groups, 'images').options.map(o => o.value)).toEqual(['with', 'without'])
    })

    it('tiendas: todos los códigos con su nombre', () => {
        expect(byParam(getFilterGroups(ambienteMap), 'store').options).toEqual([
            { value: 'LM', label: 'Las Mercedes' },
            { value: 'SM', label: 'Santa Mónica' },
            { value: 'V', label: 'Valencia' },
            { value: 'CT', label: 'La Castellana' },
            { value: 'BT', label: 'Barquisimeto' },
        ])
    })
})
