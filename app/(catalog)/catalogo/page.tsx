import ProductGrid from "@/components/catalog/ProductGrid"
import Pagination from "@/components/ui/Pagination"
import { getProductCards } from "@/features/products/product.service"

interface CatalogoPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function CatalogoPage(props: CatalogoPageProps) {
    const { page } = await props.searchParams
    const currentPage = parseInt(page ?? '1', 10)

    const { items, totalPages } = await getProductCards(currentPage)

    return (
        <>
            <ProductGrid products={items} priorityCount={4} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/catalogo" />
        </>
    )
}