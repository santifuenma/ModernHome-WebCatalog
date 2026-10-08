'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/infrastructure/supabase/server'
import { 
    createProduct, updateProduct, deleteProduct, 
    addProductImage, removeProductImage,
    addProductSwatch, removeProductSwatch,
    setProductDownload, removeProductDownload,
    setProductStores
} from '@/features/products/product.service'
import { dbGetAllActiveSubcategories } from '@/features/products/product.repository'
import { getAmbientes } from '@/features/ambientes/ambiente.service'
import { runAiSearch } from '@/features/ai-search/ai-search.search'
import { createRateLimiter } from '@/features/ai-search/rate-limit'

/**
 * requireAuth
 * Called at the top of every Server Action.
 * Validates the Supabase session server-side — throws immediately if unauthorized.
 * This is a second line of defence in case middleware is somehow bypassed.
 * Returns the authenticated user (most actions ignore it).
 */
async function requireAuth() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized: no active admin session.')
    return user
}


export async function saveProduct(formData: FormData) {
    await requireAuth()
    const id = formData.get('id') as string | null
    const isEditing = !!id

    // Leer las tiendas seleccionadas (múltiples valores del mismo campo 'stores')
    const selectedStoreCodes = formData.getAll('stores') as string[]
    // Leer el stock por tienda desde los campos stock_<CODIGO> del formulario
    const selectedStores = selectedStoreCodes.map(code => ({
        storeCode: code,
        stock: Number(formData.get(`stock_${code}`) ?? 0),
    }))

    const payload = {
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        brand: formData.get('brand') as string,
        designer: formData.get('designer') as string || undefined,
        ambiente: formData.get('ambiente') as string,
        subcategoria: formData.get('subcategoria') as string,
        url: formData.get('url') as string || undefined,
        materials: (formData.get('materials') as string || '').split('\n').map(s => s.trim()).filter(Boolean),
        dimensions: (formData.get('dimensions') as string || '').split('\n').map(s => s.trim()).filter(Boolean),
    }

    if (!payload.slug) {
        payload.slug = `${payload.name.toLowerCase().replace(/\s+/g, '-')}-${payload.code.toLowerCase()}`
    }

    if (isEditing && id) {
        await updateProduct(id, payload)
        await setProductStores(id, selectedStores)
    } else {
        const newId = await createProduct(payload)
        await setProductStores(newId, selectedStores)
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function removeProduct(id: string) {
    await requireAuth()
    await deleteProduct(id)
    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function toggleProductVisibility(id: string, currentIsActive: boolean) {
    await requireAuth()
    await updateProduct(id, { is_active: !currentIsActive })
    revalidatePath(`/admin/products/${id}`)
    revalidatePath('/admin/products')
    revalidatePath('/catalogo')
}

export async function attachImage(productId: string, cloudinaryPublicId: string) {
    await requireAuth()
    await addProductImage(productId, cloudinaryPublicId, false) // Defaulting to not main for simplicity, or handle it via UI setup
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function detachImage(imageId: string, productId: string) {
    await requireAuth()
    await removeProductImage(imageId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}
export async function attachSwatch(productId: string, name: string | null, cloudinaryPublicId: string) {
    await requireAuth()
    await addProductSwatch(productId, name, cloudinaryPublicId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function detachSwatch(swatchId: string, productId: string) {
    await requireAuth()
    await removeProductSwatch(swatchId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function attachDownload(productId: string, name: string, url: string) {
    await requireAuth()
    await setProductDownload(productId, name, url)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function detachDownload(productId: string) {
    await requireAuth()
    await removeProductDownload(productId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

import { compareInventoryExcel, importProductsFromExcel, removeProductsFromStore } from '@/features/inventory/inventory.service'

export async function compareInventoryAction(formData: FormData) {
    await requireAuth()
    const file = formData.get('file') as File
    const store = formData.get('store') as string
    if (!file) throw new Error('No file provided')
    if (!store) throw new Error('No store selected')

    const buffer = Buffer.from(await file.arrayBuffer())
    return compareInventoryExcel(buffer, store)
}

export async function importProductsAction(formData: FormData) {
    await requireAuth()
    const file = formData.get('file') as File
    const store = formData.get('store') as string
    if (!file) throw new Error('No file provided')
    if (!store) throw new Error('No store selected')

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await importProductsFromExcel(buffer, store)

    revalidatePath('/admin/products')
    revalidatePath('/catalogo')
    return result
}

import { exportCatalogToExcelBase64 } from '@/features/inventory/export.service'

export async function exportCatalogAction(includeHidden: boolean = false): Promise<string> {
    await requireAuth()
    const base64 = await exportCatalogToExcelBase64(includeHidden)
    return base64
}

export async function removeFromStoreAction(formData: FormData) {
    await requireAuth()
    const file = formData.get('file') as File
    const store = formData.get('store') as string
    if (!file) throw new Error('No file provided')
    if (!store) throw new Error('No store selected')

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await removeProductsFromStore(buffer, store)

    revalidatePath('/admin/products')
    revalidatePath('/catalogo')
    return result
}

// Legacy alias — must be a real function in 'use server' files (re-exports are not allowed)
export async function deactivateProductsAction(formData: FormData) {
    return removeFromStoreAction(formData)
}

// ─── AI SEARCH ─────────────────────────────────────────────────────────────────

// 10 búsquedas con IA por minuto y usuario: frena bucles y dobles clics, que gastan saldo de la API.
const aiSearchLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 })

/**
 * aiSearchProducts
 * Convierte una frase en lenguaje natural en la URL del listado de productos ya filtrado.
 * Solo con sesión de admin: cada llamada cuesta dinero (API de Anthropic).
 * Los errores esperados (IA caída, límite de peticiones...) se devuelven como { ok: false }.
 */
export async function aiSearchProducts(text: string) {
    const user = await requireAuth()

    const limit = aiSearchLimiter.check(user.id)
    if (!limit.allowed) {
        return {
            ok: false as const,
            code: 'rate_limit' as const,
            error: `Demasiadas búsquedas seguidas. Espera ${limit.retryAfterSec} s e inténtalo de nuevo.`,
        }
    }

    // Mismos valores que ofrece el panel en sus desplegables
    const subcategoriaMap = await dbGetAllActiveSubcategories()
    const catalog = {
        ambientes: getAmbientes().map(a => a.slug),
        subcategorias: [...new Set(Object.values(subcategoriaMap).flat().map(s => s.slug))],
    }

    // Una Server Action se puede invocar con cualquier dato: no damos por hecho que sea texto
    return runAiSearch(typeof text === 'string' ? text : '', catalog)
}
