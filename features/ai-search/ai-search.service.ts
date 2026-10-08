import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { buildFilterSchema } from './ai-search.schema'
import { buildSystemPrompt, Catalog, TOOL_NAME } from './ai-search.prompt'
import { MAX_QUERY_LENGTH } from './ai-search.constants'

export { MAX_QUERY_LENGTH }
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'

export type AiSearchErrorCode =
    | 'config' | 'rate_limit' | 'timeout' | 'connection' | 'refused' | 'invalid' | 'unknown'

/** Error con un mensaje apto para mostrar al admin (sin detalles técnicos de la API). */
export class AiSearchError extends Error {
    constructor(message: string, readonly code: AiSearchErrorCode) {
        super(message)
        this.name = 'AiSearchError'
    }
}

export interface InterpretResult {
    /** Filtros tal cual los devolvió la IA. Aún NO están validados: eso lo hace el paso siguiente. */
    raw: unknown
    usage: { inputTokens: number; outputTokens: number }
}

/** Solo lo que usamos del cliente: permite inyectar uno falso en las pruebas. */
type MessagesClient = Pick<Anthropic, 'messages'>

let cachedClient: Anthropic | undefined

function getClient(): Anthropic {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new AiSearchError('La búsqueda con IA no está configurada.', 'config')
    }
    // Lee ANTHROPIC_API_KEY del entorno. 45 s de espera y un solo reintento.
    return (cachedClient ??= new Anthropic({ timeout: 45_000, maxRetries: 1 }))
}

/**
 * La IA devuelve los filtros llamando a esta herramienta. Su esquema sale del mismo
 * esquema de Zod con el que luego se validan.
 *
 * Se usa tool use y no las salidas estructuradas (output_config.format) a propósito:
 * estas obligan a escribir los campos en el orden del esquema sin poder volver atrás, y
 * cuando la frase menciona los filtros en otro orden el modelo rellenaba campos con basura.
 * En las pruebas, tool use acertó 8 de 8 frases difíciles y las salidas estructuradas fallaron.
 */
function buildTool(catalog: Catalog): Anthropic.Tool {
    const { $schema: _ignored, ...inputSchema } = z.toJSONSchema(
        buildFilterSchema(catalog.ambientes, catalog.subcategorias),
    ) as Record<string, unknown>

    return {
        name: TOOL_NAME,
        description: 'Aplica los filtros de búsqueda de productos. Llámala siempre, aunque sea sin filtros.',
        input_schema: inputSchema as Anthropic.Tool['input_schema'],
    }
}

function toAiSearchError(err: unknown): AiSearchError {
    if (err instanceof AiSearchError) return err

    // El orden importa: el timeout es un caso particular del error de conexión
    if (err instanceof Anthropic.APIConnectionTimeoutError) {
        return new AiSearchError('La IA tardó demasiado en responder. Inténtalo de nuevo.', 'timeout')
    }
    if (err instanceof Anthropic.APIConnectionError) {
        return new AiSearchError('No se pudo conectar con la IA. Inténtalo de nuevo.', 'connection')
    }
    if (err instanceof Anthropic.RateLimitError) {
        return new AiSearchError('Demasiadas búsquedas seguidas. Espera unos segundos.', 'rate_limit')
    }
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
        return new AiSearchError('La búsqueda con IA no está configurada correctamente.', 'config')
    }

    console.error('[ai-search] error inesperado:', err)
    return new AiSearchError('No se pudo completar la búsqueda con IA.', 'unknown')
}

/**
 * Manda la frase del admin a Claude y devuelve los filtros que interpreta.
 * El cliente se puede inyectar (pruebas); por defecto se crea uno con ANTHROPIC_API_KEY.
 */
export async function interpretSearch(
    text: string,
    catalog: Catalog,
    client?: MessagesClient,
): Promise<InterpretResult> {
    const query = text.trim()

    if (!query) {
        throw new AiSearchError('Escribe qué quieres buscar.', 'invalid')
    }
    if (query.length > MAX_QUERY_LENGTH) {
        throw new AiSearchError(`La búsqueda es demasiado larga (máximo ${MAX_QUERY_LENGTH} caracteres).`, 'invalid')
    }

    try {
        const response = await (client ?? getClient()).messages.create({
            model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
            max_tokens: 1000,
            system: buildSystemPrompt(catalog),
            messages: [{ role: 'user', content: query }],
            tools: [buildTool(catalog)],
        })

        if (response.stop_reason === 'refusal') {
            throw new AiSearchError('La IA no pudo procesar esta búsqueda.', 'refused')
        }
        if (response.stop_reason === 'max_tokens') {
            throw new AiSearchError('La respuesta de la IA quedó incompleta. Prueba con una frase más corta.', 'invalid')
        }

        const toolCall = response.content.find(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === TOOL_NAME,
        )
        if (!toolCall) {
            throw new AiSearchError('La IA no devolvió ningún filtro. Inténtalo de nuevo.', 'invalid')
        }

        return {
            raw: toolCall.input,
            usage: {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
            },
        }
    } catch (err) {
        throw toAiSearchError(err)
    }
}
