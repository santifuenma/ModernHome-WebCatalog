/**
 * sync_hobang_dimensions.ts
 * Script que lee un archivo JSON de productos y actualiza los campos
 * `dimensions` y `materials` en la base de datos.
 *
 * USO:       npx tsx scripts/sync_hobang_dimensions.ts <ruta_json>
 * DRY-RUN:   npx tsx scripts/sync_hobang_dimensions.ts <ruta_json> --dry-run
 *
 * Si no se pasa ruta, usa por defecto hobang_sm_productos.json
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Error: Faltan variables de Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) en .env.local')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Estructura esperada de cada objeto en el JSON
interface HobangProduct {
    code: string
    dimensions: string
    materials: string
}

async function main() {
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run')

    if (dryRun) {
        console.log('🏜️  Modo DRY-RUN activado — no se escribirá nada en la base de datos.\n')
    }

    // Determinar ruta del JSON (primer argumento que no sea --dry-run, o default)
    const jsonArg = args.find(a => a !== '--dry-run')
    const jsonPath = jsonArg
        ? path.resolve(process.cwd(), jsonArg)
        : path.resolve(__dirname, 'hobang_sm_productos.json')

    if (!fs.existsSync(jsonPath)) {
        console.error('❌ Error: No se encontró el archivo: ' + jsonPath)
        process.exit(1)
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8')
    let productos: HobangProduct[]

    try {
        productos = JSON.parse(rawData)
    } catch {
        console.error('❌ Error: El archivo JSON no tiene un formato válido.')
        process.exit(1)
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        console.error('❌ Error: El JSON está vacío o no es un array.')
        process.exit(1)
    }

    console.log('📄 Archivo    : ' + path.basename(jsonPath))
    console.log('📦 Productos  : ' + productos.length)
    console.log('')

    // Contadores para el resumen final
    let totalProcesados = 0
    let totalActualizados = 0
    let totalNoEncontrados = 0
    let totalErrores = 0
    const codigosNoEncontrados: string[] = []

    for (const producto of productos) {
        totalProcesados++

        const { code, dimensions: rawDimensions, materials: rawMaterials } = producto

        // Las columnas en Supabase son text[] — convertir las cadenas con \n en arrays
        const dimensions = rawDimensions.split('\n').map(s => s.trim()).filter(Boolean)
        const materials = rawMaterials.split('\n').map(s => s.trim()).filter(Boolean)

        if (!code) {
            console.warn('⚠️  Registro sin código, se omite.')
            totalErrores++
            continue
        }

        // Buscar el producto en la BD por código exacto
        const { data: found, error: findError } = await supabase
            .from('products')
            .select('id, code')
            .eq('code', code)
            .maybeSingle()

        if (findError) {
            console.error('❌ Error al buscar código "' + code + '": ' + findError.message)
            totalErrores++
            continue
        }

        if (!found) {
            console.warn('⚠️  Código "' + code + '" no encontrado en la BD — se omite.')
            totalNoEncontrados++
            codigosNoEncontrados.push(code)
            continue
        }

        // Mostrar qué se actualizaría
        console.log('🔄 [' + code + '] → dimensions + materials')

        if (dryRun) {
            console.log('   dimensions: ' + dimensions.join(' | '))
            console.log('   materials : ' + materials.join(' | '))
            totalActualizados++
            continue
        }

        // Actualizar dimensiones y materiales
        const { error: updateError } = await supabase
            .from('products')
            .update({ dimensions, materials })
            .eq('id', found.id)

        if (updateError) {
            console.error('❌ Error al actualizar código "' + code + '": ' + updateError.message)
            totalErrores++
        } else {
            totalActualizados++
        }
    }

    // Resumen final
    console.log('')
    console.log('==================================================')
    console.log('RESUMEN' + (dryRun ? ' (DRY-RUN)' : ''))
    console.log('==================================================')
    console.log('  Total procesados       : ' + totalProcesados)
    console.log('  Actualizados           : ' + totalActualizados)
    console.log('  No encontrados en BD   : ' + totalNoEncontrados)
    console.log('  Errores                : ' + totalErrores)

    if (codigosNoEncontrados.length > 0) {
        console.log('')
        console.log('Códigos NO encontrados en la BD:')
        codigosNoEncontrados.forEach(c => console.log('  - ' + c))
    }

    console.log('')
    console.log(dryRun ? '✅ Dry-run completado. No se realizaron cambios.' : '✅ Sincronización completada.')
}

main().catch(err => {
    console.error('Error fatal:', err)
    process.exit(1)
})
