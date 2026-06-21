import 'server-only'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb'

/**
 * DynamoDB-backed embedding cache for the RAG trip assistant.
 *
 * Embeddings are computed at runtime (lazily) and stored here keyed by trip id,
 * so we avoid a separate persistent vector DB (e.g. Chroma). Each item stores a
 * content hash so we can recompute when a trip's text changes.
 *
 * If AWS credentials / table are not configured, all helpers degrade gracefully:
 * reads return an empty cache and writes are no-ops, so the assistant still
 * works (it just re-embeds every request).
 */

export interface CachedEmbedding {
  contentHash: string
  embedding: number[]
}

const TABLE = process.env.DYNAMODB_EMBEDDINGS_TABLE?.trim() || 'trip_embeddings'

let doc: DynamoDBDocumentClient | null = null

export function isDynamoConfigured(): boolean {
  return Boolean(
    process.env.AWS_REGION?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim()
  )
}

function getDocClient(): DynamoDBDocumentClient {
  if (doc) return doc
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION?.trim(),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  })
  doc = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  })
  return doc
}

/** Fetch cached embeddings for the given trip ids (chunked into batches of 100). */
export async function getCachedEmbeddings(tripIds: string[]): Promise<Map<string, CachedEmbedding>> {
  const result = new Map<string, CachedEmbedding>()
  if (!isDynamoConfigured() || tripIds.length === 0) return result

  const client = getDocClient()
  const chunks: string[][] = []
  for (let i = 0; i < tripIds.length; i += 100) {
    chunks.push(tripIds.slice(i, i + 100))
  }

  for (const chunk of chunks) {
    try {
      const res = await client.send(
        new BatchGetCommand({
          RequestItems: {
            [TABLE]: { Keys: chunk.map((id) => ({ trip_id: id })) },
          },
        })
      )
      const items = res.Responses?.[TABLE] ?? []
      for (const item of items) {
        const tripId = String(item.trip_id)
        const contentHash = String(item.content_hash ?? '')
        const raw = item.embedding
        const embedding: number[] =
          typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? (raw as number[]) : []
        if (embedding.length > 0) {
          result.set(tripId, { contentHash, embedding })
        }
      }
    } catch {
      // Cache miss on error — caller will recompute. Do not fail the request.
    }
  }

  return result
}

/** Store/refresh a trip's embedding. No-op when DynamoDB is not configured. */
export async function putEmbedding(
  tripId: string,
  contentHash: string,
  embedding: number[],
  model: string
): Promise<void> {
  if (!isDynamoConfigured()) return
  try {
    const client = getDocClient()
    await client.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          trip_id: tripId,
          content_hash: contentHash,
          // Store as JSON string to preserve float precision and avoid large
          // attribute marshalling overhead.
          embedding: JSON.stringify(embedding),
          model,
          updated_at: new Date().toISOString(),
        },
      })
    )
  } catch {
    // Best-effort cache; ignore write failures.
  }
}
