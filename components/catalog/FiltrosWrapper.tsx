'use client';

import { usePathname } from 'next/navigation';
import Filtros from './Filtros';
import { Subcategoria } from '@/features/subcategorias/subcategoria.types';

interface Props {
    subcategoriaMap: Record<string, Subcategoria[]>;
}

export default function FiltrosWrapper({ subcategoriaMap }: Props) {
    const pathname = usePathname();

    // The route pattern for product pages is /catalogo/[ambiente]/[subcategoria]/[producto]
    // A path split by '/' has 5 parts: "", "catalogo", "ambiente", "subcategoria", "producto"
    // So if the path starts with /catalogo and has 4 segments after it (length 5), it's a product page
    const isProductPage = pathname?.startsWith('/catalogo/') && pathname.split('/').length === 5;

    // We can also allow it to be hidden on the admin page if required
    const isAdminPage = pathname?.startsWith('/admin');

    if (isProductPage || isAdminPage) {
        return null;
    }

    return <Filtros subcategoriaMap={subcategoriaMap} />;
}
