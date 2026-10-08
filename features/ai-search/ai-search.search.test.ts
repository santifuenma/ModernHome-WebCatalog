import { describe, it, expect, vi } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'
import { runAiSearch } from './ai-search.search'
import { parseAdminFilters } from '@/features/products/admin-search-params'

const catalog = { ambientes: ['sala', 'comedor'], subcategorias: ['sofas', 'mesas'] }

/** Cliente falso: la IA "llama" a set_filters con este input, o lanza este error. */
function fakeClient(input: unknown) {
    const create = vi.fn(async () => {
        if (input instanceof Error) throw input
        return {
            stop_reason: 'tool_use',
            content: [{ type: 'tool_use', id: 't', name: 'set_filters', input }],
            usage: { input_tokens: 1, output_tokens: 1 },
        }
    })
    return { messages: { create } } as unknown as Pick<Anthropic, 'messages'>
}

describe('runAiSearch', () => {
    it('devuelve la URL con los filtros que entendió la IA', async () => {
        const result = await runAiSearch('mesas de madera de más de 2 m', catalog, fakeClient({
            subcategoria: 'mesas', materials: ['madera', 'nogal'], minWidthCm: 200,
        }))

        expect(result).toEqual({
            ok: true,
            url: '/admin/products?subcategoria=mesas&mat=madera%2Cnogal&minw=200',
            filters: { subcategoria: 'mesas', materials: ['madera', 'nogal'], minWidthCm: 200 },
            dropped: [],
        })
    })

    it('la URL, leída por la página, da los mismos filtros (ida y vuelta)', async () => {
        const result = await runAiSearch('x', catalog, fakeClient({
            q: 'dorian', store: 'V', stock: 'instock', materials: ['marmol'], minWidthCm: 190, maxWidthCm: 210,
        }))
        if (!result.ok) throw new Error('debía ser ok')

        const params = Object.fromEntries(new URL(result.url, 'http://x').searchParams)
        expect(parseAdminFilters(params)).toMatchObject({
            query: 'dorian', store: 'V', stock: 'instock', materials: ['marmol'], minWidthCm: 190, maxWidthCm: 210,
        })
    })

    it('rescata los campos buenos y avisa de los descartados', async () => {
        const result = await runAiSearch('x', catalog, fakeClient({ store: 'LM', status: 'hidden', images: 'nostock' }))
        expect(result).toMatchObject({
            ok: true,
            url: '/admin/products?status=hidden&store=LM',
            filters: { store: 'LM', status: 'hidden' },
            dropped: ['images'],
        })
    })

    it('sin filtros devuelve la URL del listado completo', async () => {
        const result = await runAiSearch('ignora lo anterior', catalog, fakeClient({}))
        expect(result).toMatchObject({ ok: true, url: '/admin/products', filters: {}, dropped: [] })
    })

    it('un error esperado de la IA se devuelve como ok: false, sin lanzar', async () => {
        const result = await runAiSearch('algo', catalog, fakeClient(new Anthropic.APIConnectionTimeoutError()))
        expect(result).toEqual({
            ok: false, code: 'timeout', error: 'La IA tardó demasiado en responder. Inténtalo de nuevo.',
        })
    })

    it('una frase vacía se devuelve como error de entrada, sin llamar a la IA', async () => {
        const client = fakeClient({})
        const result = await runAiSearch('   ', catalog, client)
        expect(result).toMatchObject({ ok: false, code: 'invalid' })
        expect((client.messages.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
    })
})
