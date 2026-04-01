import ExcelJS from 'exceljs'
import { createSupabaseServerClient } from '@/infrastructure/supabase/server'

export async function exportCatalogToExcelBase64(includeHidden = false): Promise<string> {
    const supabase = await createSupabaseServerClient()

    // Fetch products + per-store stock via product_stores
    let query = supabase
        .from('products')
        .select(`
            code,
            name,
            brand,
            is_active,
            product_images(id),
            product_stores(store_code, stock)
        `)
        .order('created_at', { ascending: false })

    if (!includeHidden) {
        query = query.eq('is_active', true)
    }

    const { data: products, error } = await query
    if (error) throw new Error(`exportCatalog: ${error.message}`)

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Catálogo Modern Home')

    // One row per store assignment (Option B)
    worksheet.columns = [
        { header: 'Código',     key: 'code',     width: 25 },
        { header: 'Descripción', key: 'name',     width: 50 },
        { header: 'Marca',      key: 'brand',    width: 15 },
        { header: 'Tienda',     key: 'store',    width: 10 },
        { header: 'Stock',      key: 'stock',    width: 10 },
        { header: 'Estado',     key: 'estado',   width: 20 },
        { header: 'Agregado (¿Tiene Imágenes?)', key: 'agregado', width: 30 },
    ]

    // Header styling
    worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a1a' } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
    worksheet.getRow(1).height = 28

    for (const p of products || []) {
        const hasImages = Array.isArray(p.product_images) && p.product_images.length > 0
        const storeAssignments = Array.isArray((p as any).product_stores) ? (p as any).product_stores : []

        if (storeAssignments.length === 0) {
            // Product with no store: emit one row with empty store
            const row = worksheet.addRow({
                code:     p.code,
                name:     p.name,
                brand:    p.brand || '',
                store:    '',
                stock:    0,
                estado:   p.is_active ? 'Activo' : 'Oculto/Descatalogado',
                agregado: hasImages ? 'SÍ' : 'NO',
            })
            if (!hasImages) row.getCell('agregado').font = { color: { argb: 'FFDC2626' } }
            if (!p.is_active) row.font = { color: { argb: 'FF999999' }, italic: true }
        } else {
            // One row per store assignment
            for (const ps of storeAssignments) {
                const row = worksheet.addRow({
                    code:     p.code,
                    name:     p.name,
                    brand:    p.brand || '',
                    store:    ps.store_code,
                    stock:    ps.stock ?? 0,
                    estado:   p.is_active ? 'Activo' : 'Oculto/Descatalogado',
                    agregado: hasImages ? 'SÍ' : 'NO',
                })
                if (!hasImages) row.getCell('agregado').font = { color: { argb: 'FFDC2626' } }
                if (!p.is_active) row.font = { color: { argb: 'FF999999' }, italic: true }
            }
        }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer).toString('base64')
}
