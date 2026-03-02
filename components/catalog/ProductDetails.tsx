'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './ProductDetails.module.css';

export default function ProductDetails() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => router.back()}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
                        fill="currentColor"
                    />
                </svg>
                Atrás
            </button>

            <div className={styles.content}>
                <div className={styles.mainImageContainer}>
                    <div className={styles.mainImageWrapper}>
                        <Image
                            src="/icons/dorian-novaluna.jpg"
                            alt="Cama Dorian"
                            fill
                            className={styles.image}
                        />
                    </div>
                </div>

                <div className={styles.thumbnails}>
                    <div className={styles.thumbnailContainer}>
                        <div className={styles.thumbnailWrapper}>
                            <Image
                                src="/icons/dorian-novaluna.jpg"
                                alt="Cama Dorian miniatura 1"
                                fill
                                className={styles.image}
                            />
                        </div>
                    </div>
                    <div className={styles.thumbnailContainer}>
                        <div className={styles.thumbnailWrapper}>
                            <Image
                                src="/icons/dorian-novaluna.jpg"
                                alt="Cama Dorian miniatura 2"
                                fill
                                className={styles.image}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.details}>
                    <h1 className={styles.title}>DORIAN</h1>
                    <p className={styles.subtitle}>Novaluna</p>
                    <hr className={styles.divider} />

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Dimensiones</h3>
                        <p className={styles.textLine}>Ancho: 178 cm</p>
                        <p className={styles.textLine}>Largo: 215 cm</p>
                        <p className={styles.textLine}>Altura cabecero: 95 cm</p>
                        <p className={styles.textLine}>Altura base: 35 cm</p>
                        <p className={styles.textLine}>Tamaño King</p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Materiales</h3>
                        <p className={styles.textLine}>Tapizado textil o semipiel seleccionable</p>
                        <p className={styles.textLine}>Estructura acolchada</p>
                        <p className={styles.textLine}>Patas metálicas</p>
                    </div>

                    <div className={styles.swatches}>
                        <div className={`${styles.swatch} ${styles.blueSwatch}`}></div>
                        <div className={`${styles.swatch} ${styles.greySwatch}`}></div>
                    </div>

                    <hr className={styles.divider} />

                    <button className={styles.downloadButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Descargar modelo 3D
                    </button>
                </div>
            </div>
        </div>
    );
}
