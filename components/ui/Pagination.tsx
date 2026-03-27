'use client'

import Link from 'next/link'
import styles from './Pagination.module.css'

interface PaginationProps {
    /** Current page number */
    currentPage: number
    /** Total number of pages */
    totalPages: number
    /**
     * Base path for pagination links (without page param).
     * e.g. "/catalogo" or "/catalogo/sala"
     */
    basePath: string
}

/**
 * Pagination
 * Renders Previous / page numbers / Next navigation links.
 * Each button is a plain <Link> — no client JS needed.
 * Uses ?page=N query param to navigate between pages.
 */
export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null

    // Build href for a given page number
    function pageHref(page: number) {
        return `${basePath}?page=${page}`
    }

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Show up to 5 page numbers centered around the current page
    const delta = 2
    const pages: number[] = []
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
        pages.push(i)
    }

    return (
        <nav className={styles.pagination} aria-label="Paginación">

            {/* Previous */}
            {currentPage > 1 ? (
                <Link href={pageHref(currentPage - 1)} className={styles.page_btn} onClick={handleScrollToTop} scroll={false}>
                    ←
                </Link>
            ) : (
                <span className={`${styles.page_btn} ${styles.disabled}`}>←</span>
            )}

            {/* First page + ellipsis */}
            {pages[0] > 1 && (
                <>
                    <Link href={pageHref(1)} className={styles.page_btn} onClick={handleScrollToTop} scroll={false}>1</Link>
                    {pages[0] > 2 && <span className={styles.ellipsis}>…</span>}
                </>
            )}

            {/* Page numbers */}
            {pages.map(page => (
                <Link
                    key={page}
                    href={pageHref(page)}
                    className={`${styles.page_btn} ${page === currentPage ? styles.active : ''}`}
                    onClick={handleScrollToTop}
                    scroll={false}
                >
                    {page}
                </Link>
            ))}

            {/* Last page + ellipsis */}
            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className={styles.ellipsis}>…</span>}
                    <Link href={pageHref(totalPages)} className={styles.page_btn} onClick={handleScrollToTop} scroll={false}>{totalPages}</Link>
                </>
            )}

            {/* Next */}
            {currentPage < totalPages ? (
                <Link href={pageHref(currentPage + 1)} className={styles.page_btn} onClick={handleScrollToTop} scroll={false}>
                    →
                </Link>
            ) : (
                <span className={`${styles.page_btn} ${styles.disabled}`}>→</span>
            )}

        </nav>
    )
}
