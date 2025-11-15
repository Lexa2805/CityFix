import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ALERT_TYPES = [
  'clerk_manual_review',
  'clerk_escalation',
  'clerk_feedback',
  'issue_report',
  'document_issue'
]

export async function GET() {
  try {
    const { data: alerts, error } = await supabase
      .from('activity_log')
      .select('id, user_id, action_type, details, created_at')
      .in('action_type', ALERT_TYPES)
      .order('created_at', { ascending: false })
      .limit(15)

    if (error) {
      throw error
    }

    const userIds = Array.from(new Set((alerts || []).map(alert => alert.user_id).filter(Boolean)))
    let usersMap: Record<string, { full_name: string | null; email: string | null }> = {}

    if (userIds.length) {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds as string[])

      if (usersError) {
        throw usersError
      }

      usersMap = (users || []).reduce((acc, user) => {
        acc[user.id] = {
          full_name: user.full_name,
          email: user.email
        }
        return acc
      }, {} as Record<string, { full_name: string | null; email: string | null }>)
    }

    const enriched = (alerts || []).map(alert => ({
      ...alert,
      user: alert.user_id ? usersMap[alert.user_id] || null : null
    }))

    return NextResponse.json({ data: enriched })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nu s-au putut încărca notificările'
    console.error('Clerk alerts error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
