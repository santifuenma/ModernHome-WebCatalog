'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import styles from './AdminPagination.module.css'

interface AdminPaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
}

export function AdminPagination({ currentPage, totalPages, totalItems }: AdminPaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    if (totalPages <= 1) return null

    function goTo(page: number) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))
        router.push(`${pathname}?${params.toString()}`)
    }

    // Build page numbers to show: always first, last, current ±2, with ellipsis
    const pages: (number | '...')[] = []
    const delta = 2
    const range: number[] = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i)
    }
    pages.push(1)
    if (range[0] > 2) pages.push('...')
    range.forEach(p => pages.push(p))
    if (range[range.length - 1] < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)

    return (
        <div className={styles.container}>
            <span className={styles.info}>
                Página {currentPage} de {totalPages} · {totalItems} productos en total
            </span>
            <div className={styles.pagination}>
                <button
                    className={styles.button}
                    onClick={() => goTo(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ← Anterior
                </button>

                {pages.map((p, i) =>
                    p === '...'
                        ? <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                        : <button
                            key={p}
                            className={`${styles.button} ${p === currentPage ? styles.active : ''}`}
                            onClick={() => goTo(p as number)}
                          >
                            {p}
                          </button>
                )}

                <button
                    className={styles.button}
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Siguiente →
                </button>
            </div>
        </div>
    )
}
