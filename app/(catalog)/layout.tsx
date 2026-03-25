import Navbar from '@/components/layout/Navbar'
import FiltrosWrapper from '@/components/catalog/FiltrosWrapper'
import { getAllActiveSubcategorias } from '@/features/subcategorias/subcategoria.service'

/**
 * CatalogLayout
 * Applies only to the catalog section: home page + /catalogo/**
 * Renders the public Navbar and filter sidebar.
 * Admin pages are NOT wrapped by this layout.
 */
export default async function CatalogLayout({ children }: { children: React.ReactNode }) {
    const subcategoriaMap = await getAllActiveSubcategorias()

    return (
        <>
            <Navbar />
            <FiltrosWrapper subcategoriaMap={subcategoriaMap} />
            <main>
                {children}
            </main>
        </>
    )
}
