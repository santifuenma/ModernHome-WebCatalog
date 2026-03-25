import ProductGrid from "@/components/catalog/ProductGrid"
import Pagination from "@/components/ui/Pagination"
import { getProductsByAmbiente } from "@/features/products/product.service"

// Pre-render these routes at build time for faster initial loads.
// Slugs must match exactly the `ambiente` field values in the DB.
export function generateStaticParams() {
    const ambientes = ['sala', 'comedor', 'dormitorio', 'exterior', 'complementos']
    return ambientes.map((ambiente) => ({ ambiente }))
}

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
            <ProductGrid products={items} priorityCount={4} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/catalogo/${ambiente}`} />
        </>
    )
}
