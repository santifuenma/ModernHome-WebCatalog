'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
    createProduct, updateProduct, deleteProduct, 
    addProductImage, removeProductImage,
    addProductSwatch, removeProductSwatch,
    setProductDownload, removeProductDownload 
} from '@/features/products/product.service'
import { StoreCode } from '@/features/products/product.types'

export async function saveProduct(formData: FormData) {
    const id = formData.get('id') as string | null
    const isEditing = !!id

    const payload = {
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        slug: formData.get('slug') as string, // We might auto-generate it if missing
        brand: formData.get('brand') as string,
        designer: formData.get('designer') as string || undefined,
        store: formData.get('store') as StoreCode,
        stock: parseInt(formData.get('stock') as string || '0', 10),
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
    } else {
        await createProduct(payload)
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function removeProduct(id: string) {
    await deleteProduct(id)
    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function attachImage(productId: string, cloudinaryPublicId: string) {
    await addProductImage(productId, cloudinaryPublicId, false) // Defaulting to not main for simplicity, or handle it via UI setup
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function detachImage(imageId: string, productId: string) {
    await removeProductImage(imageId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}
export async function attachSwatch(productId: string, name: string | null, cloudinaryPublicId: string) {
    await addProductSwatch(productId, name, cloudinaryPublicId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function detachSwatch(swatchId: string, productId: string) {
    await removeProductSwatch(swatchId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function attachDownload(productId: string, name: string, url: string) {
    await setProductDownload(productId, name, url)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

export async function detachDownload(productId: string) {
    await removeProductDownload(productId)
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/catalogo`)
}

import { compareInventoryExcel, importProductsFromExcel } from '@/features/inventory/inventory.service'

export async function compareInventoryAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await compareInventoryExcel(buffer)

    return result
}

export async function importProductsAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    // Read the File into a Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Call the core import logic
    const result = await importProductsFromExcel(buffer)
    
    // Revalidate the product lists so new products appear immediately
    revalidatePath('/admin/products')
    revalidatePath('/catalogo')

    return result
}

import { exportCatalogToExcelBase64 } from '@/features/inventory/export.service'

export async function exportCatalogAction(includeHidden: boolean = false): Promise<string> {
    const base64 = await exportCatalogToExcelBase64(includeHidden)
    return base64
}

import { deactivateProductsFromExcel } from '@/features/inventory/inventory.service'

export async function deactivateProductsAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    // Read the File into a Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Call the core deactivation logic
    const result = await deactivateProductsFromExcel(buffer)
    
    // Revalidate the product lists so changes appear immediately
    revalidatePath('/admin/products')
    revalidatePath('/catalogo')

    return result
}
