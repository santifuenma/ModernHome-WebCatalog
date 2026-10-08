/**
 * rate-limit.ts
 * Limitador de peticiones por ventana deslizante, en memoria.
 *
 * Es una red de seguridad contra errores (un bucle, un doble clic) y no una defensa
 * perfecta: en un despliegue serverless cada instancia tiene su propia memoria, así que
 * el límite real puede ser algo mayor. Para un panel interno es suficiente.
 */

export interface RateLimiterOptions {
    /** Peticiones permitidas por ventana. */
    limit: number
    windowMs: number
    /** Reloj inyectable (pruebas). */
    now?: () => number
}

export interface RateLimitResult {
    allowed: boolean
    /** Segundos hasta poder volver a intentarlo (0 si está permitido). */
    retryAfterSec: number
}

const PRUNE_THRESHOLD = 1000

export function createRateLimiter({ limit, windowMs, now = Date.now }: RateLimiterOptions) {
    const hits = new Map<string, number[]>()

    return {
        /** Registra un intento de `key` y dice si se permite. Solo cuentan los intentos permitidos. */
        check(key: string): RateLimitResult {
            const t = now()
            const recent = (hits.get(key) ?? []).filter(time => t - time < windowMs)

            if (recent.length >= limit) {
                hits.set(key, recent)
                return { allowed: false, retryAfterSec: Math.ceil((recent[0] + windowMs - t) / 1000) }
            }

            recent.push(t)
            hits.set(key, recent)

            // Evita que el mapa crezca sin límite si pasan muchas claves distintas
            if (hits.size > PRUNE_THRESHOLD) {
                for (const [k, times] of hits) {
                    if (times.every(time => t - time >= windowMs)) hits.delete(k)
                }
            }

            return { allowed: true, retryAfterSec: 0 }
        },
    }
}
