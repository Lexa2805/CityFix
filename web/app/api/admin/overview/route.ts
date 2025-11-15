import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)

    const monthStartIso = monthStart.toISOString()
    const weekAgoIso = weekAgo.toISOString()

    const [profilesRes, requestsRes, documentsRes, flaggedDocsRes, autoAssignRes, exportsRes, legislationRes] = await Promise.all([
      supabase.from('profiles').select('role, is_active, created_at'),
      supabase
        .from('requests')
        .select('status, created_at, request_type')
        .gte('created_at', monthStartIso),
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('validation_status', 'rejected'),
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'auto_assign')
        .gte('created_at', weekAgoIso),
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'gdpr_data_export')
        .gte('created_at', weekAgoIso),
      supabase
        .from('activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'legislation_sync')
        .gte('created_at', monthStartIso)
    ])

    if (profilesRes.error) throw profilesRes.error
    if (requestsRes.error) throw requestsRes.error
    if (documentsRes.error) throw documentsRes.error
    if (flaggedDocsRes.error) throw flaggedDocsRes.error
    if (autoAssignRes.error) throw autoAssignRes.error
    if (exportsRes.error) throw exportsRes.error
    if (legislationRes.error) throw legislationRes.error

    const profiles = profilesRes.data || []
    const requests = requestsRes.data || []

    const totalUsers = profiles.length
    const activeClerks = profiles.filter(p => p.role === 'clerk' && p.is_active).length
    const pendingAccess = profiles.filter(p => p.role === 'citizen' && !p.is_active).length
    const newUsersThisMonth = profiles.filter(p => new Date(p.created_at) >= monthStart).length

    const requestsThisMonth = requests.length
    const processed = requests.filter(r => ['approved', 'rejected'].includes(r.status))
    const avgProcessingTime = 0 // Cannot calculate without updated_at column

    const activeRequests = requests.filter(r => ['pending_validation', 'in_review'].includes(r.status)).length
    const approvedCount = processed.filter(r => r.status === 'approved').length
    const approvalRate = processed.length ? (approvedCount / processed.length) * 100 : 0
    const requestTemplates = Array.from(new Set(requests.map(r => r.request_type))).length

    return NextResponse.json({
      data: {
        generatedAt: now.toISOString(),
        summary: {
          totalUsers,
          requestsThisMonth,
          avgProcessingTime: parseFloat(avgProcessingTime.toFixed(1)),
          approvalRate: parseFloat(approvalRate.toFixed(1)),
          activeRequests,
          newUsersThisMonth
        },
        userManagement: {
          activeClerks,
          pendingAccess
        },
        content: {
          documentsTotal: documentsRes.count || 0,
          requestTemplates,
          legislationUpdates: legislationRes.count || 0
        },
        reports: {
          aiFlags: flaggedDocsRes.count || 0,
          autoAssignmentsThisWeek: autoAssignRes.count || 0,
          exportsThisWeek: exportsRes.count || 0
        }
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nu s-au putut încărca datele'
    console.error('Overview load error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
