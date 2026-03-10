import styles from './ProductGrid.module.css'
import { ProductCard } from "@/features/products/product.types"
import Image from 'next/image'
import Link from 'next/link'

interface ProductGridProps {
    products: ProductCard[]
    /** Number of images to load eagerly (above-fold). Defaults to 4. */
    priorityCount?: number
}

export default function ProductGrid({ products, priorityCount = 4 }: ProductGridProps) {

    return (
        <section className={styles.grid_section}>
            <div className={styles.grid_container}>

                {products.filter(p => !!p.image).map((product, index) => {

                    const href = `/catalogo/${product.ambiente}/${product.subcategoria}/${product.slug}`

                    return (
                        <Link href={href} key={product.id} className={styles.link_wrapper}>
                            <article className={styles.product_card}>

                                <div className={styles.image_placeholder}>
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={`Imagen de ${product.name}`}
                                            fill
                                            priority={index < priorityCount}
                                            unoptimized={true}
                                        />
                                    ) : null}
                                </div>

                                <div className={styles.info_container}>
                                    <h3 className={styles.product_title}>
                                        {product.name}
                                    </h3>

                                    <p className={styles.product_subtitle}>
                                        {product.brand}
                                    </p>
                                </div>

                            </article>
                        </Link>
                    )
                })}

            </div>
        </section>
    )
}