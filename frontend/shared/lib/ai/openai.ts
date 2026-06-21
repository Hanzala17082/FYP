import 'server-only'
import OpenAI from 'openai'

/**
 * Server-only Gemini helpers for the RAG trip assistant.
 *
 * - Chat: Gemini OpenAI-compatible endpoint.
 * - Embeddings: native Gemini REST (OpenAI-compat does not expose embedding models).
 */

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/'
const GEMINI_REST_BASE = 'https://generativelanguage.googleapis.com/v1beta'

let client: OpenAI | null = null

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment (.env.local).')
  }
  return apiKey
}

export function getOpenAIClient(): OpenAI {
  if (client) return client
  client = new OpenAI({ apiKey: getApiKey(), baseURL: GEMINI_BASE_URL })
  return client
}

export const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL?.trim() || 'gemini-embedding-001'
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL?.trim() || 'gemini-2.5-flash'

type EmbedTask = 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT'

async function embedOneNative(text: string, taskType: EmbedTask): Promise<number[]> {
  const url = `${GEMINI_REST_BASE}/models/${EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(getApiKey())}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      taskType,
    }),
  })
  const body = (await res.json().catch(() => ({}))) as {
    embedding?: { values?: number[] }
    error?: { message?: string }
  }
  if (!res.ok) {
    throw new Error(body.error?.message || `Embedding request failed (${res.status}).`)
  }
  const values = body.embedding?.values
  if (!values?.length) throw new Error('Embedding response missing vector values.')
  return values
}

async function embedBatchNative(texts: string[], taskType: EmbedTask): Promise<number[][]> {
  if (texts.length === 0) return []
  if (texts.length === 1) return [await embedOneNative(texts[0], taskType)]

  const url = `${GEMINI_REST_BASE}/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${encodeURIComponent(getApiKey())}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        taskType,
      })),
    }),
  })
  const body = (await res.json().catch(() => ({}))) as {
    embeddings?: Array<{ values?: number[] }>
    error?: { message?: string }
  }
  if (!res.ok) {
    throw new Error(body.error?.message || `Batch embedding request failed (${res.status}).`)
  }
  const rows = body.embeddings ?? []
  if (rows.length !== texts.length) {
    throw new Error('Batch embedding returned an unexpected number of vectors.')
  }
  return rows.map((row) => {
    const values = row.values
    if (!values?.length) throw new Error('Embedding response missing vector values.')
    return values
  })
}

/** Embed a user query (retrieval query task). */
export async function embedText(text: string): Promise<number[]> {
  return embedOneNative(text, 'RETRIEVAL_QUERY')
}

/** Embed trip documents for retrieval (batched, chunked to avoid huge payloads). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const CHUNK = 50
  const out: number[][] = []
  for (let i = 0; i < texts.length; i += CHUNK) {
    const chunk = texts.slice(i, i + CHUNK)
    const vecs = await embedBatchNative(chunk, 'RETRIEVAL_DOCUMENT')
    out.push(...vecs)
  }
  return out
}

export interface ChatTurn {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Run a chat completion and return the assistant text. */
export async function chatComplete(messages: ChatTurn[]): Promise<string> {
  const openai = getOpenAIClient()
  const res = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.2,
    max_tokens: 600,
  })
  return res.choices[0]?.message?.content?.trim() || ''
}
