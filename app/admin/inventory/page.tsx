'use client'

import { useState } from 'react'
import Link from 'next/link'
import { compareInventoryAction } from '@/app/admin/actions'

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
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
                &larr; Back to Dashboard
            </Link>
            <h1 style={{ marginTop: '20px' }}>Comparador de Inventario</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Sube tu nuevo archivo Excel de inventario. Lo compararemos con la base de datos actual (solo productos activos) basándonos en la columna "Código". Obtendrás dos archivos Excel de vuelta: uno con los productos nuevos y otro con los que ya no están.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <input 
                    type="file" 
                    name="file" 
                    accept=".xlsx, .xls, .csv" 
                    required
                    style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '4px' }}
                />
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        padding: '12px',
                        backgroundColor: loading ? '#ccc' : '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Procesando comparación...' : 'Comparar Inventario'}
                </button>
            </form>

            {error && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h2 style={{ marginTop: 0 }}>Resultados</h2>
                    
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #eee' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                                <strong>{result.newCount}</strong> Productos Nuevos
                            </p>
                            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>Están en el Excel que has subido, pero no en tu base de datos M.H.</p>
                            <button 
                                onClick={() => handleDownload(result.newProductsBase64, 'modern-home-NUEVOS.xlsx')}
                                style={downloadBtnStyle}
                            >
                                📥 Descargar Nuevos
                            </button>
                        </div>

                        <div style={{ flex: 1, minWidth: '250px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #eee' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                                <strong>{result.oldCount}</strong> Productos Antiguos
                            </p>
                            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>Están en tu web M.H, pero ya no figuran en el último Excel que has subido.</p>
                            <button 
                                onClick={() => handleDownload(result.oldProductsBase64, 'modern-home-PARA-BORRAR.xlsx')}
                                style={downloadBtnStyle}
                            >
                                📥 Descargar Antiguos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const downloadBtnStyle = {
    padding: '10px 15px',
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold'
}
