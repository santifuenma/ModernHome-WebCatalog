import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { buildFilterSchema } from './ai-search.schema'

const schema = buildFilterSchema(['sala', 'comedor'], ['sofas', 'mesas'])
const ok = (value: unknown) => schema.safeParse(value).success

describe('buildFilterSchema: lo que acepta', () => {
    it('acepta un filtro completo y válido', () => {
        expect(ok({
            q: 'dorian',
            ambiente: 'comedor',
            subcategoria: 'mesas',
            store: 'V',
            stock: 'instock',
            status: 'active',
            images: 'with',
            materials: ['madera', 'nogal'],
            minWidthCm: 200, maxWidthCm: 300,
            minDepthCm: 80, maxDepthCm: 120,
            minHeightCm: 70, maxHeightCm: 80,
        })).toBe(true)
    })

    it('acepta {} (sin filtros) y filtros parciales', () => {
        expect(ok({})).toBe(true)
        expect(ok({ materials: ['mármol', 'marmol'] })).toBe(true)
    })

    it('acepta los límites de las medidas (0 y 1000)', () => {
        expect(ok({ minHeightCm: 0, maxWidthCm: 1000 })).toBe(true)
    })
})

describe('buildFilterSchema: lo que rechaza', () => {
    it('un ambiente o una subcategoría que no existen', () => {
        expect(ok({ ambiente: 'cocina' })).toBe(false)
        expect(ok({ subcategoria: 'camas' })).toBe(false)
    })

    it('una tienda, un stock, un estado o un valor de imágenes inválidos', () => {
        expect(ok({ store: 'XX' })).toBe(false)
        expect(ok({ stock: 'some' })).toBe(false)
        expect(ok({ status: 'deleted' })).toBe(false)
        expect(ok({ images: 'maybe' })).toBe(false)
    })

    it('medidas negativas o por encima de 1000 cm', () => {
        expect(ok({ minWidthCm: -1 })).toBe(false)
        expect(ok({ maxHeightCm: 1001 })).toBe(false)
        expect(ok({ minDepthCm: '200' })).toBe(false)
    })

    it('campos que no están en la plantilla', () => {
        expect(ok({ price: 100 })).toBe(false)
    })

    it('materiales mal formados', () => {
        expect(ok({ materials: [] })).toBe(false)
        expect(ok({ materials: [''] })).toBe(false)
        expect(ok({ materials: ['a'] })).toBe(false)
        expect(ok({ materials: Array.from({ length: 11 }, (_, i) => 'madera' + i) })).toBe(false)
    })

    it('un texto libre vacío o demasiado largo', () => {
        expect(ok({ q: '' })).toBe(false)
        expect(ok({ q: 'x'.repeat(61) })).toBe(false)
    })

    it('ambiente y subcategoría si las listas están vacías', () => {
        const vacio = buildFilterSchema([], [])
        expect(vacio.safeParse({ ambiente: 'sala' }).success).toBe(false)
        expect(vacio.safeParse({ subcategoria: 'mesas' }).success).toBe(false)
        expect(vacio.safeParse({ store: 'V' }).success).toBe(true)
    })
})

describe('buildFilterSchema: JSON Schema para la herramienta de la IA', () => {
    const json = z.toJSONSchema(schema) as {
        additionalProperties: boolean
        properties: Record<string, { enum?: string[]; description?: string }>
    }

    it('no admite campos extra', () => {
        expect(json.additionalProperties).toBe(false)
    })

    it('incluye los valores permitidos de cada enum', () => {
        expect(json.properties.ambiente.enum).toEqual(['sala', 'comedor'])
        expect(json.properties.subcategoria.enum).toEqual(['sofas', 'mesas'])
        expect(json.properties.store.enum).toEqual(['LM', 'SM', 'V', 'CT', 'BT'])
    })

    it('incluye las descripciones que leerá el modelo', () => {
        expect(json.properties.minWidthCm.description).toMatch(/centímetros/)
    })
})
