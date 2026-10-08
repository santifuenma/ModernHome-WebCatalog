/**
 * dimensions.parser.ts
 * Convierte las líneas de texto de `products.dimensions` (p. ej. "Largo: 114.3 cm")
 * en medidas numéricas en centímetros, para poder filtrar por rangos en SQL.
 *
 * Significado fijo de cada medida, sin importar cómo la nombre la ficha:
 *   widthCm  lado frontal      ← "Largo", o "Ancho" si no hay "Largo"
 *   depthCm  otro lado         ← "Profundidad", o "Ancho" si hay "Largo"
 *   heightCm altura            ← "Alto"
 */

export interface ParsedDimensions {
    widthCm: number | null
    depthCm: number | null
    heightCm: number | null
    /** Líneas que no se pudieron interpretar (para revisarlas a mano). */
    unparsed: string[]
}

type Label = 'largo' | 'ancho' | 'profundidad' | 'alto' | 'diametro'

// Etiquetas aceptadas (ya sin acentos ni mayúsculas) → medida que representan
const LABEL_ALIASES: Record<string, Label> = {
    largo: 'largo',
    ancho: 'ancho',
    profundidad: 'profundidad',
    profundo: 'profundidad',
    fondo: 'profundidad',
    alto: 'alto',
    altura: 'alto',
    diametro: 'diametro',
}

// "Largo: 114.3 cm" | "Alto. 25 cm" | "Ancho: 241–244 cm" | "Ancho: 8'" | "Alto: 108 cm (nota)"
// | "Ancho: 48 cm*" | "Largo: 199.5 cm / 239,5 cm" (mesa extensible)
// Grupos: 1 etiqueta · 2 número · 3 segundo número del rango · 4 unidad
//         5 número tras "/" · 6 su unidad · 7 nota entre paréntesis
// (sin unidad = cm)
const LINE_REGEX =
    /^\s*([^:.\d]+?)\s*[:.]\s*(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*(cm|m|')?(?:\s*\/\s*(\d+(?:[.,]\d+)?)\s*(cm|m|')?)?\s*\*?\s*(?:aprox\.?)?\s*(?:\(([^)]*)\))?\s*$/i

const CM_PER_FOOT = 30.48

function normalizeLabel(raw: string): string {
    return raw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // quita acentos: "Diámetro" → "diametro"
        .trim()
}

function toCm(value: string, unit?: string): number {
    const n = Number(value.replace(',', '.'))
    const u = unit?.toLowerCase()
    const cm = u === 'm' ? n * 100 : u === "'" ? n * CM_PER_FOOT : n
    return Math.round(cm * 10) / 10 // evita 1.2 * 100 = 120.00000000000001
}

export function parseDimensions(lines: string[] | null | undefined): ParsedDimensions {
    const found: Partial<Record<Label, number>> = {}
    const unparsed: string[] = []

    for (const line of lines ?? []) {
        if (!line.trim()) continue

        const match = LINE_REGEX.exec(line)
        const label = match ? LABEL_ALIASES[normalizeLabel(match[1])] : undefined

        // "(grosor)" / "(espesor)": no es una medida del producto, es el espesor de una alfombra
        const isThickness = match ? /grosor|espesor/i.test(match[7] ?? '') : false

        if (!match || !label || isThickness) {
            unparsed.push(line)
            continue
        }

        // Rango "241–244" o alternativas "199.5 / 239.5": se guarda el valor mayor.
        // Si solo una de las partes lleva unidad, se aplica a todas.
        const unitA = match[4] ?? match[6]
        const unitB = match[6] ?? match[4]
        const values = [toCm(match[2], unitA)]
        if (match[3] !== undefined) values.push(toCm(match[3], unitA))
        if (match[5] !== undefined) values.push(toCm(match[5], unitB))
        found[label] = Math.max(...values)
    }

    const hasLargo = found.largo !== undefined

    return {
        widthCm: found.largo ?? found.ancho ?? found.diametro ?? null,
        depthCm: found.profundidad ?? (hasLargo ? found.ancho : undefined) ?? found.diametro ?? null,
        heightCm: found.alto ?? null,
        unparsed,
    }
}
