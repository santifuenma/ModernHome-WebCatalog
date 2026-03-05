import ProductDetails from '@/components/catalog/ProductDetails'
import { getProductBySlug } from '@/features/products/product.service'

interface ProductoPageProps {
    params: Promise<{
        producto: string
    }>
}

export default async function ProductoPage(props: ProductoPageProps) {
    const params = await props.params;
    const product = getProductBySlug(params.producto)

    if (!product) {
        return <div>Producto no encontrado</div>
    }

    return (
        <ProductDetails product={product} />
    )
}