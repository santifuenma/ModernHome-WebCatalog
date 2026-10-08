'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { aiSearchProducts } from '@/app/admin/actions'
import { parseAdminFilters, AdminSearchParams } from '@/features/products/admin-search-params'
import { getFilterChips } from '@/features/products/admin-filter-chips'
import { MAX_QUERY_LENGTH } from '@/features/ai-search/ai-search.constants'
import styles from './AiSearchBar.module.css'

// ─────────────────────────────────────────────────────────────────
// AiSearchBar
// Búsqueda en lenguaje natural: la frase se manda a la Server Action
// aiSearchProducts, que devuelve la URL con los filtros ya aplicados.
// Debajo muestra los filtros activos como etiquetas que se pueden quitar.
// ─────────────────────────────────────────────────────────────────

/** Texto de lo que se aplicó en la última búsqueda con IA (para el aviso "Entendí"). */
interface AiResult {
    query: string          // parámetros de la URL que generó la IA
    dropped: string[]
}

export function AiSearchBar() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [text, setText] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [aiResult, setAiResult] = useState<AiResult | null>(null)

    const chips = getFilterChips(parseAdminFilters(Object.fromEntries(searchParams) as AdminSearchParams))

    // "Entendí:" solo mientras la URL siga siendo la que generó la IA; si se cambia a mano, pasa a "Filtros activos:"
    const cameFromAi = aiResult !== null && aiResult.query === searchParams.toString()

    function submit(e: React.FormEvent) {
        e.preventDefault()
        if (isPending) return

        const phrase = text.trim()
        if (!phrase) {
            setError('Escribe qué quieres buscar.')
            return
        }

        setError(null)
        startTransition(async () => {
            try {
                const result = await aiSearchProducts(phrase)
                if (!result.ok) {
                    setError(result.error)
                    return
                }
                if (Object.keys(result.filters).length === 0) {
                    setError('No encontré ningún filtro en tu frase. Prueba con algo como "mesas de madera con stock en Valencia".')
                    return
                }
                setAiResult({ query: new URL(result.url, 'http://local').searchParams.toString(), dropped: result.dropped })
                router.push(result.url) // reemplaza los filtros actuales
            } catch {
                setError('No se pudo completar la búsqueda con IA. Inténtalo de nuevo.')
            }
        })
    }

    function removeChip(params: string[]) {
        const next = new URLSearchParams(searchParams.toString())
        params.forEach(p => next.delete(p))
        next.delete('page')
        const query = next.toString()
        router.push(query ? `${pathname}?${query}` : pathname)
    }

    return (
        <section className={styles.card} aria-label="Búsqueda con IA">
            <form onSubmit={submit} className={styles.form}>
                <label htmlFor="ai-search-input" className={styles.label}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
                    </svg>
                    Buscar con IA
                </label>

                <div className={styles.row}>
                    <input
                        id="ai-search-input"
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Ej.: mesas de comedor de madera de más de 2 m con stock en Valencia"
                        maxLength={MAX_QUERY_LENGTH}
                        disabled={isPending}
                        className={styles.input}
                        autoComplete="off"
                    />
                    <button type="submit" disabled={isPending} className={styles.button} aria-busy={isPending}>
                        {isPending ? 'Pensando…' : 'Buscar'}
                    </button>
                </div>
            </form>

            <div aria-live="polite">
                {error && <p role="alert" className={styles.error}>{error}</p>}

                {chips.length > 0 && (
                    <div className={styles.chipsRow}>
                        <span className={styles.chipsLabel}>{cameFromAi ? 'Entendí:' : 'Filtros activos:'}</span>
                        <ul className={styles.chips}>
                            {chips.map(chip => (
                                <li key={chip.params.join('+')} className={styles.chip}>
                                    {chip.label}
                                    <button
                                        type="button"
                                        onClick={() => removeChip(chip.params)}
                                        className={styles.chipRemove}
                                        aria-label={`Quitar filtro: ${chip.label}`}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {cameFromAi && aiResult.dropped.length > 0 && (
                    <p className={styles.note}>
                        La IA devolvió algo que no se pudo aplicar y se ignoró ({aiResult.dropped.join(', ')}). Revisa los filtros.
                    </p>
                )}
            </div>
        </section>
    )
}
