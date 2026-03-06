import ProductGrid from "@/components/layout/ProductGrid"
import Pagination from "@/components/layout/Pagination"
import { getProductsByAmbiente } from "@/features/products/product.service"

interface AmbientePageProps {
    params: Promise<{ ambiente: string }>
    searchParams: Promise<{ page?: string }>
}

export default async function AmbientePage(props: AmbientePageProps) {
    const { ambiente } = await props.params
    const { page } = await props.searchParams
    const currentPage = parseInt(page ?? '1', 10)

    const { items, totalPages } = await getProductsByAmbiente(ambiente, currentPage)

    return (
        <>
            <ProductGrid products={items} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/catalogo/${ambiente}`} />
        </>
    )
}
