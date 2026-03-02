import styles from './Filtros.module.css';

export default function Filtros() {
    return (
        <div className={styles.filtros_bar}>
            <div className={styles.filtros_content}>
                <button>Sala</button>
                <button>Comedor</button>
                <button>Dormitorio</button>
                <button>Exterior</button>
                <button>Complementos</button>
            </div>
        </div>
    );
}
