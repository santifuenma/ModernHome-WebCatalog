'use client'

import { attachDownload, detachDownload } from '@/app/admin/actions'
import { ProductDownload } from '@/features/products/product.types'

interface DownloadsManagerProps {
    productId: string
    download?: ProductDownload
}

export function DownloadsManager({ productId, download }: DownloadsManagerProps) {

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const name = (form.elements.namedItem('name') as HTMLInputElement).value
        const url = (form.elements.namedItem('url') as HTMLInputElement).value

        if (name && url) {
            await attachDownload(productId, name, url)
            form.reset()
        }
    }

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>3D Model / Download Link</h3>
            
            {download ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <a href={download.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
                        {download.name}
                    </a>
                    <button 
                        onClick={() => detachDownload(productId)}
                        style={{
                            padding: '4px 8px',
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                    <input type="text" name="name" placeholder="Name (e.g. 3D Model)" required style={{ padding: '6px' }} />
                    <input type="url" name="url" placeholder="https://link-to-file.com" required style={{ padding: '6px', width: '250px' }} />
                    <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Add Link
                    </button>
                </form>
            )}
        </div>
    )
}
