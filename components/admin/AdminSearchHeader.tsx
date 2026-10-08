'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { aiSearchProducts } from '@/app/admin/actions'
import { parseAdminFilters, AdminSearchParams } from '@/features/products/admin-search-params'
import { getFilterChips } from '@/features/products/admin-filter-chips'
import { getFilterGroups, AmbienteMap, FilterGroup } from '@/features/products/admin-filter-options'
import { MAX_QUERY_LENGTH } from '@/features/ai-search/ai-search.constants'
import { AdminFilterPanel } from './AdminFilterPanel'
import { SparkleIcon, SearchIcon, SlidersIcon, ChevronIcon, InfoIcon } from './AdminSearchIcons'
import styles from './AdminSearchHeader.module.css'

// ─────────────────────────────────────────────────────────────────
// AdminSearchHeader
// Cabecera del listado de productos: buscador (con IA o por código/nombre),
// filtros activos como etiquetas y panel desplegable con todos los filtros.
// El estado vive en la URL: cada acción escribe parámetros y la página se vuelve a leer.
// ─────────────────────────────────────────────────────────────────

const FILTER_PANEL_ID = 'admin-filter-panel'

interface AdminSearchHeaderProps {
    ambienteMap: AmbienteMap
    /** Productos que cumplen los filtros actuales (para el pie del panel). */
    totalItems: number
}

/** Resultado de la última búsqueda con IA: sirve para saber si los filtros activos los puso ella. */
interface AiResult {
    query: string          // parámetros de la URL que generó la IA
    dropped: string[]
}

/** "Ambiente: comedor" → "Ambiente:" + valor en negrita. Las etiquetas sin ":" se muestran enteras. */
function ChipLabel({ label }: { label: string }) {
    const split = label.indexOf(': ')
    if (split === -1) return <>{label}</>
    return (
        <>
            {label.slice(0, split + 1)} <strong>{label.slice(split + 2)}</strong>
        </>
    )
}

export function AdminSearchHeader({ ambienteMap, totalItems }: AdminSearchHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const filters = parseAdminFilters(Object.fromEntries(searchParams) as AdminSearchParams)
    const chips = getFilterChips(filters)
    const hasParams = Array.from(searchParams.keys()).some(k => k !== 'page')

    const [mode, setMode] = useState<'ai' | 'text'>('ai')
    const [aiText, setAiText] = useState('')
    const [codeText, setCodeText] = useState(filters.query ?? '')
    const [panelOpen, setPanelOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [aiResult, setAiResult] = useState<AiResult | null>(null)

    // Los filtros vienen de la IA solo mientras la URL siga siendo la que ella generó
    const cameFromAi = aiResult !== null && aiResult.query === searchParams.toString()

    const groups = getFilterGroups(ambienteMap, filters.ambiente)
    const selected: Partial<Record<FilterGroup['param'], string>> = {
        ambiente: filters.ambiente,
        subcategoria: filters.subcategoria,
        status: filters.status,
        stock: filters.stock,
        store: filters.store,
        images: filters.images,
    }

    function navigate(next: URLSearchParams) {
        next.delete('page') // al cambiar los filtros, la página actual puede dejar de existir
        const query = next.toString()
        router.push(query ? `${pathname}?${query}` : pathname)
    }

    function setFilter(param: string, value: string | null) {
        const next = new URLSearchParams(searchParams.toString())
        if (value) next.set(param, value)
        else next.delete(param)
        if (param === 'ambiente') next.delete('subcategoria') // las subcategorías dependen del ambiente
        navigate(next)
    }

    function submitAi(e: React.FormEvent) {
        e.preventDefault()
        if (isPending) return

        const phrase = aiText.trim()
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
                setCodeText('')
                setPanelOpen(true)
                router.push(result.url) // reemplaza los filtros actuales
            } catch {
                setError('No se pudo completar la búsqueda con IA. Inténtalo de nuevo.')
            }
        })
    }

    function submitCode(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setFilter('q', codeText.trim() || null)
    }

    function removeChip(params: string[]) {
        const next = new URLSearchParams(searchParams.toString())
        params.forEach(p => next.delete(p))
        if (params.includes('q')) setCodeText('')
        navigate(next)
    }

    function clearAll() {
        setAiText('')
        setCodeText('')
        setError(null)
        setAiResult(null)
        router.push(pathname)
    }

    return (
        <section className={styles.card} aria-label="Búsqueda y filtros de productos">
            <div className={styles.topRow}>
                <div className={styles.modeToggle} role="group" aria-label="Tipo de búsqueda">
                    <button
                        type="button"
                        aria-pressed={mode === 'ai'}
                        className={mode === 'ai' ? styles.modeActive : styles.modeButton}
                        onClick={() => { setMode('ai'); setError(null) }}
                    >
                        <SparkleIcon size={12} /> Con IA
                    </button>
                    <button
                        type="button"
                        aria-pressed={mode === 'text'}
                        className={mode === 'text' ? styles.modeActive : styles.modeButton}
                        onClick={() => { setMode('text'); setError(null) }}
                    >
                        Código / nombre
                    </button>
                </div>

                {mode === 'ai' ? (
                    <form onSubmit={submitAi} className={`${styles.searchBox} ${styles.searchBoxAi}`}>
                        <span className={styles.searchIconAi}><SparkleIcon size={16} /></span>
                        <input
                            type="text"
                            value={aiText}
                            onChange={e => setAiText(e.target.value)}
                            placeholder="Ej.: mesas de comedor de madera de más de 2 m con stock en Valencia"
                            aria-label="Describe lo que buscas"
                            maxLength={MAX_QUERY_LENGTH}
                            disabled={isPending}
                            className={styles.searchInput}
                            autoComplete="off"
                        />
                        <button type="submit" disabled={isPending} className={styles.searchButton} aria-busy={isPending}>
                            {isPending ? 'Pensando…' : 'Buscar'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={submitCode} className={styles.searchBox}>
                        <span className={styles.searchIcon}><SearchIcon size={16} /></span>
                        <input
                            type="text"
                            value={codeText}
                            onChange={e => setCodeText(e.target.value)}
                            placeholder="Código o nombre..."
                            aria-label="Código o nombre del producto"
                            className={styles.searchInput}
                            autoComplete="off"
                        />
                        <button type="submit" className={styles.searchButton}>Buscar</button>
                    </form>
                )}
            </div>

            <div className={styles.filterRow}>
                <button
                    type="button"
                    className={`${styles.filtersButton} ${panelOpen || chips.length > 0 ? styles.filtersButtonActive : ''}`}
                    aria-expanded={panelOpen}
                    aria-controls={FILTER_PANEL_ID}
                    onClick={() => setPanelOpen(open => !open)}
                >
                    <SlidersIcon size={16} />
                    Filtros
                    {chips.length > 0 && <span className={styles.badge}>{chips.length}</span>}
                    <ChevronIcon size={13} up={panelOpen} />
                </button>

                {chips.length > 0 && <span className={styles.divider} aria-hidden="true" />}

                {chips.length > 0 && (
                    <ul className={styles.chips} aria-label={cameFromAi ? 'Filtros que entendió la IA' : 'Filtros activos'}>
                        {chips.map(chip => (
                            <li key={chip.params.join('+')} className={styles.chip}>
                                {cameFromAi && <span className={styles.chipSparkle}><SparkleIcon size={10} /></span>}
                                <span><ChipLabel label={chip.label} /></span>
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
                )}

                {hasParams && (
                    <button type="button" onClick={clearAll} className={styles.clearAll}>
                        Limpiar todo
                    </button>
                )}
            </div>

            <div aria-live="polite">
                {error && (
                    <p role="alert" className={styles.notice}>
                        <InfoIcon /> <span>{error}</span>
                    </p>
                )}
                {cameFromAi && aiResult.dropped.length > 0 && (
                    <p className={styles.notice}>
                        <InfoIcon />
                        <span>La IA devolvió algo que no se pudo aplicar y se ignoró ({aiResult.dropped.join(', ')}). Revisa los filtros.</span>
                    </p>
                )}
            </div>

            {panelOpen && (
                <AdminFilterPanel
                    id={FILTER_PANEL_ID}
                    groups={groups}
                    selected={selected}
                    aiMarked={cameFromAi}
                    totalItems={totalItems}
                    onToggle={(param, value) => setFilter(param, selected[param] === value ? null : value)}
                    onClose={() => setPanelOpen(false)}
                />
            )}
        </section>
    )
}
