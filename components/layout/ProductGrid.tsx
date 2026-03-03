import styles from './ProductGrid.module.css';
import Image from 'next/image';
import Link from 'next/link';

// Interfaz temporal para los datos del producto
interface ProductSkeleton {
    id: string;
    title: string;
    subtitle: string;
    image: string;
}

// Datos de prueba temporales basados en la imagen
const DUMMY_PRODUCTS: ProductSkeleton[] = [
    {
        id: '1',
        title: 'BOLERO',
        subtitle: 'Essenza',
        image: '/icons/dorian-novaluna.jpg' // Necesitas poner una imagen en la carpeta public
    }
    ,
    {
        id: '2',
        title: 'BOLERO',
        subtitle: 'Essenza',
        image: '/icons/dorian-novaluna.jpg' // Necesitas poner una imagen en la carpeta public
    }
    ,
    {
        id: '3',
        title: 'BOLERO',
        subtitle: 'Essenza',
        image: '/icons/dorian-novaluna.jpg' // Necesitas poner una imagen en la carpeta public
    }
    ,
    {
        id: '4',
        title: 'BOLERO',
        subtitle: 'Essenza',
        image: '/icons/dorian-novaluna.jpg' // Necesitas poner una imagen en la carpeta public
    }
    ,
    {
        id: '5',
        title: 'BOLERO',
        subtitle: 'Essenza',
        image: '/icons/dorian-novaluna.jpg' // Necesitas poner una imagen en la carpeta public
    }
    ,
];

export default function ProductGrid() {
    return (
        <section className={styles.grid_section}>
            <div className={styles.grid_container}>
                {DUMMY_PRODUCTS.map((product) => {
                    // Solo el primer producto lleva a la plantilla que creamos
                    const href = product.id === '1' ? '/catalogo/ambiente/subcategoria/producto' : '#';
                    return (
                        <Link href={href} key={product.id} passHref legacyBehavior>
                            <a className={styles.link_wrapper}>
                                <article className={styles.product_card}>
                                    <div className={styles.image_placeholder}>
                                        <Image
                                            src={product.image}
                                            alt={`Imagen de ${product.title}`}
                                            fill
                                        />
                                    </div>
                                    <div className={styles.info_container}>
                                        <h3 className={styles.product_title}>{product.title}</h3>
                                        <p className={styles.product_subtitle}>{product.subtitle}</p>
                                    </div>
                                </article>
                            </a>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
