'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAmbientes } from '@/features/ambientes/ambiente.service';
import { getSubcategoriasByAmbiente } from '@/features/subcategorias/subcategoria.service';
import styles from './Filtros.module.css';

/**
 * Filtros
 * Barra de filtros del catálogo con dos filas:
 * - Fila 1: Ambientes — botones en desktop, <select> en móvil
 * - Fila 2: Subcategorías del ambiente activo
 *
 * Navegación:
 * - Clic en ambiente → /catalogo/[ambiente]
 * - Clic en ambiente activo → /catalogo (limpia el filtro)
 * - Clic en subcategoría → /catalogo/[ambiente]/[subcategoria]
 */
export default function Filtros() {
    const pathname = usePathname();
    const router = useRouter();
    const ambientes = getAmbientes();

    // Extract active ambiente from the URL path
    // e.g. /catalogo/sala or /catalogo/sala/sofas → "sala"
    const pathSegments = pathname?.split('/') ?? []
    const activeAmbiente = ambientes.find(a => pathSegments[2] === a.slug)?.slug

    // Extract active subcategoria from the URL path
    // e.g. /catalogo/sala/sofas → "sofas"
    const activeSubcategoria = pathSegments[3] ?? null

    // Get subcategorias for the active ambiente (empty if none selected)
    const subcategorias = activeAmbiente
        ? getSubcategoriasByAmbiente(activeAmbiente)
        : []

    // Handle select change on mobile: navigate to the selected ambiente
    function handleAmbienteSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value
        router.push(value ? `/catalogo/${value}` : '/catalogo')
    }

    return (
        <div className={styles.filtros_bar}>

            {/* ─── FILA 1 DESKTOP: botones de ambiente ─── */}
            <div className={styles.filtros_content}>
                {ambientes.map(({ label, slug }) => {
                    const isActive = activeAmbiente === slug
                    const href = isActive ? '/catalogo' : `/catalogo/${slug}`

                    return (
                        <Link
                            key={slug}
                            href={href}
                            className={`${styles.filtro_button} ${isActive ? styles.active : ''}`}
                        >
                            {label}
                        </Link>
                    )
                })}
            </div>

            {/* ─── FILA 1 MOBILE: select desplegable de ambiente ─── */}
            <div className={styles.select_mobile_wrapper}>
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
                        const href = `/catalogo/${activeAmbiente}/${slug}`

                        return (
                            <Link
                                key={slug}
                                href={href}
                                className={`${styles.subcategoria_link} ${isActive ? styles.subcategoriaActive : ''}`}
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
