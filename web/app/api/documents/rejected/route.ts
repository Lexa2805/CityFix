import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('validation_status', 'rejected')
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

<<<<<<< Updated upstream
    if (!documents || documents.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Get requests separately
    const requestIds = [...new Set(documents.map((d) => d.request_id))]
=======
    // Fetch request details
    const requestIds = [...new Set(documents?.map(d => d.request_id).filter(Boolean))]
    
>>>>>>> Stashed changes
    const { data: requests } = await supabase
      .from('requests')
      .select('id, request_type, user_id')
      .in('id', requestIds)

<<<<<<< Updated upstream
    const requestsMap = new Map((requests || []).map((r) => [r.id, r]))

    // Get user profiles
    const userIds = [...new Set((requests || []).map((r) => r.user_id))]
    const { data: profiles } = await supabase
=======
    // Fetch user details
    const userIds = [...new Set(requests?.map(r => r.user_id).filter(Boolean))]
    const { data: users } = await supabase
>>>>>>> Stashed changes
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

<<<<<<< Updated upstream
    const profilesMap = new Map((profiles || []).map((p) => [p.id, p]))

    // Combine data
    const enrichedData = documents
      .map((doc) => {
        const req = requestsMap.get(doc.request_id)
        return {
          ...doc,
          request: req
            ? {
                id: req.id,
                request_type: req.request_type,
                user:
                  profilesMap.get(req.user_id) || {
                    email: '',
                    full_name: null
                  }
              }
            : null
        }
      })
      .filter((doc) => doc.request !== null)
=======
    // Combine data
    const enrichedData = documents?.map(doc => {
      const req = requests?.find(r => r.id === doc.request_id)
      const user = users?.find(u => u.id === req?.user_id)
      return {
        ...doc,
        request: req ? {
          id: req.id,
          request_type: req.request_type,
          user: user || { email: 'unknown', full_name: null }
        } : null
      }
    })
>>>>>>> Stashed changes

    return NextResponse.json({ data: enrichedData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}