import { describe, it, expect } from 'vitest'
import { parseDimensions, toDimensionColumns } from './dimensions.parser'

describe('parseDimensions', () => {
    it('Largo + Ancho + Alto: el Ancho es la profundidad', () => {
        expect(parseDimensions(['Largo: 200 cm', 'Ancho: 100 cm', 'Alto: 78 cm'])).toEqual({
            widthCm: 200, depthCm: 100, heightCm: 78, unparsed: [],
        })
    })

    it('Ancho + Profundidad + Alto: el Ancho es el lado frontal', () => {
        expect(parseDimensions(['Ancho: 103 cm', 'Profundidad: 103 cm', 'Alto: 77,5 cm'])).toEqual({
            widthCm: 103, depthCm: 103, heightCm: 77.5, unparsed: [],
        })
    })

    it('acepta decimales con punto', () => {
        expect(parseDimensions(['Largo: 114.3 cm', 'Ancho: 114.3 cm', 'Alto: 76.2 cm'])).toMatchObject({
            widthCm: 114.3, depthCm: 114.3, heightCm: 76.2,
        })
    })

    it('convierte metros a cm sin errores de coma flotante', () => {
        expect(parseDimensions(['Largo: 1.2 m']).widthCm).toBe(120)
    })

    it('ignora acentos, mayúsculas y espacios', () => {
        expect(parseDimensions(['  DIÁMETRO : 90 cm']).widthCm).toBe(90)
    })

    it('Largo + Ancho sin Alto: altura nula', () => {
        expect(parseDimensions(['Largo: 161.4 cm', 'Ancho: 41.9 cm']).heightCm).toBeNull()
    })

    it('Ancho solo: va al ancho, la profundidad queda nula', () => {
        const r = parseDimensions(['Ancho: 80 cm', 'Alto: 40 cm'])
        expect(r.widthCm).toBe(80)
        expect(r.depthCm).toBeNull()
    })

    it('no inventa nada con unidades desconocidas ni texto libre', () => {
        const r = parseDimensions(['Largo: 2000 mm', 'Ver ficha técnica', 'Alto: 78 cm'])
        expect(r.widthCm).toBeNull()
        expect(r.heightCm).toBe(78)
        expect(r.unparsed).toEqual(['Largo: 2000 mm', 'Ver ficha técnica'])
    })

    it('acepta "Profundo" como profundidad', () => {
        expect(parseDimensions(['Profundo: 58 cm']).depthCm).toBe(58)
    })

    it('acepta un punto en lugar de dos puntos ("Alto. 25 cm")', () => {
        expect(parseDimensions(['Alto. 25 cm']).heightCm).toBe(25)
    })

    it('convierte pies a cm', () => {
        expect(parseDimensions(["Ancho: 8'", "Largo: 11'"])).toMatchObject({
            widthCm: 335.3, depthCm: 243.8,
        })
    })

    it('en un rango guarda el valor mayor', () => {
        expect(parseDimensions(['Ancho: 241–244 cm']).widthCm).toBe(244)
        expect(parseDimensions(['Largo: 85-90 cm']).widthCm).toBe(90)
    })

    it('ignora un asterisco final', () => {
        expect(parseDimensions(['Ancho: 48 cm*']).widthCm).toBe(48)
    })

    it('con dos medidas separadas por "/" guarda la mayor', () => {
        expect(parseDimensions(['Largo: 199.5 cm / 239,5 cm', 'Ancho: 89.5 cm / 119,5 cm'])).toMatchObject({
            widthCm: 239.5, depthCm: 119.5,
        })
        expect(parseDimensions(['Largo: 200 / 240 cm']).widthCm).toBe(240)
    })

    it('ignora notas entre paréntesis y "aprox."', () => {
        expect(parseDimensions(['Alto: 108 cm (altura máxima, el pedestal es ajustable)']).heightCm).toBe(108)
        expect(parseDimensions(['Altura: 73 cm aprox.']).heightCm).toBe(73)
    })

    it('no cuenta el grosor como altura', () => {
        const r = parseDimensions(['Alto: 0.7 cm (grosor)'])
        expect(r.heightCm).toBeNull()
        expect(r.unparsed).toEqual(['Alto: 0.7 cm (grosor)'])
    })

    it('no confunde medidas parciales con las del producto', () => {
        const r = parseDimensions(['Altura del asiento: 45 cm', 'Profundidad del módulo: 115 cm'])
        expect(r.heightCm).toBeNull()
        expect(r.depthCm).toBeNull()
    })

    it('tolera null, undefined, vacío y líneas en blanco', () => {
        const vacio = { widthCm: null, depthCm: null, heightCm: null, unparsed: [] }
        expect(parseDimensions(null)).toEqual(vacio)
        expect(parseDimensions(undefined)).toEqual(vacio)
        expect(parseDimensions([])).toEqual(vacio)
        expect(parseDimensions(['', '   '])).toEqual(vacio)
    })
})

describe('toDimensionColumns', () => {
    it('devuelve los nombres de columna de la base de datos', () => {
        expect(toDimensionColumns(['Largo: 200 cm', 'Ancho: 100 cm', 'Alto: 78 cm'])).toEqual({
            width_cm: 200, depth_cm: 100, height_cm: 78,
        })
    })

    it('un campo vacío deja las tres columnas en null', () => {
        expect(toDimensionColumns([])).toEqual({ width_cm: null, depth_cm: null, height_cm: null })
    })
})
