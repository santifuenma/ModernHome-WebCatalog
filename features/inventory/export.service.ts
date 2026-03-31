import ExcelJS from 'exceljs'
import { createSupabaseServerClient } from '@/infrastructure/supabase/server'

export async function exportCatalogToExcelBase64(includeHidden: boolean = false): Promise<string> {
    const supabase = await createSupabaseServerClient()

    // Base query
    let query = supabase
        .from('products')
        .select(`
            code,
            name,
            brand,
            stock,
            is_active,
            product_images(id),
            product_stores(store_code)
        `)
        .order('created_at', { ascending: false })

    // Optionally filter out inactive products
    if (!includeHidden) {
        query = query.eq('is_active', true)
    }

    const { data: products, error } = await query

    if (error) {
        throw new Error(`Error fetching products for export: ${error.message}`)
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Catálogo Actual')

    // Define columns
    worksheet.columns = [
        { header: 'Código', key: 'code', width: 25 },
        { header: 'Descripción', key: 'name', width: 50 },
        { header: 'Marca', key: 'brand', width: 15 },
        { header: 'Stock', key: 'stock', width: 12 },
        { header: 'Stores', key: 'stores', width: 20 },
        { header: 'Estado', key: 'estado', width: 20 },
        { header: 'Agregado (¿Tiene Imágenes?)', key: 'agregado', width: 30 }
    ]

    // Style the header
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    if (products) {
        for (const p of products) {
            // Check if product_images exists and has at least 1 image
            const hasImages = Array.isArray(p.product_images) && p.product_images.length > 0
            const storesStr = Array.isArray((p as any).product_stores)
                ? (p as any).product_stores.map((s: { store_code: string }) => s.store_code).join(', ')
                : ''
            
            const row = worksheet.addRow({
                code: p.code,
                name: p.name,
                brand: p.brand || '',
                stock: p.stock ?? 0,
                stores: storesStr,
                estado: p.is_active ? 'Activo' : 'Oculto/Descatalogado',
                agregado: hasImages ? 'SÍ' : 'NO'
            })

            // Style the 'estado' cell (Column 6)
            const estadoCell = row.getCell(6)
            estadoCell.alignment = { horizontal: 'center', vertical: 'middle' }
            if (p.is_active) {
                estadoCell.font = { color: { argb: 'FF166534' } } // dark green
            } else {
                estadoCell.font = { color: { argb: 'FF991B1B' } } // dark red
            }

            // Style the 'agregado' cell based on visual status (Now column 7)
            const agregadoCell = row.getCell(7)
            agregadoCell.alignment = { horizontal: 'center', vertical: 'middle' }
            
            if (hasImages) {
                // Light Green background, Dark Green text
                agregadoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFC6EFCE' }
                }
                agregadoCell.font = { color: { argb: 'FF006100' }, bold: true }
            } else {
                // Light Red background, Dark Red text
                agregadoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' }
                }
                agregadoCell.font = { color: { argb: 'FF9C0006' }, bold: true }
            }
        }
    }

    // Generate output buffer
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Return base64 string
    return Buffer.from(buffer).toString('base64')
}
