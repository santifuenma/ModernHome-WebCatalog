/**
 * update_store.ts
 * Script de uso unico que lee un Excel de productos, localiza cada producto
 * en la base de datos por su codigo (columna "Codigo" o "Codigo") y actualiza
 * su campo `store` al valor indicado por argumento.
 *
 * USO:   npx tsx scripts/update_store.ts <ruta_excel> <nuevo_store>
 * EJEMPLO: npx tsx scripts/update_store.ts "./data/INVENTARIO SM AL 03.03.26.xls" SM
 * STORES VALIDOS: LM | SM | DP | CT | BT
 */

import * as fs from 'fs'
import * as path from 'path'
import * as xlsx from 'xlsx'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('ERROR: Faltan variables de Supabase en .env.local')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const VALID_STORES = ['LM', 'SM', 'DP', 'CT', 'BT']
const BATCH_SIZE = 100

interface ExcelRow {
    [key: string]: any
}

async function main() {
    const args = process.argv.slice(2)

    if (args.length < 2) {
        console.log('USO: npx tsx scripts/update_store.ts <ruta_excel> <nuevo_store>')
        console.log('STORES VALIDOS: ' + VALID_STORES.join(' | '))
        process.exit(1)
    }

    const [filePath, newStore] = args
    const resolvedPath = path.resolve(process.cwd(), filePath)
    const storeUpper = newStore.toUpperCase()

    if (!VALID_STORES.includes(storeUpper)) {
        console.error('ERROR: Store invalido "' + storeUpper + '". Permitidos: ' + VALID_STORES.join(', '))
        process.exit(1)
    }

    if (!fs.existsSync(resolvedPath)) {
        console.error('ERROR: El fichero no existe: ' + resolvedPath)
        process.exit(1)
    }

    console.log('Fichero    : ' + path.basename(resolvedPath))
    console.log('Nuevo store: ' + storeUpper)
    console.log('')

    // Leer Excel
    const workbook = xlsx.readFile(resolvedPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rawRows = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' })

    // Extraer codigos unicos (acepta columna con o sin tilde)
    const codes: string[] = []
    for (const row of rawRows) {
        const raw = (row['Código'] ?? row['Codigo'] ?? row['codigo'] ?? row['CODIGO'] ?? '').toString().trim()
        if (raw && !codes.includes(raw)) {
            codes.push(raw)
        }
    }

    if (codes.length === 0) {
        console.error('ERROR: No se encontro ningun codigo en la columna "Codigo" del Excel.')
        console.log('Columnas disponibles: ' + (rawRows[0] ? Object.keys(rawRows[0]).join(', ') : 'ninguna'))
        process.exit(1)
    }

    console.log('Codigos unicos leidos del Excel: ' + codes.length)
    console.log('')

    let totalFound = 0
    let totalUpdated = 0
    let totalNotFound = 0
    const notFoundCodes: string[] = []

    for (let i = 0; i < codes.length; i += BATCH_SIZE) {
        const batch = codes.slice(i, i + BATCH_SIZE)
        const batchNum = Math.floor(i / BATCH_SIZE) + 1
        const totalBatches = Math.ceil(codes.length / BATCH_SIZE)

        console.log('[Lote ' + batchNum + '/' + totalBatches + '] Buscando ' + batch.length + ' codigos...')

        // Buscar productos en la BD por codigo
        const { data: found, error: findError } = await supabase
            .from('products')
            .select('id, code')
            .in('code', batch)

        if (findError) {
            console.error('  ERROR al buscar lote ' + batchNum + ': ' + findError.message)
            continue
        }

        const foundCodes = (found ?? []).map((p: any) => p.code as string)
        const missingInBatch = batch.filter((c: string) => !foundCodes.includes(c))

        totalFound += foundCodes.length
        totalNotFound += missingInBatch.length
        notFoundCodes.push(...missingInBatch)

        if (foundCodes.length === 0) {
            console.log('  AVISO: Ningun codigo del lote encontrado en la BD.')
            continue
        }

        // Actualizar el campo store
        const { error: updateError } = await supabase
            .from('products')
            .update({ store: storeUpper })
            .in('code', foundCodes)

        if (updateError) {
            console.error('  ERROR al actualizar lote ' + batchNum + ': ' + updateError.message)
        } else {
            totalUpdated += foundCodes.length
            console.log('  OK: ' + foundCodes.length + ' producto(s) actualizados a store=' + storeUpper)
        }
    }

    // Resumen final
    console.log('')
    console.log('==================================================')
    console.log('RESUMEN')
    console.log('==================================================')
    console.log('  Codigos leidos del Excel  : ' + codes.length)
    console.log('  Encontrados en la BD      : ' + totalFound)
    console.log('  Actualizados store=' + storeUpper + '    : ' + totalUpdated)
    console.log('  No encontrados en la BD   : ' + totalNotFound)

    if (notFoundCodes.length > 0) {
        console.log('')
        console.log('Codigos NO encontrados en la BD:')
        notFoundCodes.forEach((c: string) => console.log('  - ' + c))
    }

    console.log('')
    console.log('Script finalizado.')
}

main().catch(err => {
    console.error('Error fatal:', err)
    process.exit(1)
})
