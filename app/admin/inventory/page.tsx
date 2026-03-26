'use client'

import { useState } from 'react'
import Link from 'next/link'
import { compareInventoryAction } from '@/app/admin/actions'

import styles from '../operations.module.css'

export default function InventoryComparisonPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        newCount: number,
        oldCount: number,
        newProductsBase64: string,
        oldProductsBase64: string
    } | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResult(null)

        const formData = new FormData(e.currentTarget)
        try {
            const res = await compareInventoryAction(formData)
            setResult(res)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleDownload(base64: string, filename: string) {
        const link = document.createElement('a')
        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className={styles.container}>
            <Link href="/admin" className={styles.backLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
                </svg>
                Atrás al Dashboard
            </Link>

            <h1 className={styles.title}>Comparador de Inventario</h1>
            <p className={styles.description}>
                Sube tu nuevo archivo Excel de inventario. Lo compararemos con la base de datos actual (solo productos activos) basándonos en la columna "Código". Obtendrás dos archivos Excel de vuelta: uno con los productos nuevos y otro con los que ya no están.
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
                        {loading ? 'Procesando comparación...' : 'Comparar Inventario'}
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
                        <div className={styles.statBox}>
                            <p className={styles.statNumber}>{result.newCount}</p>
                            <p className={styles.statLabel}>Productos Nuevos en el Excel que has subido.</p>
                            <button 
                                onClick={() => handleDownload(result.newProductsBase64, 'modern-home-NUEVOS.xlsx')}
                                className={styles.downloadButton}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Descargar Nuevos
                            </button>
                        </div>

                        <div className={styles.statBox}>
                            <p className={styles.statNumber}>{result.oldCount}</p>
                            <p className={styles.statLabel}>Productos Antiguos (ya no figuran en el Excel).</p>
                            <button 
                                onClick={() => handleDownload(result.oldProductsBase64, 'modern-home-PARA-BORRAR.xlsx')}
                                className={styles.downloadButton}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Descargar Antiguos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
