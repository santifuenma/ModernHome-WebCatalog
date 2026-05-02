import ProductGrid from "@/components/catalog/ProductGrid"
import Pagination from "@/components/ui/Pagination"
import { getProductCards } from "@/features/products/product.service"

interface CatalogoPageProps {
    searchParams: Promise<{ page?: string; store?: string }>
}

export default async function CatalogoPage(props: CatalogoPageProps) {
    const { page, store } = await props.searchParams
    const currentPage = parseInt(page ?? '1', 10)
    // Sin store en la URL → undefined = todas las tiendas
    const activeStore = store ?? undefined

    const { items, totalPages } = await getProductCards(currentPage, activeStore)

    return (
        <>
            <ProductGrid products={items} priorityCount={4} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/catalogo" />
        </>
    )
}