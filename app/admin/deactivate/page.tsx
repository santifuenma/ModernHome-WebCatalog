'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deactivateProductsAction } from '@/app/admin/actions'

import styles from '../operations.module.css'

export default function DeactivateProductsPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        successCount: number,
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
            const res = await deactivateProductsAction(formData)
            setResult(res)
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

            <h1 className={styles.title}>Desactivar Productos Antiguos</h1>
            <p className={styles.description}>
                Sube el archivo Excel que contiene los productos descatalogados (los que ya no están en tu inventario principal). 
                La herramienta leerá la columna "Código" y **ocultará** automáticamente todos esos productos para que dejen de verse en tu catálogo web.
            </p>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input 
                        type="file" 
                        name="file" 
                        accept=".xlsx, .xls, .csv" 
                        required
                        className={styles.fileInput}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Desactivando...' : 'Desactivar Productos'}
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
                        <div className={`${styles.statBox} ${styles.danger}`}>
                            <p className={styles.statNumber}>{result.successCount}</p>
                            <p className={styles.statLabel}>Productos desactivados y ocultos del catálogo.</p>
                        </div>

                        {result.errorCount > 0 && (
                            <div className={`${styles.statBox} ${styles.warning}`}>
                                <p className={styles.statNumber}>{result.errorCount}</p>
                                <p className={styles.statLabel}>Errores durante el proceso.</p>
                            </div>
                        )}
                    </div>

                    {result.logs.length > 0 && (
                        <div>
                            <h3 className={styles.logHeader}>Registro de eventos (Logs)</h3>
                            <div className={styles.logBox}>
                                {result.logs.map((log, index) => (
                                    <div key={index} className={styles.logLine}>&gt; {log}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
