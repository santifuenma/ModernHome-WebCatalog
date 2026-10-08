'use client'

import type { FilterGroup, FilterGroups } from '@/features/products/admin-filter-options'
import { SparkleIcon } from './AdminSearchIcons'
import styles from './AdminSearchHeader.module.css'

// ─────────────────────────────────────────────────────────────────
// AdminFilterPanel
// Panel desplegable con los filtros que ya existen, agrupados en dos secciones.
// Cada grupo es de una sola elección (la URL admite un valor por filtro): pulsar
// otra opción reemplaza la anterior y pulsar la marcada la quita.
// Los cambios se aplican al momento.
// ─────────────────────────────────────────────────────────────────

type Param = FilterGroup['param']

/** Un grupo con más opciones que esto ocupa varias columnas, para que el panel no se haga larguísimo. */
const LONG_GROUP = 8

interface AdminFilterPanelProps {
    id: string
    groups: FilterGroups
    /** Valor activo de cada filtro. */
    selected: Partial<Record<Param, string>>
    /** True si los filtros marcados vienen de la última búsqueda con IA. */
    aiMarked: boolean
    totalItems: number
    onToggle: (param: Param, value: string) => void
    onClose: () => void
}

interface SectionProps {
    title: string
    groups: FilterGroup[]
    selected: AdminFilterPanelProps['selected']
    aiMarked: boolean
    onToggle: AdminFilterPanelProps['onToggle']
}

function PanelSection({ title, groups, selected, aiMarked, onToggle }: SectionProps) {
    return (
        <div className={styles.panelSection}>
            <h3 className={styles.sectionTitle}>{title}</h3>
            <div className={styles.groups}>
                {groups.map(group => (
                    <fieldset
                        key={group.param}
                        className={`${styles.group} ${group.options.length > LONG_GROUP ? styles.groupWide : ''}`}
                    >
                        <legend className={styles.groupTitle}>{group.title}</legend>

                        {group.options.length === 0 && (
                            <p className={styles.emptyHint}>{group.emptyHint ?? 'Sin opciones.'}</p>
                        )}

                        <div className={styles.options}>
                            {group.options.map(option => {
                                const checked = selected[group.param] === option.value
                                return (
                                    <label key={option.value} className={`${styles.option} ${checked ? styles.optionChecked : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => onToggle(group.param, option.value)}
                                        />
                                        <span>{option.label}</span>
                                        {checked && aiMarked && (
                                            <span className={styles.aiMark} title="Marcado por la IA">
                                                <SparkleIcon size={10} />
                                            </span>
                                        )}
                                    </label>
                                )
                            })}
                        </div>
                    </fieldset>
                ))}
            </div>
        </div>
    )
}

export function AdminFilterPanel({ id, groups, selected, aiMarked, totalItems, onToggle, onClose }: AdminFilterPanelProps) {
    return (
        <div id={id} className={styles.panel}>
            <PanelSection title="Producto" groups={groups.product} selected={selected} aiMarked={aiMarked} onToggle={onToggle} />
            <PanelSection title="Inventario y publicación" groups={groups.inventory} selected={selected} aiMarked={aiMarked} onToggle={onToggle} />

            <div className={styles.panelFooter}>
                <span className={styles.footerText}>
                    {aiMarked && (
                        <>
                            <span className={styles.aiMark}><SparkleIcon size={11} /></span>
                            Marcado por la IA ·{' '}
                        </>
                    )}
                    Se aplica al momento · <strong>{totalItems} {totalItems === 1 ? 'resultado' : 'resultados'}</strong>
                </span>
                <button type="button" onClick={onClose} className={styles.hideButton}>
                    Ocultar filtros
                </button>
            </div>
        </div>
    )
}
