'use client'

import { useState } from 'react'
import { exportCatalogAction } from '@/app/admin/actions'

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
        <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '15px', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                <input 
                    type="checkbox" 
                    checked={includeHidden} 
                    onChange={e => setIncludeHidden(e.target.checked)} 
                />
                Incluir descatalogados
            </label>
            <button 
                onClick={handleExport}
                disabled={loading}
                style={{
                    padding: '12px 24px',
                    backgroundColor: loading ? '#ccc' : '#2563eb', // Blue
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Generando Excel...' : 'Exportar Catálogo ⬇️'}
            </button>
        </div>
    )
}
