import { describe, it, expect } from 'vitest'
import { parseDimensions } from './dimensions.parser'

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

    it('tolera null, undefined, vacío y líneas en blanco', () => {
        const vacio = { widthCm: null, depthCm: null, heightCm: null, unparsed: [] }
        expect(parseDimensions(null)).toEqual(vacio)
        expect(parseDimensions(undefined)).toEqual(vacio)
        expect(parseDimensions([])).toEqual(vacio)
        expect(parseDimensions(['', '   '])).toEqual(vacio)
    })
})
