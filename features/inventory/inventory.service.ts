import * as xlsx from 'xlsx'
import { createSupabaseServerClient } from '@/infrastructure/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExcelRow {
    'Código'?: string
    'Descripción'?: string
    'Marca'?: string
    'Stock'?: string | number
    [key: string]: any
}

export interface CompareResult {
    newCount: number
    oldCount: number
    newProductsBase64: string
    oldProductsBase64: string
}

export interface ImportResult {
    successCount: number
    updatedCount: number
    errorCount: number
    logs: string[]
}

export interface RemoveFromStoreResult {
    successCount: number
    deactivatedCount: number
    errorCount: number
    logs: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    const parsed = parseFloat(stock.replace(',', '.'))
    return isNaN(parsed) ? 0 : Math.floor(parsed)
}

function readCodes(buffer: Buffer): { codes: Set<string>, rows: ExcelRow[] } {
    const wb = xlsx.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json<ExcelRow>(ws, { defval: '' })
    const codes = new Set<string>()
    for (const r of rows) {
        const c = (r['Código'] || '').toString().trim()
        if (c) codes.add(c)
    }
    return { codes, rows }
}

function makeBase64Excel(data: any[], sheetTitle: string): string {
    const safeData = data.length > 0 ? data : [{ 'Mensaje': 'Sin resultados' }]
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(safeData), sheetTitle)
    return xlsx.write(wb, { type: 'base64', bookType: 'xlsx' })
}

const BATCH_SIZE = 100

// ─── 1. compareInventoryExcel ─────────────────────────────────────────────────
/**
 * Compares an Excel file against products assigned to a specific store.
 * "New"  = in Excel but not assigned to the store in DB
 * "Old"  = assigned to the store in DB but absent from the Excel
 */
export async function compareInventoryExcel(buffer: Buffer, storeCode: string): Promise<CompareResult> {
    const { codes: inputCodes, rows: rawRows } = readCodes(buffer)
    const inputRowsMap = new Map<string, ExcelRow>()
    for (const r of rawRows) {
        const c = (r['Código'] || '').toString().trim()
        if (c) inputRowsMap.set(c, r)
    }

    // Fetch products assigned to this store (via product_stores join)
    const supabase = await createSupabaseServerClient()
    const { data: dbProducts, error } = await supabase
        .from('products')
        .select('id, code, name, brand, ambiente, subcategoria, product_stores!inner(store_code, stock)')
        .eq('product_stores.store_code', storeCode)
        .eq('is_active', true)

    if (error) throw new Error(error.message)

    const dbCodes = new Set<string>()
    const dbRowsMap = new Map<string, any>()
    for (const p of dbProducts || []) {
        if (!p.code) continue
        dbCodes.add(p.code)
        dbRowsMap.set(p.code, p)
    }

    // A. New: in Excel but NOT yet assigned to this store
    const newProductsObj: any[] = []
    for (const code of inputCodes) {
        if (!dbCodes.has(code)) {
            newProductsObj.push(inputRowsMap.get(code))
        }
    }

    // B. Old: assigned to this store but NOT in Excel
    const oldProductsObj: any[] = []
    for (const code of dbCodes) {
        if (!inputCodes.has(code)) {
            const p = dbRowsMap.get(code)
            const storeRow = Array.isArray(p.product_stores) ? p.product_stores[0] : null
            oldProductsObj.push({
                'Código': p.code,
                'Descripción': p.name,
                'Marca': p.brand,
                'Stock': storeRow?.stock ?? 0,
                'Tienda': storeCode,
                'Ambiente': p.ambiente,
                'Subcategoria': p.subcategoria,
            })
        }
    }

    return {
        newCount: newProductsObj.length,
        oldCount: oldProductsObj.length,
        newProductsBase64: makeBase64Excel(newProductsObj, 'Nuevos (Cargar a BD)'),
        oldProductsBase64: makeBase64Excel(oldProductsObj, 'Antiguos (No están en excel)'),
    }
}

// ─── 2. importProductsFromExcel ───────────────────────────────────────────────
/**
 * Imports/syncs products from an Excel file for a specific store:
 * - New codes → create product + add to product_stores with stock
 * - Existing in DB but not in this store → add store assignment with stock
 * - Already in this store → update stock if changed
 */
export async function importProductsFromExcel(buffer: Buffer, storeCode: string): Promise<ImportResult> {
    const logs: string[] = []
    function log(msg: string) { logs.push(msg) }

    log('Processing uploaded Excel file...')
    const wb = xlsx.read(buffer, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rawRows = xlsx.utils.sheet_to_json<ExcelRow>(ws, { defval: '' })

    const supabase = await createSupabaseServerClient()

    // Fetch all existing products (code → id)
    log('Fetching existing products from database...')
    const { data: dbProducts, error: dbError } = await supabase
        .from('products')
        .select('id, code')
    if (dbError) throw new Error(dbError.message)

    const dbCodeToId = new Map<string, string>()
    for (const p of dbProducts || []) {
        if (p.code) dbCodeToId.set(p.code, p.id)
    }

    // Fetch existing product_stores for this storeCode
    const { data: existingAssignments } = await supabase
        .from('product_stores')
        .select('product_id, stock')
        .eq('store_code', storeCode)

    const storeProductIdSet = new Set<string>((existingAssignments || []).map((s: any) => s.product_id))
    const storeStockMap = new Map<string, number>((existingAssignments || []).map((s: any) => [s.product_id, s.stock ?? 0]))

    // Classify each Excel row
    const toInsertProducts: any[] = []      // brand-new products
    const toInsertStoreAssignments: { productId: string, stock: number }[] = []  // existing product, new store
    const toUpdateStock: { productId: string, stock: number }[] = []             // existing product, existing store, stock changed
    const toReactivate: string[] = []       // existing product IDs that should be reactivated

    for (const row of rawRows) {
        const code = (row['Código'] || '').toString().trim()
        const name = (row['Descripción'] || '').toString().trim()
        const brand = (row['Marca'] || 'general').toString().trim()
        const stock = parseStock(row['Stock'] as string | number)
        if (!code) continue

        if (!dbCodeToId.has(code)) {
            // Brand-new product
            const slug = `${slugify(name || code)}-${slugify(code)}`
            toInsertProducts.push({ code, name: name || code, slug, brand, designer: null, ambiente: 'general', subcategoria: 'general', is_active: true, _stock: stock })
        } else {
            const productId = dbCodeToId.get(code)!
            // Every existing product found in the Excel should be reactivated
            toReactivate.push(productId)

            if (!storeProductIdSet.has(productId)) {
                // Existing product, not yet in this store → add store assignment
                toInsertStoreAssignments.push({ productId, stock })
            } else {
                // Already in store → always update stock (also handles stock=0 on reactivation)
                if (storeStockMap.get(productId) !== stock) {
                    toUpdateStock.push({ productId, stock })
                }
            }
        }
    }

    log(`New products: ${toInsertProducts.length}`)
    log(`Products to add to store ${storeCode}: ${toInsertStoreAssignments.length}`)
    log(`Products with stock update: ${toUpdateStock.length}`)

    let successCount = 0
    let updatedCount = 0
    let errorCount = 0

    // 1. Insert new products + add them to product_stores
    for (let i = 0; i < toInsertProducts.length; i += BATCH_SIZE) {
        const batch = toInsertProducts.slice(i, i + BATCH_SIZE)
        const stockByCode: Record<string, number> = {}
        const dbBatch = batch.map(({ _stock, ...rest }: any) => {
            stockByCode[rest.code] = _stock
            return rest
        })

        log(`Inserting batch ${Math.floor(i / BATCH_SIZE) + 1} (${dbBatch.length} items)...`)
        try {
            const { data: inserted, error } = await supabase
                .from('products')
                .insert(dbBatch)
                .select('id, code')

            if (error) {
                log(`Insert error: ${error.message}`)
                errorCount += dbBatch.length
            } else {
                successCount += dbBatch.length
                const storeRows = (inserted || []).map((p: any) => ({
                    product_id: p.id,
                    store_code: storeCode,
                    stock: stockByCode[p.code] ?? 0,
                }))
                if (storeRows.length > 0) {
                    const { error: se } = await supabase.from('product_stores').insert(storeRows)
                    if (se) log(`Warning: product_stores insert error: ${se.message}`)
                }
            }
        } catch (err: any) {
            log(`Unexpected error: ${err.message}`)
            errorCount += batch.length
        }
    }

    // 2. Add store assignments for existing products not yet in this store
    if (toInsertStoreAssignments.length > 0) {
        const rows = toInsertStoreAssignments.map(a => ({ product_id: a.productId, store_code: storeCode, stock: a.stock }))
        const { error } = await supabase.from('product_stores').insert(rows)
        if (error) {
            log(`Error adding store assignments: ${error.message}`)
            errorCount += rows.length
        } else {
            successCount += rows.length
            log(`Added ${rows.length} store assignments for ${storeCode}.`)
        }
    }

    // 3. Update stock for products already in this store
    const CHUNK = 20
    for (let i = 0; i < toUpdateStock.length; i += CHUNK) {
        const chunk = toUpdateStock.slice(i, i + CHUNK)
        await Promise.all(chunk.map(async item => {
            const { error } = await supabase
                .from('product_stores')
                .update({ stock: item.stock })
                .eq('product_id', item.productId)
                .eq('store_code', storeCode)
            if (error) {
                log(`Stock update error for product ${item.productId}: ${error.message}`)
                errorCount++
            } else {
                updatedCount++
            }
        }))
    }

    // 4. Reactivate existing products found in the Excel (is_active = true)
    if (toReactivate.length > 0) {
        log(`Reactivating ${toReactivate.length} products found in this Excel...`)
        const CHUNK = 50
        let reactivated = 0
        for (let i = 0; i < toReactivate.length; i += CHUNK) {
            const chunk = toReactivate.slice(i, i + CHUNK)
            const { error } = await supabase
                .from('products')
                .update({ is_active: true })
                .in('id', chunk)
            if (error) {
                log(`Reactivation error: ${error.message}`)
            } else {
                reactivated += chunk.length
            }
        }
        log(`Reactivated: ${reactivated} products.`)
    }

    log(`Done. Created: ${successCount}, Stock updated: ${updatedCount}, Errors: ${errorCount}`)
    return { successCount, updatedCount, errorCount, logs }
}

// ─── 3. removeProductsFromStore ───────────────────────────────────────────────
/**
 * Removes product-store assignments for codes in the Excel file.
 * If a product has no store assignments left after removal, it is globally deactivated.
 */
export async function removeProductsFromStore(buffer: Buffer, storeCode: string): Promise<RemoveFromStoreResult> {
    const logs: string[] = []
    function log(msg: string) { logs.push(msg) }

    log(`Processing removal from store: ${storeCode}`)
    const { codes } = readCodes(buffer)
    const codesArray = Array.from(codes)
    log(`Found ${codesArray.length} unique product codes.`)

    if (codesArray.length === 0) {
        return { successCount: 0, deactivatedCount: 0, errorCount: 0, logs }
    }

    const supabase = await createSupabaseServerClient()

    // Fetch product IDs for the given codes
    const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('id, code')
        .in('code', codesArray)

    if (fetchError) throw new Error(fetchError.message)

    const productIds = (products || []).map((p: any) => p.id)
    const codeById = new Map((products || []).map((p: any) => [p.id, p.code]))
    log(`Matched ${productIds.length} products in DB.`)

    let successCount = 0
    let deactivatedCount = 0
    let errorCount = 0

    // Delete product_stores rows for this store in chunks
    for (let i = 0; i < productIds.length; i += 50) {
        const chunk = productIds.slice(i, i + 50)
        const { error } = await supabase
            .from('product_stores')
            .delete()
            .eq('store_code', storeCode)
            .in('product_id', chunk)

        if (error) {
            log(`Delete error (batch ${Math.floor(i / 50) + 1}): ${error.message}`)
            errorCount += chunk.length
        } else {
            successCount += chunk.length
        }
    }

    log(`Removed from store. Now checking for products with no remaining stores...`)

    // Find products that now have zero store assignments → deactivate globally
    const { data: remainingAssignments } = await supabase
        .from('product_stores')
        .select('product_id')
        .in('product_id', productIds)

    const stillAssigned = new Set((remainingAssignments || []).map((r: any) => r.product_id))
    const toDeactivate = productIds.filter(id => !stillAssigned.has(id))

    if (toDeactivate.length > 0) {
        log(`Deactivating ${toDeactivate.length} products with no remaining store assignments...`)
        const { error } = await supabase
            .from('products')
            .update({ is_active: false })
            .in('id', toDeactivate)

        if (error) {
            log(`Deactivation error: ${error.message}`)
        } else {
            deactivatedCount = toDeactivate.length
            log(`Deactivated: ${toDeactivate.map(id => codeById.get(id)).join(', ')}`)
        }
    }

    log(`Done. Removed from store: ${successCount}, Globally deactivated: ${deactivatedCount}, Errors: ${errorCount}`)
    return { successCount, deactivatedCount, errorCount, logs }
}

// Legacy alias — kept so any remaining references don't break
export const deactivateProductsFromExcel = (buffer: Buffer) =>
    removeProductsFromStore(buffer, 'LM')
