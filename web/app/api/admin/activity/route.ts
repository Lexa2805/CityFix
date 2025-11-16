import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const actionType = searchParams.get('action_type')
    const userId = searchParams.get('user_id')
    const timeframe = searchParams.get('timeframe') || '7d'

    // Calculate date threshold
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case 'all':
        startDate.setFullYear(2020) // Get all records
        break
    }

    // Build query - fetch activity_log first, then manually join with profiles
    let query = supabase
      .from('activity_log')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    // Add filters
    if (actionType) {
      query = query.eq('action_type', actionType)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error('Activity log error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Manually fetch user profiles for the activities
    const userIds = new Set<string>()
    activities?.forEach(activity => {
      if (activity.user_id) userIds.add(activity.user_id)
      if (activity.affected_user_id) userIds.add(activity.affected_user_id)
    })

    let userProfiles: Record<string, any> = {}
    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .in('id', Array.from(userIds))

      profiles?.forEach(profile => {
        userProfiles[profile.id] = profile
      })
    }

    // Enrich activities with user data
    const enrichedActivities = activities?.map(activity => ({
      ...activity,
      user: activity.user_id ? userProfiles[activity.user_id] : null,
      affected_user: activity.affected_user_id ? userProfiles[activity.affected_user_id] : null
    }))

    // Get action type statistics
    const { data: actionStats } = await supabase
      .from('activity_log')
      .select('action_type')
      .gte('created_at', startDate.toISOString())

    const actionCounts: Record<string, number> = {}
    actionStats?.forEach(item => {
      actionCounts[item.action_type] = (actionCounts[item.action_type] || 0) + 1
    })

    // Get user activity statistics
    const { data: userStats } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', startDate.toISOString())

    const userActivityCounts: Record<string, number> = {}
    userStats?.forEach(item => {
      if (item.user_id) {
        userActivityCounts[item.user_id] = (userActivityCounts[item.user_id] || 0) + 1
      }
    })

    const mostActiveUsers = Object.entries(userActivityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        activities: enrichedActivities || [],
        stats: {
          total: enrichedActivities?.length || 0,
          actionCounts,
          mostActiveUsers: mostActiveUsers.map(([userId, count]) => ({
            userId,
            count
          }))
        }
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'A apărut o eroare neașteptată'
    console.error('Activity log fetch error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
