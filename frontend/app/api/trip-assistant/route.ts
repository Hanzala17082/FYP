import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { mapTripRow } from '@/shared/lib/supabase/mappers'
import { embedText, embedTexts, chatComplete, EMBEDDING_MODEL, type ChatTurn } from '@/shared/lib/ai/openai'
import { getCachedEmbeddings, putEmbedding } from '@/shared/lib/ai/dynamo'
import { cosineSimilarity } from '@/shared/lib/ai/cosine'
import type { TripDTO } from '@/types/api/trips.types'

const SELECT_LIST = '*, agency:agencies(*, users(avatar_url))'
const MAX_MESSAGE_LEN = 500
const MAX_TRIPS = 200
const TOP_K = 6

/** Build the text we embed + show the model for one trip. */
function tripText(t: TripDTO): string {
  const parts = [
    `Title: ${t.title}`,
    `Destination: ${t.destination}`,
    `Price: PKR ${Math.round(t.price)}`,
    `Dates: ${t.startDate} to ${t.endDate}`,
    `Duration: ${t.duration} days`,
    t.tags?.length ? `Tags: ${t.tags.join(', ')}` : '',
    `Agency: ${t.agency?.name ?? ''}`,
    t.shortDescription ? `Summary: ${t.shortDescription}` : '',
  ]
  return parts.filter(Boolean).join('\n')
}

function contentHash(text: string): string {
  return createHash('sha256').update(`${EMBEDDING_MODEL}:${text}`).digest('hex')
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: 'The trip assistant is not configured yet (missing GEMINI_API_KEY).' },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const message = String(body.message ?? '').trim()
    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }
    if (message.length > MAX_MESSAGE_LEN) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MESSAGE_LEN} characters).` },
        { status: 400 }
      )
    }

    const history: ChatTurn[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (t: unknown): t is ChatTurn =>
              !!t &&
              typeof (t as ChatTurn).content === 'string' &&
              ((t as ChatTurn).role === 'user' || (t as ChatTurn).role === 'assistant')
          )
          .slice(-6)
      : []

    // 1. Load active trips (admin client bypasses RLS for server-side retrieval).
    const admin = createAdminSupabaseClient()
    const { data, error } = await admin
      .from('trips')
      .select(SELECT_LIST)
      .eq('status', 'active')
      .limit(MAX_TRIPS)

    if (error) {
      return NextResponse.json({ error: 'Failed to load trips.' }, { status: 500 })
    }

    const trips = ((data ?? []) as Record<string, unknown>[]).map((r) => mapTripRow(r, false))
    if (trips.length === 0) {
      return NextResponse.json({
        ok: true,
        data: { reply: 'There are no active trips available right now. Please check back soon!', suggestedTrips: [] },
      })
    }

    // 2. Ensure each trip has a current embedding (runtime cache in DynamoDB).
    const texts = trips.map(tripText)
    const hashes = texts.map(contentHash)
    const cached = await getCachedEmbeddings(trips.map((t) => t.id))

    const toEmbedIdx: number[] = []
    trips.forEach((t, i) => {
      const hit = cached.get(t.id)
      if (!hit || hit.contentHash !== hashes[i]) toEmbedIdx.push(i)
    })

    const embeddings: number[][] = new Array(trips.length)
    trips.forEach((t, i) => {
      const hit = cached.get(t.id)
      if (hit && hit.contentHash === hashes[i]) embeddings[i] = hit.embedding
    })

    if (toEmbedIdx.length > 0) {
      const fresh = await embedTexts(toEmbedIdx.map((i) => texts[i]))
      await Promise.all(
        toEmbedIdx.map(async (i, k) => {
          embeddings[i] = fresh[k]
          await putEmbedding(trips[i].id, hashes[i], fresh[k], EMBEDDING_MODEL)
        })
      )
    }

    // 3. Embed the query and rank trips by cosine similarity.
    const queryVec = await embedText(message)
    const ranked = trips
      .map((t, i) => ({ trip: t, score: embeddings[i] ? cosineSimilarity(queryVec, embeddings[i]) : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K)

    // 4. Build the prompt with retrieved trip facts and ask the LLM.
    const context = ranked
      .map((r, idx) => `[Trip ${idx + 1}]\n${tripText(r.trip)}`)
      .join('\n\n')

    const system: ChatTurn = {
      role: 'system',
      content: [
        'You are Tripster Assistant, a helpful travel concierge for a trip-booking platform.',
        'Answer ONLY using the trips provided in the context below. Do not invent trips, prices, or dates.',
        'Act like a smart filter: when the user mentions a budget, date range, destination, or duration, recommend the matching trips and briefly explain why they fit.',
        'All prices are in Pakistani Rupees (PKR). Be concise and friendly. Use short paragraphs or bullet points.',
        'If no trip matches the request, say so clearly and suggest the closest alternatives from the context.',
        '',
        'AVAILABLE TRIPS:',
        context,
      ].join('\n'),
    }

    const reply = await chatComplete([system, ...history, { role: 'user', content: message }])

    return NextResponse.json({
      ok: true,
      data: {
        reply: reply || 'Sorry, I could not generate a response. Please try rephrasing.',
        suggestedTrips: ranked
          .filter((r) => r.score > 0.15)
          .map((r) => ({
            slug: r.trip.slug,
            title: r.trip.title,
            destination: r.trip.destination,
            price: r.trip.price,
            startDate: r.trip.startDate,
            endDate: r.trip.endDate,
          })),
      },
    })
  } catch (e) {
    const messageText = e instanceof Error ? e.message : 'Trip assistant failed.'
    return NextResponse.json({ error: messageText }, { status: 500 })
  }
}
