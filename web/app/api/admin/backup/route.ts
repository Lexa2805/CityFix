import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const [requestsRes, documentsRes] = await Promise.all([
      supabase
        .from('requests')
        .select('id, request_type, status, assigned_clerk_id, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(250),
      supabase
        .from('documents')
        .select('id, request_id, validation_status, uploaded_at, file_name')
        .order('uploaded_at', { ascending: false })
        .limit(250)
    ])

    if (requestsRes.error) throw requestsRes.error
    if (documentsRes.error) throw documentsRes.error

    return NextResponse.json({
      data: {
        generated_at: new Date().toISOString(),
        requests: requestsRes.data || [],
        documents: documentsRes.data || []
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nu s-a putut genera backup-ul.'
    console.error('Backup export error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
