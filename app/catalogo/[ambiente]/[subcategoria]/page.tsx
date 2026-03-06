import ProductGrid from "@/components/layout/ProductGrid"
import { getProductsBySubcategoria } from "@/features/products/product.service"

interface SubcategoriaPageProps {
    params: Promise<{
        ambiente: string
        subcategoria: string
    }>
}

/**
 * SubcategoriaPage
 * Muestra los productos filtrados por ambiente y subcategoría.
 * Se renderiza en /catalogo/[ambiente]/[subcategoria] (ej: /catalogo/sala/sofas).
 */
export default async function SubcategoriaPage(props: SubcategoriaPageProps) {
    const { subcategoria } = await props.params

    // Fetch products filtered by subcategoria from the URL param
    const products = getProductsBySubcategoria(subcategoria)

    return (
        <ProductGrid products={products} />
    )
}
