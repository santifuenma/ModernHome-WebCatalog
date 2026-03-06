import ProductGrid from "@/components/layout/ProductGrid"
import Pagination from "@/components/layout/Pagination"
import { getProductsBySubcategoria } from "@/features/products/product.service"

interface SubcategoriaPageProps {
    params: Promise<{ ambiente: string, subcategoria: string }>
    searchParams: Promise<{ page?: string }>
}

export default async function SubcategoriaPage(props: SubcategoriaPageProps) {
    const { ambiente, subcategoria } = await props.params
    const { page } = await props.searchParams
    const currentPage = parseInt(page ?? '1', 10)

    const { items, totalPages } = await getProductsBySubcategoria(subcategoria, currentPage)

    return (
        <>
            <ProductGrid products={items} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/catalogo/${ambiente}/${subcategoria}`} />
        </>
    )
}
