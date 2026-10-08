import { describe, it, expect } from 'vitest'
import { createRateLimiter } from './rate-limit'

function setup(limit = 3, windowMs = 60_000) {
    let time = 1_000_000
    const limiter = createRateLimiter({ limit, windowMs, now: () => time })
    return { limiter, advance: (ms: number) => { time += ms } }
}

describe('createRateLimiter', () => {
    it('permite hasta el límite y bloquea el siguiente', () => {
        const { limiter } = setup(3)
        expect(limiter.check('a').allowed).toBe(true)
        expect(limiter.check('a').allowed).toBe(true)
        expect(limiter.check('a').allowed).toBe(true)
        expect(limiter.check('a').allowed).toBe(false)
    })

    it('cuenta cada clave por separado', () => {
        const { limiter } = setup(1)
        expect(limiter.check('a').allowed).toBe(true)
        expect(limiter.check('b').allowed).toBe(true)
        expect(limiter.check('a').allowed).toBe(false)
    })

    it('indica cuántos segundos faltan para poder reintentar', () => {
        const { limiter, advance } = setup(1, 60_000)
        limiter.check('a')
        advance(20_000)
        expect(limiter.check('a')).toEqual({ allowed: false, retryAfterSec: 40 })
    })

    it('vuelve a permitir cuando pasa la ventana', () => {
        const { limiter, advance } = setup(1, 60_000)
        limiter.check('a')
        advance(60_000)
        expect(limiter.check('a')).toEqual({ allowed: true, retryAfterSec: 0 })
    })

    it('los intentos bloqueados no alargan el bloqueo', () => {
        const { limiter, advance } = setup(1, 60_000)
        limiter.check('a')
        advance(30_000)
        limiter.check('a') // bloqueado
        advance(30_000)
        expect(limiter.check('a').allowed).toBe(true)
    })

    it('la ventana es deslizante: libera los intentos antiguos de uno en uno', () => {
        const { limiter, advance } = setup(2, 60_000)
        limiter.check('a')          // t = 0
        advance(40_000)
        limiter.check('a')          // t = 40 s
        advance(25_000)             // t = 65 s: el primero ya salió de la ventana
        expect(limiter.check('a').allowed).toBe(true)
        expect(limiter.check('a').allowed).toBe(false)
    })
})
