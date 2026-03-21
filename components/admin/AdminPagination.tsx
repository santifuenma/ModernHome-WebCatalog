'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

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

    const btnStyle = (active: boolean, disabled = false) => ({
        padding: '7px 12px',
        border: `1px solid ${active ? '#0070f3' : '#ddd'}`,
        borderRadius: '6px',
        backgroundColor: active ? '#0070f3' : disabled ? '#f5f5f5' : '#fff',
        color: active ? '#fff' : disabled ? '#bbb' : '#333',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: active ? 'bold' as const : 'normal' as const,
        fontSize: '14px',
        minWidth: '38px',
    })

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>
                Página {currentPage} de {totalPages} · {totalItems} productos en total
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                    style={btnStyle(false, currentPage === 1)}
                    onClick={() => goTo(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ← Anterior
                </button>

                {pages.map((p, i) =>
                    p === '...'
                        ? <span key={`ellipsis-${i}`} style={{ padding: '7px 6px', color: '#999', alignSelf: 'center' }}>…</span>
                        : <button
                            key={p}
                            style={btnStyle(p === currentPage)}
                            onClick={() => goTo(p as number)}
                          >
                            {p}
                          </button>
                )}

                <button
                    style={btnStyle(false, currentPage === totalPages)}
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Siguiente →
                </button>
            </div>
        </div>
    )
}
