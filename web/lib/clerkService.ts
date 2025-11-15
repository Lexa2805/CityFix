// web/lib/clerkService.ts

import { supabase } from './supabaseClient'
import type { RequestStatus } from './requestService'

// Interfața pentru statistici (rămâne neschimbată)
export interface ClerkStats {
    pending_validation: number
    in_review: number
    near_deadline: number
    completed_this_month: number
    assigned_to_me: number
}

// Interfața de bază
export interface RequestWithDetails {
    id: string
    user_id: string
    request_type: string
    status: RequestStatus
    priority: number // Coloana originală din DB
    legal_deadline: string | null
    location: unknown
    extracted_metadata: any
    assigned_clerk_id: string | null
    created_at: string
    user_profile?: {
        full_name: string | null
        role: string
    }
    documents_count?: number
    days_until_deadline?: number // Acesta este câmpul vechi
}

// ==========================================================
// INTERFAȚA NOUĂ PENTRU DATELE DE LA BACKEND
// ==========================================================
export interface PrioritizedRequest extends RequestWithDetails {
    priority_score: number      // Noul scor calculat de backend
    backlog_in_category: number // Noul câmp de la backend
    citizen_name: string        // Numele cetățeanului
    days_left: number | null    // Noul câmp 'days_left' (înlocuiește 'days_until_deadline')
}
// ==========================================================

// Funcția de statistici (rămâne neschimbată)
export async function getClerkStats(): Promise<ClerkStats> {
    // Așteaptă ca sesiunea să fie încărcată
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Cereri pending validation
    const { count: pendingCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_validation')

    // Cereri in review
    const { count: reviewCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_review')

    // Cereri aproape de deadline (următoarele 7 zile)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { count: deadlineCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending_validation', 'in_review'])
        .not('legal_deadline', 'is', null)
        .lte('legal_deadline', sevenDaysFromNow.toISOString())

    // Cereri finalizate luna curentă
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: completedCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved') // Doar aprobate
        .gte('created_at', startOfMonth.toISOString())

    // Cereri asignate mie
    const { count: assignedCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_clerk_id', user.id)
        .in('status', ['pending_validation', 'in_review'])

    return {
        pending_validation: pendingCount || 0,
        in_review: reviewCount || 0,
        near_deadline: deadlineCount || 0,
        completed_this_month: completedCount || 0,
        assigned_to_me: assignedCount || 0
    }
}

// ==========================================================
// FUNCȚIA PENTRU CERERI PRIORITIZATE
// ==========================================================
export async function getPrioritizedRequests(): Promise<PrioritizedRequest[]> {
    // Așteaptă ca sesiunea să fie încărcată
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Query TOATE cererile active (pending_validation și in_review)
    const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .in('status', ['pending_validation', 'in_review'])

    if (error) {
        console.error('Error fetching prioritized requests:', error)
        throw error
    }

    if (!requests || requests.length === 0) {
        return []
    }

    // Get user profiles
    const userIds = [...new Set(requests.map(r => r.user_id))]
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

    const profilesMap = new Map((profiles || []).map(p => [p.id, p]))

    // Enrichment și calculare SCOR DE PRIORITATE
    const enrichedRequests = requests.map(req => {
        let daysUntilDeadline: number | null = null
        if (req.legal_deadline) {
            const deadline = new Date(req.legal_deadline)
            const now = new Date()
            const diffTime = deadline.getTime() - now.getTime()
            daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        const profile = profilesMap.get(req.user_id)

        // CALCUL SCOR PRIORITATE INTELIGENT
        // Scor = (prioritate manuală * 10) + bonus deadline + bonus vechime
        let priorityScore = (req.priority || 0) * 10

        // Bonus deadline: cereri cu deadline apropiat = urgență maximă
        if (daysUntilDeadline !== null) {
            if (daysUntilDeadline <= 0) {
                priorityScore += 100 // DEPĂȘIT - urgență maximă
            } else if (daysUntilDeadline <= 3) {
                priorityScore += 50 // Sub 3 zile - foarte urgent
            } else if (daysUntilDeadline <= 7) {
                priorityScore += 30 // Sub 7 zile - urgent
            } else if (daysUntilDeadline <= 14) {
                priorityScore += 10 // Sub 14 zile - atenție
            }
        }

        // Bonus vechime: cereri vechi = mai prioritare
        const daysOld = Math.floor((Date.now() - new Date(req.created_at).getTime()) / (1000 * 60 * 60 * 24))
        if (daysOld > 30) {
            priorityScore += 20
        } else if (daysOld > 14) {
            priorityScore += 10
        } else if (daysOld > 7) {
            priorityScore += 5
        }

        return {
            ...req,
            citizen_name: profile?.full_name || 'N/A',
            days_left: daysUntilDeadline,
            days_until_deadline: daysUntilDeadline,
            user_profile: profile ? { full_name: profile.full_name } : null,
            priority_score: priorityScore
        }
    })

    // Sortare după scor prioritate (descrescător) și limitare la top 20
    const sortedRequests = enrichedRequests
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, 20)

    return sortedRequests as PrioritizedRequest[]
}

// ==========================================================
// FUNCȚIA PENTRU A OBȚINE CERERILE PENTRU CLERK
// ==========================================================
export interface GetRequestsOptions {
    assignedToMe?: boolean
    sortBy?: 'priority' | 'created_at' | 'deadline'
    status?: RequestStatus | RequestStatus[]
}

export async function getAllRequestsForClerk(options: GetRequestsOptions = {}): Promise<RequestWithDetails[]> {
    const { assignedToMe = false, sortBy = 'created_at', status } = options

    // Așteaptă ca sesiunea să fie încărcată
    await new Promise(resolve => setTimeout(resolve, 100))

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    let query = supabase
        .from('requests')
        .select('*')

    // Filter by assigned clerk if requested
    if (assignedToMe) {
        query = query.eq('assigned_clerk_id', user.id)
    }

    // Filter by status if provided
    if (status) {
        if (Array.isArray(status)) {
            query = query.in('status', status)
        } else {
            query = query.eq('status', status)
        }
    }

    // Sort by requested field
    switch (sortBy) {
        case 'priority':
            query = query.order('priority', { ascending: false })
            break
        case 'deadline':
            query = query.order('legal_deadline', { ascending: true, nullsFirst: false })
            break
        case 'created_at':
        default:
            query = query.order('created_at', { ascending: false })
            break
    }

    const { data: requests, error } = await query

    if (error) {
        console.error('Error fetching requests:', error)
        throw error
    }

    if (!requests || requests.length === 0) {
        return []
    }

    // Get user profiles separately
    const userIds = [...new Set(requests.map(r => r.user_id))]
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', userIds)

    const profilesMap = new Map((profiles || []).map(p => [p.id, p]))

    // Get documents count for each request
    const requestsWithCounts = await Promise.all(
        requests.map(async (request) => {
            const { count } = await supabase
                .from('documents')
                .select('*', { count: 'exact', head: true })
                .eq('request_id', request.id)

            // Calculate days until deadline
            let daysUntilDeadline: number | undefined
            if (request.legal_deadline) {
                const deadline = new Date(request.legal_deadline)
                const now = new Date()
                const diffTime = deadline.getTime() - now.getTime()
                daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            }

            const profile = profilesMap.get(request.user_id)

            return {
                ...request,
                user_profile: profile || null,
                documents_count: count || 0,
                days_until_deadline: daysUntilDeadline
            }
        })
    )

    return requestsWithCounts as RequestWithDetails[]
}

// ==========================================================
// RESTUL FUNCȚIILOR (Rămân neschimbate)
// ==========================================================

export async function assignRequestToMe(requestId: string) {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
        .from('requests')
        .update({
            assigned_clerk_id: user.id,
            status: 'in_review'
        })
        .eq('id', requestId)
        .eq('status', 'pending_validation')
        .select()
        .single()

    if (error) {
        console.error('Error assigning request:', error)
        throw error
    }

    return data
}

export async function unassignRequest(requestId: string) {
    const { data, error } = await supabase
        .from('requests')
        .update({
            assigned_clerk_id: null,
            status: 'pending_validation'
        })
        .eq('id', requestId)
        .select()
        .single()

    if (error) {
        console.error('Error unassigning request:', error)
        throw error
    }

    return data
}

export async function approveRequest(requestId: string, notes?: string) {
    // Obține metadata curentă
    const { data: currentRequest } = await supabase
        .from('requests')
        .select('extracted_metadata')
        .eq('id', requestId)
        .single()

    const currentMetadata = currentRequest?.extracted_metadata || {}

    // Actualizează cererea
    const { data, error } = await supabase
        .from('requests')
        .update({
            status: 'approved',
            extracted_metadata: {
                ...currentMetadata,
                approval_notes: notes,
                approved_at: new Date().toISOString()
            }
        })
        .eq('id', requestId)
        .select()
        .single()

    if (error) {
        console.error('Error approving request:', error)
        throw error
    }

    return data
}

export async function rejectRequest(requestId: string, reason: string) {
    // Obține metadata curentă
    const { data: currentRequest } = await supabase
        .from('requests')
        .select('extracted_metadata')
        .eq('id', requestId)
        .single()

    const currentMetadata = currentRequest?.extracted_metadata || {}

    // Actualizează cererea
    const { data, error } = await supabase
        .from('requests')
        .update({
            status: 'rejected',
            extracted_metadata: {
                ...currentMetadata,
                rejection_reason: reason,
                rejected_at: new Date().toISOString()
            }
        })
        .eq('id', requestId)
        .select()
        .single()

    if (error) {
        console.error('Error rejecting request:', error)
        throw error
    }

    return data
}

export async function updateRequestPriority(requestId: string, priority: number) {
    const { data, error } = await supabase
        .from('requests')
        .update({ priority }) // Aici actualizăm coloana veche 'priority'
        .eq('id', requestId)
        .select()
        .single()

    if (error) {
        console.error('Error updating priority:', error)
        throw error
    }

    return data
}