// Iconos de la cabecera de búsqueda del panel. Heredan el color del texto (currentColor).

interface IconProps {
    size?: number
}

export function SparkleIcon({ size = 14 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
        </svg>
    )
}

export function SearchIcon({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
    )
}

export function SlidersIcon({ size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="17" x2="20" y2="17" />
            <circle cx="9" cy="7" r="2.2" fill="#fff" />
            <circle cx="15" cy="17" r="2.2" fill="#fff" />
        </svg>
    )
}

export function ChevronIcon({ size = 14, up = false }: IconProps & { up?: boolean }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points={up ? '6 15 12 9 18 15' : '6 9 12 15 18 9'} />
        </svg>
    )
}

export function InfoIcon({ size = 15 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="11" x2="12" y2="16" />
            <circle cx="12" cy="8" r="0.6" fill="currentColor" />
        </svg>
    )
}
