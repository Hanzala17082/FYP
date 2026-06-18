import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { mapUserRow } from '@/shared/lib/supabase/mappers'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

function extForMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'jpg'
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    const form = await request.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a JPEG, PNG, WebP, or GIF image.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()
    const ext = extForMime(file.type)
    const objectPath = `${auth.user.id}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await admin.storage.from('avatars').upload(objectPath, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: '3600',
    })

    if (uploadErr) {
      return NextResponse.json({ error: formatSupabaseError(uploadErr) }, { status: 400 })
    }

    const { data: publicData } = admin.storage.from('avatars').getPublicUrl(objectPath)
    const avatarUrl = publicData.publicUrl

    const { data: row, error: updateErr } = await admin
      .from('users')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', auth.user.id)
      .select('*')
      .single()

    if (updateErr || !row) {
      return NextResponse.json(
        { error: updateErr ? formatSupabaseError(updateErr) : 'Failed to save avatar.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: {
        avatarUrl,
        user: mapUserRow(row as Record<string, unknown>),
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to upload avatar.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
