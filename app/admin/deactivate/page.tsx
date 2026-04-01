'use client'

import { useState } from 'react'
import Link from 'next/link'
import { removeFromStoreAction } from '@/app/admin/actions'
import styles from '../operations.module.css'

const STORES = [
    { code: 'LM', label: 'Las Mercedes' },
    { code: 'SM', label: 'Santa Mónica' },
    { code: 'DP', label: 'Depósito' },
    { code: 'CT', label: 'Castellana' },
    { code: 'BT', label: 'Barquisimeto' },
]

export default function RemoveFromStorePage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        successCount: number,
        deactivatedCount: number,
        errorCount: number,
        logs: string[]
    } | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResult(null)
        const formData = new FormData(e.currentTarget)
        try {
            setResult(await removeFromStoreAction(formData))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <Link href="/admin" className={styles.backLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
                </svg>
                Atrás al Dashboard
            </Link>

            <h1 className={styles.title}>Quitar Productos de Tienda</h1>
            <p className={styles.description}>
                Selecciona la tienda y sube el Excel con los productos a quitar. Se eliminarán sus asignaciones para
                esa tienda. Si un producto queda sin ninguna tienda asignada, será desactivado globalmente del catálogo.
                Los productos que siguen en otras tiendas no se verán afectados.
            </p>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                            Tienda *
                        </label>
                        <select name="store" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #d1d1d1', fontSize: '0.95rem', background: '#fff' }}>
                            <option value="">— Selecciona una tienda —</option>
                            {STORES.map(s => (
                                <option key={s.code} value={s.code}>{s.code} — {s.label}</option>
                            ))}
                        </select>
                    </div>

                    <input type="file" name="file" accept=".xlsx, .xls, .csv" required className={styles.fileInput} />

                    <button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? 'Procesando...' : 'Quitar de Tienda'}
                    </button>
                </form>

                {error && (
                    <div className={styles.errorBox}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </div>

            {result && (
                <div className={styles.card}>
                    <h2 className={styles.resultsHeader}>Resultados</h2>
                    <div className={styles.statsGrid}>
                        <div className={`${styles.statBox} ${styles.warning}`}>
                            <p className={styles.statNumber}>{result.successCount}</p>
                            <p className={styles.statLabel}>Productos quitados de la tienda.</p>
                        </div>
                        {result.deactivatedCount > 0 && (
                            <div className={`${styles.statBox} ${styles.danger}`}>
                                <p className={styles.statNumber}>{result.deactivatedCount}</p>
                                <p className={styles.statLabel}>Productos desactivados globalmente (sin tiendas restantes).</p>
                            </div>
                        )}
                        {result.errorCount > 0 && (
                            <div className={`${styles.statBox} ${styles.danger}`}>
                                <p className={styles.statNumber}>{result.errorCount}</p>
                                <p className={styles.statLabel}>Errores durante el proceso.</p>
                            </div>
                        )}
                    </div>
                    {result.logs.length > 0 && (
                        <div>
                            <h3 className={styles.logHeader}>Registro de eventos</h3>
                            <div className={styles.logBox}>
                                {result.logs.map((log, i) => (
                                    <div key={i} className={styles.logLine}>&gt; {log}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
