'use client'

import { useState } from 'react'
import Link from 'next/link'
import { importProductsAction } from '@/app/admin/actions'

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
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/admin" style={{ color: '#0070f3', textDecoration: 'none' }}>
                &larr; Back to Dashboard
            </Link>
            <h1 style={{ marginTop: '20px' }}>Importador de Productos</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Sube tu archivo Excel o CSV de inventario para añadir masivamente los productos a la base de datos o sincronizar su stock.
                Si un código de producto ya existe, solo se actuará si su stock ha cambiado, actualizándolo de forma segura sin sobrescribir descripciones ni imágenes.
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
                        backgroundColor: loading ? '#ccc' : '#eab308',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Importando...' : 'Iniciar Sincronización'}
                </button>
            </form>

            {error && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h2 style={{ marginTop: 0 }}>Resultados de la sincronización</h2>
                    
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '150px', padding: '15px', backgroundColor: '#dcfce7', borderRadius: '4px', border: '1px solid #bbf7d0', color: '#166534' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
                                {result.successCount}
                            </p>
                            <p style={{ fontSize: '14px', margin: 0 }}>Nuevos productos creados.</p>
                        </div>
                        
                        <div style={{ flex: 1, minWidth: '150px', padding: '15px', backgroundColor: '#fef08a', borderRadius: '4px', border: '1px solid #fde047', color: '#854d0e' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
                                {result.updatedCount}
                            </p>
                            <p style={{ fontSize: '14px', margin: 0 }}>Productos con stock actualizado.</p>
                        </div>

                        <div style={{ flex: 1, minWidth: '150px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '4px', border: '1px solid #fecaca', color: '#991b1b' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
                                {result.errorCount}
                            </p>
                            <p style={{ fontSize: '14px', margin: 0 }}>Errores detectados en la BD.</p>
                        </div>
                    </div>

                    {result.logs.length > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Registro de eventos (Logs)</h3>
                            <div style={{ 
                                backgroundColor: '#1e1e1e', 
                                color: '#d4d4d4', 
                                padding: '15px', 
                                borderRadius: '4px', 
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {result.logs.map((log, index) => (
                                    <div key={index} style={{ marginBottom: '4px' }}>&gt; {log}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
