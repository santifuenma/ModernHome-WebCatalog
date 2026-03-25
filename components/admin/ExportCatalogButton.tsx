'use client'

import { useState } from 'react'
import { exportCatalogAction } from '@/app/admin/actions'
import styles from './ExportCatalogButton.module.css'

export function ExportCatalogButton() {
    const [loading, setLoading] = useState(false)
    const [includeHidden, setIncludeHidden] = useState(false)

    async function handleExport() {
        try {
            setLoading(true)
            const base64 = await exportCatalogAction(includeHidden)
            
            // Create a temporary link to download the file
            const link = document.createElement('a')
            link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
            link.download = `catalogo-integrado-${new Date().toISOString().split('T')[0]}.xlsx`
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Error al exportar el catálogo. Revisa la consola para más detalles.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <label className={styles.label}>
                <input 
                    type="checkbox" 
                    className={styles.checkbox}
                    checked={includeHidden} 
                    onChange={e => setIncludeHidden(e.target.checked)} 
                />
                Incluir descatalogados
            </label>
            <button 
                onClick={handleExport}
                disabled={loading}
                className={styles.button}
            >
                {loading ? 'Generando Excel...' : (
                    <>
                        Exportar Excel
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </>
                )}
            </button>
        </div>
    )
}

