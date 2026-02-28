import { CldImage } from '@/components/ui/cld-image'

export default function TestCloudinaryPage() {
    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Prueba de Conexión a Cloudinary</h1>
            <p style={{ marginTop: '1rem', color: '#666' }}>
                Intentando renderizar una imagen de muestra predeterminada de Cloudinary:
            </p>

            <div style={{ marginTop: '2rem', border: '1px dashed #ccc', padding: '1rem', display: 'inline-block' }}>
                {/* Usamos el ID de imagen "cld-sample-5" que viene por defecto en todas las cuentas nuevas */}
                <CldImage
                    src="2_lphwzd"
                    width="500"
                    height="500"
                    crop={{
                        type: 'auto',
                        source: true
                    }}
                    alt="Imagen de prueba de Cloudinary"
                />
            </div>
        </div>
    )
}
