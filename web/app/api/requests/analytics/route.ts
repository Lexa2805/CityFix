import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || '30d'

    // Calculate date threshold
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get all requests in timeframe
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by month
    const requestsByMonth: { month: string; count: number }[] = []
    const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec']
    const monthCounts: Record<string, number> = {}

    requests?.forEach(req => {
      const date = new Date(req.created_at)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    })

    // Convert to array format
    Object.entries(monthCounts).forEach(([key, count]) => {
      const [, monthIndex] = key.split('-')
      const monthName = monthNames[parseInt(monthIndex, 10)]
      requestsByMonth.push({ month: monthName, count })
    })

    // Ensure we have at least some months shown
    if (requestsByMonth.length === 0) {
      // Show last 6 months with 0 count
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        requestsByMonth.push({
          month: monthNames[date.getMonth()],
          count: 0
        })
      }
    }

    // Group by type with percentages
    const typeCounts: Record<string, number> = {}
    requests?.forEach(req => {
      typeCounts[req.request_type] = (typeCounts[req.request_type] || 0) + 1
    })

    const total = requests?.length || 0
    const requestsByType = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))

    // Calculate average processing time (for approved/rejected requests)
    const processedRequests = requests?.filter(r => 
      r.status === 'approved' || r.status === 'rejected'
    ) || []

    let avgProcessingTime = 0
    if (processedRequests.length > 0) {
      const processingTimes = processedRequests.map(req => {
        const created = new Date(req.created_at).getTime()
        const updated = new Date(req.updated_at || req.created_at).getTime()
        return (updated - created) / (1000 * 60 * 60 * 24) // Convert to days
      })
      avgProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
    }

    // Calculate approval rate
    const approved = requests?.filter(r => r.status === 'approved').length || 0
    const rejected = requests?.filter(r => r.status === 'rejected').length || 0
    const approvalRate = (approved + rejected) > 0 
      ? Math.round((approved / (approved + rejected)) * 100) 
      : 0

    return NextResponse.json({
      data: {
        requestsByMonth,
        requestsByType,
        avgProcessingTime: parseFloat(avgProcessingTime.toFixed(1)),
        approvalRate,
        totalRequests: total,
        activeRequests: requests?.filter(r => 
          r.status === 'pending_validation' || r.status === 'in_review'
        ).length || 0
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'A apărut o eroare neașteptată'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
