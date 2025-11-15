import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const daysThreshold = parseInt(searchParams.get('days') || '3')

    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .not('legal_deadline', 'is', null)
      .lte('legal_deadline', thresholdDate.toISOString())
      .in('status', ['pending_validation', 'in_review'])
      .order('legal_deadline', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

<<<<<<< Updated upstream
    if (!requests || requests.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Get user profiles separately
    const userIds = [...new Set(requests.map((r) => r.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map((p) => [p.id, p]))

    // Combine data
    const enrichedData = requests.map((req) => ({
      ...req,
      user: profilesMap.get(req.user_id) || { email: '', full_name: null }
=======
    // Fetch user and clerk details
    const userIds = [...new Set(requests?.map(r => r.user_id).filter(Boolean))]
    const clerkIds = [...new Set(requests?.map(r => r.assigned_clerk_id).filter(Boolean))]
    
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)
    
    const { data: clerks } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', clerkIds)

    // Combine data
    const enrichedData = requests?.map(req => ({
      ...req,
      user: users?.find(u => u.id === req.user_id) || { email: 'unknown', full_name: null },
      assigned_clerk: clerks?.find(c => c.id === req.assigned_clerk_id) || null
>>>>>>> Stashed changes
    }))

    return NextResponse.json({ data: enrichedData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}