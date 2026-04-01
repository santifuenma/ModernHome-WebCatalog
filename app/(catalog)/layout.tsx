import Navbar from '@/components/layout/Navbar'
import FiltrosWrapper from '@/components/catalog/FiltrosWrapper'
import { getAllActiveSubcategorias } from '@/features/subcategorias/subcategoria.service'
import { getActiveStores } from '@/features/products/product.service'

/**
 * CatalogLayout
 * Applies only to the catalog section: home page + /catalogo/**
 * Renders the public Navbar and filter sidebar.
 * Admin pages are NOT wrapped by this layout.
 */
export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
    const [subcategoriaMap, activeStores] = await Promise.all([
        getAllActiveSubcategorias(),
        getActiveStores(),
    ])

    return (
        <>
            <Navbar />
            <FiltrosWrapper subcategoriaMap={subcategoriaMap} activeStores={activeStores} />
            <main>
                {children}
            </main>
        </>
    )
}
