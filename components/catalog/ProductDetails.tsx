'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Product } from '@/features/products/product.types'
import styles from './ProductDetails.module.css'

interface ProductDetailsProps {
    product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const router = useRouter()

    const images = product.images ?? []
    const mainImage = images.find(img => img.isMain)?.url || images[0]?.url || ''

    const [selectedImage, setSelectedImage] = useState(mainImage)

    return (
        <div className={styles.container}>
            <div className={styles.backButtonContainer}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                            fill="currentColor"
                        />
                    </svg>
                    Atrás
                </button>
            </div>

            <div className={styles.productContentContainer}>

                <div className={styles.productImagesContainer}>
                    {/* IMAGEN PRINCIPAL */}
                    <div className={styles.mainImageContainer}>
                        <div className={styles.mainImageWrapper} key={selectedImage}>
                            {selectedImage && (
                                <Image
                                    src={selectedImage}
                                    alt={product.name}
                                    fill
                                    className={styles.image}
                                />
                            )}
                        </div>
                    </div>
                    {/* MINIATURAS */}
                    <div className={styles.thumbnailsContainer}>
                        {images
                            .filter(img => img.url !== selectedImage)
                            .map((img, index) => (
                                <div key={index} className={styles.thumbnailWrapper} onClick={() => setSelectedImage(img.url)}>
                                    <Image
                                        src={img.url}
                                        alt={img.alt || `${product.name} imagen ${index + 1}`}
                                        width={200}
                                        height={200}
                                        className={styles.image}
                                    />
                                </div>
                            ))}
                    </div>
                </div>

                {/* DETALLES */}
                <div className={styles.productDetailsContainer}>

                    <div className={styles.productHeader}>
                        <h1 className={styles.title}>{product.name}</h1>

                        <p className={styles.subtitle}>
                            {product.brand}
                            {product.designer && ` · ${product.designer}`}
                        </p>
                    </div>

                    <div className={styles.divider} />

                    {/* DIMENSIONES */}
                    <div className={styles.productInfoContainer}>

                        <div className={styles.productInfoDimensions}>
                            <h3 className={styles.sectionTitle}>Dimensiones</h3>
                            {product.dimensions.map((dim, index) => (
                                <p key={index} className={styles.textLine}>
                                    {dim}
                                </p>
                            ))}
                        </div>

                        {/* MATERIALES */}
                        <div className={styles.productInfoMaterials}>
                            <h3 className={styles.sectionTitle}>Materiales</h3>
                            {product.materials.map((mat, index) => (
                                <p key={index} className={styles.textLine}>
                                    {mat}
                                </p>
                            ))}
                        </div>

                    </div>

                    <div className={styles.productMaterialsContainer}>
                        {/* SWATCHES */}
                        {product.materialSwatches && product.materialSwatches.length > 0 && (
                            <div className={styles.swatches}>
                                {product.materialSwatches.map((swatch, index) => (
                                    <div key={index} className={styles.swatch}>
                                        <Image
                                            src={swatch.image}
                                            alt={swatch.name || `material ${index + 1}`}
                                            fill
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.productDownloadContainer}>
                        {/* DESCARGA */}
                        {product.download && (
                            <a
                                href={product.download.url}
                                target="_blank"
                                className={styles.downloadButton}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {product.download.name}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}