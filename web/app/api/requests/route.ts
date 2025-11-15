import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const request_type = searchParams.get('request_type')
    const assigned_clerk_id = searchParams.get('assigned_clerk_id')
    const from_date = searchParams.get('from_date')
    const to_date = searchParams.get('to_date')
    const search = searchParams.get('search')

    let query = supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (request_type) {
      query = query.eq('request_type', request_type)
    }

    if (assigned_clerk_id) {
      query = query.eq('assigned_clerk_id', assigned_clerk_id)
    }

    if (from_date) {
      query = query.gte('created_at', from_date)
    }

    if (to_date) {
      query = query.lte('created_at', to_date)
    }

    if (search) {
      query = query.or(`request_type.ilike.%${search}%`)
    }

    const { data: requests, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch user details separately
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
    }))

    return NextResponse.json({ data: enrichedData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
