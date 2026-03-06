import ProductGrid from "@/components/layout/ProductGrid"
import { getProductsByAmbiente } from "@/features/products/product.service"

interface AmbientePageProps {
    params: Promise<{
        ambiente: string
    }>
}

/**
 * AmbientePage
 * Página dinámica que muestra los productos filtrados por ambiente.
 * Se renderiza en /catalogo/[ambiente] (ej: /catalogo/dormitorio).
 * Reutiliza ProductGrid con los productos del ambiente seleccionado.
 */
export default async function AmbientePage(props: AmbientePageProps) {
    const { ambiente } = await props.params

    // Fetch products filtered by the ambiente from the URL param
    const products = getProductsByAmbiente(ambiente)

    return (
        <ProductGrid products={products} />
    )
}
