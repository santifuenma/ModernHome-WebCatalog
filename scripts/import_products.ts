import * as fs from 'fs'
import * as path from 'path'
import * as xlsx from 'xlsx'
import * as dotenv from 'dotenv'

// Lógica de Supabase independiente de Next.js
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
	console.error('❌ Error: Supabase variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing in .env.local')
	process.exit(1)
}

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	// Se usa el anon_key ya que no tenemos RLS configurado en la tabla de products
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * slugify
 * Converts a string into a URL-friendly slug.
 */
function slugify(text: string): string {
	return text
		.toString()
		.normalize('NFD')                   // split an accented letter in the base letter and the acent
		.replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
		.toLowerCase()
		.trim()
		.replace(/[\s\W-]+/g, '-')         // replace spaces and non-word characters with a single dash
		.replace(/^-+|-+$/g, '')           // remove leading and trailing dashes
}

/**
 * parseStock
 * Parses string representations of numbers, e.g., "1,00" -> 1
 */
function parseStock(stock: string | number): number {
	if (typeof stock === 'number') return Math.floor(stock)
	if (!stock) return 0
	
	// Si viene "1,00", lo reemplaza a "1.00"
	const normalizedFormat = stock.replace(',', '.')
	const parsed = parseFloat(normalizedFormat)
	
	return isNaN(parsed) ? 0 : Math.floor(parsed)
}

interface ExcelRow {
	'Código'?: string
	'Descripción'?: string
	'Marca'?: string
	'Stock'?: string | number
	'Store'?: string
	[key: string]: any
}

interface DbProduct {
	code: string
	name: string
	slug: string
	brand: string
	designer: null
	store: string
	stock: number
	ambiente: "general"
	subcategoria: "general"
}

// Configuración de inserción
const BATCH_SIZE = 100

async function processFile(filePath: string) {
	console.log(`\n📄 Processing file: ${path.basename(filePath)}`)
	const workbook = xlsx.readFile(filePath)
	const sheetName = workbook.SheetNames[0]
	const worksheet = workbook.Sheets[sheetName]

	// Read data as JSON
	const rawRows = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' })
	const productsToInsert: DbProduct[] = []

	for (const row of rawRows) {
		const code = (row['Código'] || '').toString().trim()
		const name = (row['Descripción'] || '').toString().trim()
		const brand = (row['Marca'] || 'general').toString().trim()
		const store = (row['Store'] || '').toString().trim()
		const stockRaw = row['Stock']

		if (!code) continue // Ignore rows without a code

		// El slug DEBE ser único en la DB (unique constraint `products_slug_key`).
		// Combinamos la descripción (SEO friendly) con el código (único) para garantizar unicidad.
		const baseSlug = name ? slugify(name) : 'producto'
		const codeSlug = slugify(code)
		const slug = `${baseSlug}-${codeSlug}`

		const stock = parseStock(stockRaw as string | number)

		const dbProduct: DbProduct = {
			code,
			name: name || code, // Fallback a usar el código como nombre si no hay descripción
			slug,
			brand: brand,
			designer: null,
			store: store || 'LM', // Un store por defecto si no viene
			stock,
			ambiente: 'general',
			subcategoria: 'general'
		}
		
		productsToInsert.push(dbProduct)
	}

	console.log(`📊 Found ${productsToInsert.length} products to insert/update.`)
	
	// Inserciones en lote
	let successCount = 0
	let errorCount = 0

	for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
		const batch = productsToInsert.slice(i, i + BATCH_SIZE)
		const codesInBatch = batch.map(p => p.code)
		
		console.log(`⏳ Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} items)...`)

		try {
			// Consultar productos existentes por código bulk (para hacer UPSERT manual via onConflict o filtrado)
			// La manera más fácil en Supabase para evitar duplicados si code es UNIQUE es mediante upsert
			const { data, error } = await supabase
			    .from('products')
			    .upsert(batch, { onConflict: 'code', ignoreDuplicates: true }) // Ignora si ya existe, si la tabla soporta upsert es la mejor opción

			if (error) {
				console.error(`❌ Batch error:`, error.message)
				errorCount += batch.length
			} else {
				successCount += batch.length
			}
		} catch (err: any) {
			console.error(`❌ Unexpected error in batch:`, err.message)
			errorCount += batch.length
		}
	}
	
	console.log(`✅ File processing complete. Successfully processed: ${successCount}, Errors: ${errorCount}`)
}

async function main() {
	const args = process.argv.slice(2)
	const targetPath = args[0]

	if (!targetPath) {
		console.log('Usage: npx tsx scripts/import_products.ts <path_to_excel_or_csv_file_or_folder>')
		console.log('Example 1: npx tsx scripts/import_products.ts ./data/inventory.xlsx')
		console.log('Example 2: npx tsx scripts/import_products.ts ./data/invoices/')
		process.exit(1)
	}

	const resolvedPath = path.resolve(process.cwd(), targetPath)

	if (!fs.existsSync(resolvedPath)) {
		console.error(`❌ Error: Path does not exist: ${resolvedPath}`)
		process.exit(1)
	}

	const stat = fs.statSync(resolvedPath)

	if (stat.isFile()) {
		await processFile(resolvedPath)
	} else if (stat.isDirectory()) {
		const files = fs.readdirSync(resolvedPath)
		const validFiles = files.filter(f => f.endsWith('.xlsx') || f.endsWith('.csv') || f.endsWith('.xls'))
		
		if (validFiles.length === 0) {
			console.log(`No Excel or CSV files found in directory: ${resolvedPath}`)
			process.exit(0)
		}
		
		for (const file of validFiles) {
			await processFile(path.join(resolvedPath, file))
		}
	}
}

main().catch(err => {
	console.error('Fatal error:', err)
	process.exit(1)
})
