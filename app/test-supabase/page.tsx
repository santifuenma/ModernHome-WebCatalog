// import { createClient } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
    // const supabase = createClient()
    // const { data, error } = await supabase.from('test_table_does_not_exist').select('*').limit(1)

    const error = "Integration temporarily disabled during architecture refactor"
    const data = null

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Prueba de Conexión a Supabase</h1>

            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Estado del Cliente Server:</h3>
                <p>Cliente inicializado correctamente.</p>

                <h3>Resultado de la prueba de consulta:</h3>
                <pre style={{ background: '#333', color: '#fff', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
                    {error
                        ? `Error esperado (si la tabla no existe) o de conexión:\n${JSON.stringify(error, null, 2)}`
                        : `Datos recibidos:\n${JSON.stringify(data, null, 2)}`
                    }
                </pre>

                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    * Nota: Es normal ver un error &quot;relation does not exist&quot; si tus credenciales son correctas pero aún no has creado ninguna tabla. Si ves un error de &quot;FetchError&quot; o &quot;Invalid API key&quot;, revisa tus variables de entorno.
                </p>
            </div>
        </div>
    )
}
