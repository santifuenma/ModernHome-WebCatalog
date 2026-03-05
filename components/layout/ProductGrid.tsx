import styles from './ProductGrid.module.css'
import { ProductCard } from "@/features/products/product.types"
import Image from 'next/image'
import Link from 'next/link'

interface ProductGridProps {
    products: ProductCard[]
}

export default function ProductGrid({ products }: ProductGridProps) {

    return (
        <section className={styles.grid_section}>
            <div className={styles.grid_container}>

                {products.map((product) => {

                    const href = `/catalogo/${product.ambiente}/${product.subcategoria}/${product.slug}`

                    return (
                        <Link href={href} key={product.id} className={styles.link_wrapper}>
                            <article className={styles.product_card}>

                                <div className={styles.image_placeholder}>
                                    <Image
                                        src={product.image}
                                        alt={`Imagen de ${product.name}`}
                                        fill
                                    />
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