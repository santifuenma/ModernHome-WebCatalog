/**
 * image-url.ts
 * Versión ampliada de una imagen de producto para el visor del panel.
 *
 * Las miniaturas se piden a Cloudinary con `f_auto,q_auto` y sin cambiar el tamaño. Para el
 * visor se añade un límite de ancho (`c_limit` nunca amplía una imagen pequeña) para no
 * descargar un original de varios megapíxeles cuando se ve en pantalla.
 */

const BASE_TRANSFORMS = '/image/upload/f_auto,q_auto/'

export const LARGE_IMAGE_WIDTH = 1400

/** Devuelve la URL con un ancho máximo. Si no es una URL de Cloudinary con esas transformaciones, la deja igual. */
export function enlargeImageUrl(url: string, width: number = LARGE_IMAGE_WIDTH): string {
    if (!url.includes(BASE_TRANSFORMS)) return url
    return url.replace(BASE_TRANSFORMS, `/image/upload/f_auto,q_auto,c_limit,w_${width}/`)
}
