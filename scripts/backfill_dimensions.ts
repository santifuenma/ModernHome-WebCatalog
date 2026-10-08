/**
 * backfill_dimensions.ts
 * Calcula width_cm / depth_cm / height_cm de cada producto a partir del texto
 * de `dimensions` (ver features/products/dimensions.parser.ts).
 *
 * La tabla `products` tiene RLS: la clave `anon` solo puede LEER. Por eso este
 * script no escribe en la base de datos: genera un archivo SQL que se ejecuta
 * en Supabase > SQL Editor (que no esta sujeto a RLS).
 *
 * USO:
 *   npx tsx scripts/backfill_dimensions.ts         → informe (no escribe nada)
 *   npx tsx scripts/backfill_dimensions.ts --sql   → informe + genera el archivo SQL
 *
 * Es idempotente: solo incluye los productos cuyos valores cambian.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { parseDimensions } from '../features/products/dimensions.parser'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('ERROR: Faltan variables de Supabase en .env.local')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PAGE_SIZE = 1000   // Supabase devuelve como maximo 1000 filas por consulta
const SQL_BATCH = 500    // filas por sentencia UPDATE
const OUT_FILE = path.resolve(process.cwd(), 'scripts/backfill_dimensions.generated.sql')

interface ProductRow {
    id: string
    code: string
    dimensions: string[] | null
    width_cm: number | null
    depth_cm: number | null
    height_cm: number | null
}

interface Change {
    id: string
    width_cm: number | null
    depth_cm: number | null
    height_cm: number | null
}

async function fetchAllProducts(): Promise<ProductRow[]> {
    const rows: ProductRow[] = []

    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
            .from('products')
            .select('id, code, dimensions, width_cm, depth_cm, height_cm')
            .order('id') // orden estable: sin el, las paginas podrian solaparse
            .range(from, from + PAGE_SIZE - 1)

        if (error) throw new Error('Error al leer productos: ' + error.message)

        rows.push(...(data as ProductRow[]))
        if (data.length < PAGE_SIZE) break
    }

    return rows
}

function sqlValue(n: number | null): string {
    return n === null ? 'NULL::numeric' : n + '::numeric'
}

/** Una sentencia UPDATE ... FROM (VALUES ...) por cada SQL_BATCH productos. */
function buildSql(changes: Change[]): string {
    const statements: string[] = []

    for (let i = 0; i < changes.length; i += SQL_BATCH) {
        const rows = changes
            .slice(i, i + SQL_BATCH)
            .map(c => `    ('${c.id}'::uuid, ${sqlValue(c.width_cm)}, ${sqlValue(c.depth_cm)}, ${sqlValue(c.height_cm)})`)
            .join(',\n')

        statements.push(
`UPDATE products AS p
SET width_cm = v.width_cm, depth_cm = v.depth_cm, height_cm = v.height_cm
FROM (VALUES
${rows}
) AS v(id, width_cm, depth_cm, height_cm)
WHERE p.id = v.id;`)
    }

    return '-- Generado por scripts/backfill_dimensions.ts: ' + changes.length + ' productos\n\n'
        + statements.join('\n\n') + '\n'
}

async function main() {
    const products = await fetchAllProducts()
    console.log('Productos leidos de la BD: ' + products.length)

    const changes: Change[] = []
    const withoutAny: string[] = []
    const withUnparsed: { code: string; lines: string[] }[] = []
    let complete = 0

    for (const p of products) {
        const d = parseDimensions(p.dimensions)

        const found = [d.widthCm, d.depthCm, d.heightCm].filter(v => v !== null).length
        if (found === 3) complete++
        if (found === 0) withoutAny.push(p.code)
        if (d.unparsed.length > 0) withUnparsed.push({ code: p.code, lines: d.unparsed })

        const differs =
            d.widthCm !== p.width_cm ||
            d.depthCm !== p.depth_cm ||
            d.heightCm !== p.height_cm

        if (differs) {
            changes.push({
                id: p.id,
                width_cm: d.widthCm,
                depth_cm: d.depthCm,
                height_cm: d.heightCm,
            })
        }
    }

    console.log('')
    console.log('==================================================')
    console.log('INFORME')
    console.log('==================================================')
    console.log('  Con las 3 medidas             : ' + complete)
    console.log('  Con alguna medida, incompleto : ' + (products.length - complete - withoutAny.length))
    console.log('  Sin ninguna medida            : ' + withoutAny.length)
    console.log('  Con lineas sin interpretar    : ' + withUnparsed.length)
    console.log('  Ya estaban al dia             : ' + (products.length - changes.length))
    console.log('  Por actualizar                : ' + changes.length)

    if (withUnparsed.length > 0) {
        console.log('')
        console.log('Lineas que el parser NO pudo interpretar (primeras 30):')
        for (const item of withUnparsed.slice(0, 30)) {
            console.log('  [' + item.code + '] ' + item.lines.join(' | '))
        }
    }

    if (!process.argv.includes('--sql')) {
        console.log('')
        console.log('Informe terminado. No se escribio nada. Usa --sql para generar el archivo.')
        return
    }

    if (changes.length === 0) {
        console.log('')
        console.log('No hay nada que actualizar: no se genera archivo.')
        return
    }

    fs.writeFileSync(OUT_FILE, buildSql(changes), 'utf-8')
    console.log('')
    console.log('Archivo generado: ' + OUT_FILE)
    console.log('Pegalo en Supabase > SQL Editor y ejecutalo.')
}

main().catch(err => {
    console.error('Error fatal:', err)
    process.exit(1)
})
