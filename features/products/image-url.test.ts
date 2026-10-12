import { describe, it, expect } from 'vitest'
import { enlargeImageUrl, LARGE_IMAGE_WIDTH } from './image-url'

const BASE = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/catalogo/dorian/main'

describe('enlargeImageUrl', () => {
    it('añade un ancho máximo sin ampliar nunca la imagen (c_limit)', () => {
        expect(enlargeImageUrl(BASE)).toBe(
            `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_${LARGE_IMAGE_WIDTH}/catalogo/dorian/main`,
        )
    })

    it('acepta otro ancho', () => {
        expect(enlargeImageUrl(BASE, 800)).toContain('c_limit,w_800/')
    })

    it('conserva el identificador de la imagen, incluso con carpetas', () => {
        expect(enlargeImageUrl(BASE).endsWith('/catalogo/dorian/main')).toBe(true)
    })

    it('una URL que no es de Cloudinary se deja igual', () => {
        expect(enlargeImageUrl('https://example.com/foto.jpg')).toBe('https://example.com/foto.jpg')
        expect(enlargeImageUrl('/icons/placeholder-image.png')).toBe('/icons/placeholder-image.png')
    })

    it('una URL de Cloudinary con otras transformaciones se deja igual', () => {
        const otra = 'https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill/abc'
        expect(enlargeImageUrl(otra)).toBe(otra)
    })

    it('una cadena vacía sigue vacía', () => {
        expect(enlargeImageUrl('')).toBe('')
    })

    it('no modifica dos veces una URL ya ampliada', () => {
        const una = enlargeImageUrl(BASE)
        expect(enlargeImageUrl(una)).toBe(una)
    })
})
