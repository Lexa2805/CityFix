import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
  try {
    const { error } = await supabase
      .from('activity_log')
      .insert({
        user_id: null,
        action_type: 'legislation_sync',
        details: {
          source: 'admin_quick_actions',
          timestamp: new Date().toISOString()
        }
      })

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Sincronizarea a fost programată.' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nu s-a putut porni sincronizarea.'
    console.error('Legislation sync error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
