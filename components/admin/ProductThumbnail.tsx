'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { enlargeImageUrl } from '@/features/products/image-url'
import styles from './ProductThumbnail.module.css'

// ─────────────────────────────────────────────────────────────────
// ProductThumbnail
// Miniatura de la tabla de productos. Al pulsarla se abre un visor con la
// imagen ampliada, el nombre del producto y un enlace para editarlo.
// Se cierra con Escape, con la X o pulsando fuera de la imagen.
// ─────────────────────────────────────────────────────────────────

interface ProductThumbnailProps {
    src: string
    name: string
    /** Código corto que se muestra en la tabla. */
    code: string
    brand: string
    editHref: string
}

export function ProductThumbnail({ src, name, code, brand, editHref }: ProductThumbnailProps) {
    const [open, setOpen] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [largeFailed, setLargeFailed] = useState(false)
    const [imageError, setImageError] = useState(false)

    const thumbRef = useRef<HTMLButtonElement>(null)
    const dialogRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const titleId = useId()

    const close = useCallback(() => {
        setOpen(false)
        thumbRef.current?.focus() // el foco vuelve a la miniatura
    }, [])

    function openViewer() {
        setLoaded(false)
        setLargeFailed(false)
        setImageError(false)
        setOpen(true)
    }

    useEffect(() => {
        if (!open) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden' // la página de detrás no se desplaza
        closeRef.current?.focus()

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                close()
                return
            }
            if (e.key !== 'Tab' || !dialogRef.current) return

            // El foco no sale del visor mientras está abierto
            const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]')
            if (focusable.length === 0) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open, close])

    return (
        <>
            <button
                ref={thumbRef}
                type="button"
                className={styles.thumb}
                onClick={openViewer}
                aria-label={`Ampliar imagen de ${name}`}
                aria-haspopup="dialog"
            >
                <img src={src} alt="" className={styles.thumbImage} />
            </button>

            {open && createPortal(
                <div className={styles.backdrop} onClick={close}>
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        className={styles.dialog}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            ref={closeRef}
                            type="button"
                            className={styles.closeButton}
                            onClick={close}
                            aria-label="Cerrar"
                        >
                            ×
                        </button>

                        <div className={styles.imageArea}>
                            {imageError ? (
                                <p className={styles.imageError} role="alert">No se pudo cargar la imagen.</p>
                            ) : (
                                <>
                                    {!loaded && <span className={styles.spinner} role="status" aria-label="Cargando imagen" />}
                                    <img
                                        src={largeFailed ? src : enlargeImageUrl(src)}
                                        alt={name}
                                        className={`${styles.largeImage} ${loaded ? styles.largeImageLoaded : ''}`}
                                        onLoad={() => setLoaded(true)}
                                        onError={() => {
                                            // Si la versión redimensionada falla, se prueba con la original;
                                            // si también falla (o no había versión ampliada), se avisa
                                            if (!largeFailed && enlargeImageUrl(src) !== src) setLargeFailed(true)
                                            else setImageError(true)
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <div className={styles.caption}>
                            <div className={styles.captionText}>
                                <h2 id={titleId} className={styles.title}>{name}</h2>
                                <p className={styles.meta}>
                                    {[code, brand].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                            <Link href={editHref} className={styles.editLink}>
                                Editar producto
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </>
    )
}
