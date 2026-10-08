import { describe, it, expect, vi } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'
import { interpretSearch, AiSearchError, MAX_QUERY_LENGTH } from './ai-search.service'
import { buildSystemPrompt } from './ai-search.prompt'

const catalog = { ambientes: ['sala', 'comedor'], subcategorias: ['sofas', 'mesas'] }

/** Cliente falso: devuelve lo que le pidamos, sin llamar a la API. */
function fakeClient(result: unknown) {
    const create = vi.fn(async () => {
        if (result instanceof Error) throw result
        return result
    })
    return { client: { messages: { create } } as unknown as Pick<Anthropic, 'messages'>, create }
}

function reply(text: string, stop_reason = 'end_turn') {
    return {
        stop_reason,
        content: [{ type: 'text', text }],
        usage: { input_tokens: 800, output_tokens: 40 },
    }
}

async function codeOf(promise: Promise<unknown>) {
    try {
        await promise
    } catch (err) {
        expect(err).toBeInstanceOf(AiSearchError)
        return (err as AiSearchError).code
    }
    throw new Error('Se esperaba un error y no hubo ninguno')
}

describe('interpretSearch: respuesta correcta', () => {
    it('devuelve el JSON de la IA y el uso de tokens', async () => {
        const { client } = fakeClient(reply('{"subcategoria":"mesas","materials":["madera"]}'))
        const result = await interpretSearch('mesas de madera', catalog, client)
        expect(result.raw).toEqual({ subcategoria: 'mesas', materials: ['madera'] })
        expect(result.usage).toEqual({ inputTokens: 800, outputTokens: 40 })
    })

    it('envía la frase recortada, el prompt con el catálogo y el esquema', async () => {
        const { client, create } = fakeClient(reply('{}'))
        await interpretSearch('  sofás en Valencia  ', catalog, client)

        const params = (create.mock.calls[0] as unknown[])[0] as {
            system: string
            messages: { role: string; content: string }[]
            output_config: { format: { type: string } }
            max_tokens: number
        }
        expect(params.messages).toEqual([{ role: 'user', content: 'sofás en Valencia' }])
        expect(params.system).toBe(buildSystemPrompt(catalog))
        expect(params.output_config.format.type).toBe('json_schema')
        expect(params.max_tokens).toBeLessThanOrEqual(1000)
    })
})

describe('interpretSearch: entrada inválida (no llega a llamar a la API)', () => {
    it('rechaza una frase vacía o en blanco', async () => {
        const { client, create } = fakeClient(reply('{}'))
        expect(await codeOf(interpretSearch('', catalog, client))).toBe('invalid')
        expect(await codeOf(interpretSearch('   ', catalog, client))).toBe('invalid')
        expect(create).not.toHaveBeenCalled()
    })

    it('rechaza una frase demasiado larga', async () => {
        const { client, create } = fakeClient(reply('{}'))
        expect(await codeOf(interpretSearch('x'.repeat(MAX_QUERY_LENGTH + 1), catalog, client))).toBe('invalid')
        expect(create).not.toHaveBeenCalled()
    })

    it('acepta una frase justo en el límite', async () => {
        const { client } = fakeClient(reply('{}'))
        await expect(interpretSearch('x'.repeat(MAX_QUERY_LENGTH), catalog, client)).resolves.toBeDefined()
    })
})

describe('interpretSearch: respuestas anómalas de la IA', () => {
    it('refusal → refused', async () => {
        const { client } = fakeClient(reply('', 'refusal'))
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('refused')
    })

    it('max_tokens → invalid', async () => {
        const { client } = fakeClient(reply('{"a"', 'max_tokens'))
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('invalid')
    })

    it('texto que no es JSON → invalid', async () => {
        const { client } = fakeClient(reply('lo siento, no sé'))
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('invalid')
    })

    it('respuesta sin bloque de texto → invalid', async () => {
        const { client } = fakeClient({ stop_reason: 'end_turn', content: [], usage: { input_tokens: 1, output_tokens: 0 } })
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('invalid')
    })
})

describe('interpretSearch: errores de la API → códigos propios', () => {
    it('timeout', async () => {
        const { client } = fakeClient(new Anthropic.APIConnectionTimeoutError())
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('timeout')
    })

    it('fallo de conexión', async () => {
        const { client } = fakeClient(new Anthropic.APIConnectionError({ message: 'sin red' }))
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('connection')
    })

    it('límite de tasa (429)', async () => {
        const { client } = fakeClient(Anthropic.APIError.generate(429, {}, 'too many', new Headers()))
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('rate_limit')
    })

    it('clave inválida (401)', async () => {
        const { client } = fakeClient(Anthropic.APIError.generate(401, {}, 'bad key', new Headers()))
        expect(await codeOf(interpretSearch('algo', catalog, client))).toBe('config')
    })

    it('error desconocido: mensaje genérico, sin filtrar detalles', async () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { client } = fakeClient(new Error('detalle interno secreto'))
        try {
            await interpretSearch('algo', catalog, client)
            throw new Error('debía fallar')
        } catch (err) {
            expect((err as AiSearchError).code).toBe('unknown')
            expect((err as AiSearchError).message).not.toMatch(/secreto/)
        }
        spy.mockRestore()
    })
})

describe('buildSystemPrompt', () => {
    it('incluye los ambientes, las subcategorías y las tiendas', () => {
        const prompt = buildSystemPrompt(catalog)
        expect(prompt).toContain('sala, comedor')
        expect(prompt).toContain('sofas, mesas')
        expect(prompt).toContain('V = Valencia')
    })

    it('indica que la frase no son instrucciones', () => {
        expect(buildSystemPrompt(catalog)).toMatch(/no instrucciones/)
    })
})
