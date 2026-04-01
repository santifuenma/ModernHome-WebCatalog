'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAmbientes } from '@/features/ambientes/ambiente.service';
import { Subcategoria } from '@/features/subcategorias/subcategoria.types';
import { STORE_LABELS, StoreCode } from '@/features/products/product.types';
import styles from './Filtros.module.css';

/**
 * Filtros
 * Barra de filtros del catálogo con dos filas:
 * - Fila 1: Ambientes — botones en desktop, <select> en móvil
 * - Fila 2: Subcategorías del ambiente activo
 */

interface Props {
    subcategoriaMap: Record<string, Subcategoria[]>;
}

export default function Filtros({ subcategoriaMap }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const ambientes = getAmbientes();

    const currentStore = searchParams.get('store') ?? '';
    const storeQuery = currentStore ? `?store=${currentStore}` : '';

    // Extract active ambiente from the URL path
    // e.g. /catalogo/sala or /catalogo/sala/sofas → "sala"
    const pathSegments = pathname?.split('/') ?? []
    const activeAmbiente = ambientes.find(a => pathSegments[2] === a.slug)?.slug

    // Extract active subcategoria from the URL path
    // e.g. /catalogo/sala/sofas → "sofas"
    const activeSubcategoria = pathSegments[3] ?? null

    // Get subcategorias for the active ambiente (empty if none selected)
    const subcategorias = activeAmbiente
        ? (subcategoriaMap[activeAmbiente] || [])
        : []

    // Handle select change on mobile: navigate to the selected ambiente
    function handleAmbienteSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value
        router.push(value ? `/catalogo/${value}${storeQuery}` : `/catalogo${storeQuery}`, { scroll: false })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Handle store selection
    function handleStoreSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set('store', value)
        else params.delete('store')
        
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className={styles.filtros_bar}>

            {/* ─── FILA 1 DESKTOP: botones de ambiente y tienda ─── */}
            <div className={styles.filtros_content}>
                {/* Selector de tienda (Desktop) */}
                <select
                    className={`${styles.filtro_button} ${styles.store_select_desktop} ${currentStore ? styles.active : ''}`}
                    value={currentStore}
                    onChange={handleStoreSelect}
                >
                    <option value="">Todas las tiendas</option>
                    {Object.entries(STORE_LABELS).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>

                {ambientes.map(({ label, slug }) => {
                    const isActive = activeAmbiente === slug
                    const href = isActive ? `/catalogo${storeQuery}` : `/catalogo/${slug}${storeQuery}`

                    return (
                        <Link
                            key={slug}
                            href={href}
                            className={`${styles.filtro_button} ${isActive ? styles.active : ''}`}
                            onClick={scrollToTop}
                            scroll={false}
                        >
                            {label}
                        </Link>
                    )
                })}
            </div>

            {/* ─── FILA 1 MOBILE: selects desplegables (Tienda y Ambiente) ─── */}
            <div className={styles.select_mobile_wrapper}>
                <select
                    className={`${styles.select_mobile} ${currentStore ? styles.select_active : ''}`}
                    value={currentStore}
                    onChange={handleStoreSelect}
                >
                    <option value="">Todas las tiendas</option>
                    {Object.entries(STORE_LABELS).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>

                <select
                    className={`${styles.select_mobile} ${activeAmbiente ? styles.select_active : ''}`}
                    value={activeAmbiente ?? ''}
                    onChange={handleAmbienteSelect}
                >
                    <option value="">Todos los ambientes</option>
                    {ambientes.map(({ label, slug }) => (
                        <option key={slug} value={slug}>{label}</option>
                    ))}
                </select>
            </div>

            {/* ─── FILA 2: SUBCATEGORÍAS (solo visible cuando hay ambiente activo) ─── */}
            {activeAmbiente && subcategorias.length > 0 && (
                <div className={styles.subcategorias_content}>
                    {subcategorias.map(({ label, slug }) => {
                        const isActive = activeSubcategoria === slug
                        const href = `/catalogo/${activeAmbiente}/${slug}${storeQuery}`

                        return (
                            <Link
                                key={slug}
                                href={href}
                                className={`${styles.subcategoria_link} ${isActive ? styles.subcategoriaActive : ''}`}
                                onClick={scrollToTop}
                                scroll={false}
                            >
                                {label}
                            </Link>
                        )
                    })}
                </div>
            )}

        </div>
    );
}
