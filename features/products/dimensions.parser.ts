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
    fondo: 'profundidad',
    alto: 'alto',
    altura: 'alto',
    diametro: 'diametro',
}

// "Largo: 114.3 cm" | "Alto: 77,5 cm" | "Ancho: 100" (sin unidad = cm)
const LINE_REGEX = /^\s*([^:]+?)\s*:\s*(\d+(?:[.,]\d+)?)\s*(cm|m)?\s*$/i

function normalizeLabel(raw: string): string {
    return raw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '') // quita acentos: "Diámetro" → "diametro"
        .trim()
}

function toCm(value: string, unit?: string): number {
    const n = Number(value.replace(',', '.'))
    const cm = unit?.toLowerCase() === 'm' ? n * 100 : n
    return Math.round(cm * 10) / 10 // evita 1.2 * 100 = 120.00000000000001
}

export function parseDimensions(lines: string[] | null | undefined): ParsedDimensions {
    const found: Partial<Record<Label, number>> = {}
    const unparsed: string[] = []

    for (const line of lines ?? []) {
        if (!line.trim()) continue

        const match = LINE_REGEX.exec(line)
        const label = match ? LABEL_ALIASES[normalizeLabel(match[1])] : undefined

        if (!match || !label) {
            unparsed.push(line)
            continue
        }
        found[label] = toCm(match[2], match[3])
    }

    const hasLargo = found.largo !== undefined

    return {
        widthCm: found.largo ?? found.ancho ?? found.diametro ?? null,
        depthCm: found.profundidad ?? (hasLargo ? found.ancho : undefined) ?? found.diametro ?? null,
        heightCm: found.alto ?? null,
        unparsed,
    }
}
