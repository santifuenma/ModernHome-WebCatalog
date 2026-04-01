'use client'

import { useState } from 'react'
import Link from 'next/link'
import { importProductsAction } from '@/app/admin/actions'
import styles from '../operations.module.css'

const STORES = [
    { code: 'LM', label: 'Las Mercedes' },
    { code: 'SM', label: 'Santa Mónica' },
    { code: 'DP', label: 'Depósito' },
    { code: 'CT', label: 'Castellana' },
    { code: 'BT', label: 'Barquisimeto' },
]

export default function ImportProductsPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        successCount: number,
        updatedCount: number,
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
            setResult(await importProductsAction(formData))
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

            <h1 className={styles.title}>Importador de Productos</h1>
            <p className={styles.description}>
                Selecciona la tienda y sube su Excel de inventario. Los productos nuevos se crearán y se asignarán
                a esa tienda con su stock. Los existentes recibirán la tienda si aún no la tenían, o actualizarán
                su stock para esa tienda si cambió.
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

                    <button type="submit" disabled={loading} className={`${styles.submitButton} ${styles.yellow}`}>
                        {loading ? 'Importando...' : 'Iniciar Sincronización'}
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
                    <h2 className={styles.resultsHeader}>Resultados de la sincronización</h2>
                    <div className={styles.statsGrid}>
                        <div className={`${styles.statBox} ${styles.success}`}>
                            <p className={styles.statNumber}>{result.successCount}</p>
                            <p className={styles.statLabel}>Productos creados / añadidos a la tienda.</p>
                        </div>
                        <div className={`${styles.statBox} ${styles.warning}`}>
                            <p className={styles.statNumber}>{result.updatedCount}</p>
                            <p className={styles.statLabel}>Stock actualizado en esta tienda.</p>
                        </div>
                        <div className={`${styles.statBox} ${styles.danger}`}>
                            <p className={styles.statNumber}>{result.errorCount}</p>
                            <p className={styles.statLabel}>Errores detectados.</p>
                        </div>
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
