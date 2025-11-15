import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('role', 'citizen')
      .eq('is_active', true)
      .limit(1000)

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nu s-au putut încărca emailurile.'
    console.error('Citizen emails error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
