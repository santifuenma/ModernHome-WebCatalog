import ProductGrid from "@/components/layout/ProductGrid"
import { getProductCards } from "@/features/products/product.service"

export default function CatalogoPage() {

    const products = getProductCards()

    return (
        <ProductGrid products={products} />
    )
}