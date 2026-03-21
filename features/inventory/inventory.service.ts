import * as xlsx from 'xlsx'
import { createSupabaseServerClient } from '@/infrastructure/supabase/server'

export interface CompareResult {
    newCount: number
    oldCount: number
    newProductsBase64: string
    oldProductsBase64: string
}

export async function compareInventoryExcel(buffer: Buffer): Promise<CompareResult> {
    // 1. Read input Excel
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // ExcelRow interface matching the generic product import structure
    interface ExcelRow {
        'Código'?: string
        'Descripción'?: string
        'Marca'?: string
        'Stock'?: string | number
        'Store'?: string
        [key: string]: any
    }
    
    const rawRows = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' })

    const inputCodes = new Set<string>()
    const inputRowsMap = new Map<string, ExcelRow>()

    for (const row of rawRows) {
        const code = (row['Código'] || '').toString().trim()
        if (!code) continue
        inputCodes.add(code)
        inputRowsMap.set(code, row)
    }

    // 2. Fetch DB Products
    const supabase = await createSupabaseServerClient()
    const { data: dbProducts, error } = await supabase
        .from('products')
        .select('code, name, stock, store, brand, ambiente, subcategoria')
        .eq('is_active', true) // We compare against active inventory
    
    if (error) throw new Error(error.message)

    const dbCodes = new Set<string>()
    const dbRowsMap = new Map<string, any>()
    
    for (const p of dbProducts || []) {
        if (!p.code) continue
        dbCodes.add(p.code)
        dbRowsMap.set(p.code, p)
    }

    // 3. Find Differences
    // A. Nuevos (en Excel, no en DB)
    const newProductsObj: any[] = []
    for (const code of inputCodes) {
        if (!dbCodes.has(code)) {
            newProductsObj.push(inputRowsMap.get(code))
        }
    }

    // B. Antiguos/Para borrar (en DB, no en Excel)
    const oldProductsObj: any[] = []
    for (const code of dbCodes) {
        if (!inputCodes.has(code)) {
            // Re-map DB format to a recognizable Excel-like format for the user
            const p = dbRowsMap.get(code)
            oldProductsObj.push({
                'Código': p.code,
                'Descripción': p.name,
                'Marca': p.brand,
                'Stock': p.stock,
                'Store': p.store,
                'Ambiente': p.ambiente,
                'Subcategoria': p.subcategoria
            })
        }
    }

    // 4. Create output Excels
    const createBase64Excel = (data: any[], sheetTitle: string) => {
        // If data is empty, insert a dummy row so the file isn't entirely broken
        const safeData = data.length > 0 ? data : [{ 'Mensaje': 'No hay datos resultantes en esta categoría' }]
        const wb = xlsx.utils.book_new()
        const ws = xlsx.utils.json_to_sheet(safeData)
        xlsx.utils.book_append_sheet(wb, ws, sheetTitle)
        return xlsx.write(wb, { type: 'base64', bookType: 'xlsx' })
    }

    return {
        newCount: newProductsObj.length,
        oldCount: oldProductsObj.length,
        newProductsBase64: createBase64Excel(newProductsObj, 'Nuevos (Cargar a BD)'),
        oldProductsBase64: createBase64Excel(oldProductsObj, 'Antiguos (No están en excel)')
    }
}

// -------------------------------------------------------------
// IMPORTER LOGIC (Adapted from scripts/import_products.ts)
// -------------------------------------------------------------

function slugify(text: string): string {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function parseStock(stock: string | number): number {
    if (typeof stock === 'number') return Math.floor(stock)
    if (!stock) return 0
    const normalizedFormat = stock.replace(',', '.')
    const parsed = parseFloat(normalizedFormat)
    return isNaN(parsed) ? 0 : Math.floor(parsed)
}

export interface ImportResult {
    successCount: number
    updatedCount: number
    errorCount: number
    logs: string[]
}

const BATCH_SIZE = 100

export async function importProductsFromExcel(buffer: Buffer): Promise<ImportResult> {
    const logs: string[] = []
    function log(msg: string) { logs.push(msg) }

    log('Processing uploaded Excel file...')
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    interface ExcelRow {
        'Código'?: string
        'Descripción'?: string
        'Marca'?: string
        'Stock'?: string | number
        'Store'?: string
        [key: string]: any
    }

    const rawRows = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' })
    
    const supabase = await createSupabaseServerClient()
    
    // Fetch all existing codes and stocks
    log('Fetching existing inventory from database to compare stocks...')
    const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('code, stock')
        
    if (dbError) throw new Error(dbError.message)
        
    const dbStockMap = new Map<string, number>()
    for (const p of dbProducts || []) {
        if (p.code) dbStockMap.set(p.code, p.stock)
    }

    const toInsert: any[] = []
    const toUpdate: { code: string, stock: number }[] = []

    for (const row of rawRows) {
        const code = (row['Código'] || '').toString().trim()
        const name = (row['Descripción'] || '').toString().trim()
        const brand = (row['Marca'] || 'general').toString().trim()
        const store = (row['Store'] || '').toString().trim()
        const stockRaw = row['Stock']

        if (!code) continue

        const stock = parseStock(stockRaw as string | number)

        if (!dbStockMap.has(code)) {
            // New Product
            const baseSlug = name ? slugify(name) : 'producto'
            const codeSlug = slugify(code)
            const slug = `${baseSlug}-${codeSlug}`

            toInsert.push({
                code,
                name: name || code,
                slug,
                brand,
                designer: null,
                store: store || 'LM',
                stock,
                ambiente: 'general',
                subcategoria: 'general',
                is_active: true
            })
        } else {
            // Existing Product - check stock
            const currentStock = dbStockMap.get(code)
            if (currentStock !== stock) {
                toUpdate.push({ code, stock })
            }
        }
    }

    log(`Found ${toInsert.length} new products to insert.`)
    log(`Found ${toUpdate.length} existing products with stock changes.`)

    let successCount = 0
    let updatedCount = 0
    let errorCount = 0

    // 1. Insert New Products
    if (toInsert.length > 0) {
        for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
            const batch = toInsert.slice(i, i + BATCH_SIZE)
            log(`Inserting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} new items)...`)

            try {
                const { error } = await supabase
                    .from('products')
                    .insert(batch)

                if (error) {
                    log(`Batch error on insert: ${error.message}`)
                    errorCount += batch.length
                } else {
                    successCount += batch.length
                }
            } catch (err: any) {
                log(`Unexpected error in insert batch: ${err.message}`)
                errorCount += batch.length
            }
        }
    }

    // 2. Update Stock for Changed Products
    if (toUpdate.length > 0) {
        log(`Updating stock for ${toUpdate.length} elements...`)
        const CHUNK = 20
        for (let i = 0; i < toUpdate.length; i += CHUNK) {
            const chunk = toUpdate.slice(i, i + CHUNK)
            await Promise.all(chunk.map(async item => {
                const { error } = await supabase
                    .from('products')
                    .update({ stock: item.stock })
                    .eq('code', item.code)
                
                if (error) {
                    log(`Error updating stock for ${item.code}: ${error.message}`)
                    errorCount++
                } else {
                    updatedCount++
                }
            }))
        }
    }

    log(`Import sync complete. Inserted: ${successCount}, Updated: ${updatedCount}, Errors: ${errorCount}`)

    return { successCount, updatedCount, errorCount, logs }
}

export interface DeactivateResult {
    successCount: number
    errorCount: number
    logs: string[]
}

export async function deactivateProductsFromExcel(buffer: Buffer): Promise<DeactivateResult> {
    const logs: string[] = []
    function log(msg: string) { logs.push(msg) }

    log('Processing uploaded Excel file for deactivation...')
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    interface ExcelRow {
        'Código'?: string
        [key: string]: any
    }

    const rawRows = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' })
    
    // Extract unique codes
    const codesToDeactivate = new Set<string>()
    for (const row of rawRows) {
        const code = (row['Código'] || '').toString().trim()
        if (code) codesToDeactivate.add(code)
    }

    const codesArray = Array.from(codesToDeactivate)
    log(`Found ${codesArray.length} unique product codes to deactivate.`)

    if (codesArray.length === 0) {
        return { successCount: 0, errorCount: 0, logs }
    }

    let successCount = 0
    let errorCount = 0

    const supabase = await createSupabaseServerClient()

    // Update in chunks of 50
    for (let i = 0; i < codesArray.length; i += 50) {
        const chunk = codesArray.slice(i, i + 50)
        log(`Deactivating batch ${Math.floor(i / 50) + 1} (${chunk.length} codes)...`)

        try {
            const { data, error } = await supabase
                .from('products')
                .update({ is_active: false, stock: 0 })
                .in('code', chunk)
                .select('id')
            
            if (error) {
                log(`Batch error: ${error.message}`)
                errorCount += chunk.length
            } else {
                successCount += data?.length || 0
                if ((data?.length || 0) < chunk.length) {
                    log(`Warning: ${chunk.length - (data?.length || 0)} codes in this batch were not found in the DB.`)
                }
            }
        } catch (err: any) {
            log(`Unexpected error in batch: ${err.message}`)
            errorCount += chunk.length
        }
    }

    log(`Deactivation complete. Successfully deactivated: ${successCount}.`)

    return { successCount, errorCount, logs }
}
