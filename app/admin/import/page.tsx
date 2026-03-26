'use client'

import { useState } from 'react'
import Link from 'next/link'
import { importProductsAction } from '@/app/admin/actions'

import styles from '../operations.module.css'

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
            const res = await importProductsAction(formData)
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
            
            <h1 className={styles.title}>Importador de Productos</h1>
            <p className={styles.description}>
                Sube tu archivo Excel o CSV de inventario para añadir masivamente los productos a la base de datos o sincronizar su stock.
                Si un código de producto ya existe, solo se actuará si su stock ha cambiado, actualizándolo de forma segura sin sobrescribir descripciones ni imágenes.
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
                        className={`${styles.submitButton} ${styles.yellow}`}
                    >
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
                            <p className={styles.statLabel}>Nuevos productos creados.</p>
                        </div>
                        
                        <div className={`${styles.statBox} ${styles.warning}`}>
                            <p className={styles.statNumber}>{result.updatedCount}</p>
                            <p className={styles.statLabel}>Productos con stock actualizado.</p>
                        </div>

                        <div className={`${styles.statBox} ${styles.danger}`}>
                            <p className={styles.statNumber}>{result.errorCount}</p>
                            <p className={styles.statLabel}>Errores detectados en la BD.</p>
                        </div>
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
