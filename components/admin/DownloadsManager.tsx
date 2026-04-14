'use client'

import { attachDownload, detachDownload } from '@/app/admin/actions'
import { ProductDownload } from '@/features/products/product.types'
import styles from './ProductForm.module.css'

interface DownloadsManagerProps {
    productId: string
    download?: ProductDownload
}

export function DownloadsManager({ productId, download }: DownloadsManagerProps) {

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const url = (form.elements.namedItem('url') as HTMLInputElement).value

        if (url) {
            await attachDownload(productId, 'Descargar modelo 3D', url)
            form.reset()
        }
    }

    return (
        <div>
            {download ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <a
                        href={download.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                    >
                        {download.name}
                    </a>
                    <button
                        onClick={() => detachDownload(productId)}
                        className={styles.btnDanger}
                    >
                        Eliminar
                    </button>
                </div>
            ) : (
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="url"
                        name="url"
                        placeholder="https://enlace-al-archivo.com"
                        required
                        className={styles.input}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className={styles.btnOutline}>
                        Agregar enlace
                    </button>
                </form>
            )}
        </div>
    )
}
