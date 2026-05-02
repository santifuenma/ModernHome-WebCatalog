import ProductGrid from "@/components/catalog/ProductGrid"
import Pagination from "@/components/ui/Pagination"
import { getProductsBySubcategoria } from "@/features/products/product.service"

interface SubcategoriaPageProps {
    params: Promise<{ ambiente: string, subcategoria: string }>
    searchParams: Promise<{ page?: string; store?: string }>
}

export default async function SubcategoriaPage(props: SubcategoriaPageProps) {
    const { ambiente, subcategoria } = await props.params
    const { page, store } = await props.searchParams
    const currentPage = parseInt(page ?? '1', 10)
    // Sin store en la URL → undefined = todas las tiendas
    const activeStore = store ?? undefined

    const { items, totalPages } = await getProductsBySubcategoria(ambiente, subcategoria, currentPage, activeStore)

    return (
        <>
            <ProductGrid products={items} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/catalogo/${ambiente}/${subcategoria}`} />
        </>
    )
}
