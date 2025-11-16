'use client'
import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import AdminUserManagement from '../../components/admin/AdminUserManagement'
import AdminAnalytics from '../../components/admin/AdminAnalytics'
import AdminQuickActions from '../../components/admin/AdminQuickActions'
import AdminSmartNotifications from '../../components/admin/AdminSmartNotifications'
import AdminCalendar from '../../components/admin/AdminCalendar'
import AdminAdvancedSearch from '../../components/admin/AdminAdvancedSearch'
import AdminSystemSettings from '../../components/admin/AdminSystemSettings'

type AdminTab = 'overview' | 'users' | 'activity' | 'analytics' | 'calendar' | 'search' | 'settings'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview')

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                    <h2 className="text-2xl font-semibold mb-2">
                        Panou Administrator ADU
                    </h2>
                    <p className="text-purple-100">
                        Gestionare completă utilizatori, roluri și monitorizare activitate (GDPR Compliant)
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px overflow-x-auto">
                            <TabButton
                                active={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                }
                            >
                                Prezentare Generală
                            </TabButton>
                            <TabButton
                                active={activeTab === 'users'}
                                onClick={() => setActiveTab('users')}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                            >
                                Gestionare Utilizatori
                            </TabButton>
                            <TabButton
                                active={activeTab === 'activity'}
                                onClick={() => setActiveTab('activity')}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                            >
                                Istoric Activitate
                            </TabButton>
                            <TabButton
                                active={activeTab === 'analytics'}
                                onClick={() => setActiveTab('analytics')}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                }
                            >
                                Analiză & Rapoarte
                            </TabButton>
                            <TabButton
                                active={activeTab === 'calendar'}
                                onClick={() => setActiveTab('calendar')}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            >
                                Calendar Termene
                            </TabButton>
                            <TabButton
                                active={activeTab === 'search'}
                                onClick={() => setActiveTab('search')}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            >
                                Căutare Avansată
                            </TabButton>
                            <TabButton
                                active={activeTab === 'settings'}
                                onClick={() => setActiveTab('settings')}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                            >
                                Configurări
                            </TabButton>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                    {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
                {activeTab === 'users' && <AdminUserManagement />}
                {activeTab === 'activity' && <ActivityTab />}
                {activeTab === 'analytics' && <AdminAnalytics />}
                {activeTab === 'calendar' && <AdminCalendar />}
                {activeTab === 'search' && <AdminAdvancedSearch />}
                {activeTab === 'settings' && <AdminSystemSettings />}
            </div>
        </DashboardLayout>
    )
}

function TabButton({ 
    active, 
    onClick, 
    icon, 
    children 
}: { 
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            {icon}
            {children}
        </button>
    )
}

interface OverviewData {
    summary: {
        totalUsers: number
        requestsThisMonth: number
        avgProcessingTime: number
        approvalRate: number
        activeRequests: number
        newUsersThisMonth: number
    }
    userManagement: {
        activeClerks: number
        pendingAccess: number
    }
    content: {
        documentsTotal: number
        requestTemplates: number
        legislationUpdates: number
    }
    reports: {
        aiFlags: number
        autoAssignmentsThisWeek: number
        exportsThisWeek: number
    }
}

function OverviewTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
    const [data, setData] = useState<OverviewData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const formatter = new Intl.NumberFormat('ro-RO')

    const loadOverview = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/overview')
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.error || 'Nu s-au putut încărca datele')
            }
            setData(result.data)
            setError(null)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Eroare necunoscută')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOverview()
    }, [])

    const formatNumber = (value?: number) => formatter.format(value ?? 0)

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <p className="text-red-600 font-semibold mb-3">{error}</p>
                <button
                    onClick={loadOverview}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    Reîncearcă
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Smart Notifications */}
            <AdminSmartNotifications />

            {/* Quick Actions Panel */}
            <AdminQuickActions onNavigate={onNavigate} />

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AdminStatCard
                    title="Total Utilizatori"
                    value={loading ? '...' : formatNumber(data?.summary.totalUsers)}
                    change={loading ? '' : `+${formatNumber(data?.summary.newUsersThisMonth)} luna curentă`}
                    positive={true}
                />
                <AdminStatCard
                    title="Cereri Luna Aceasta"
                    value={loading ? '...' : formatNumber(data?.summary.requestsThisMonth)}
                    change={loading ? '' : `${formatNumber(data?.summary.activeRequests)} active`}
                    positive={true}
                />
                <AdminStatCard
                    title="Timp Mediu Procesare"
                    value={loading ? '...' : `${data?.summary.avgProcessingTime ?? 0} zile`}
                    change={loading ? '' : `${formatNumber(data?.reports.autoAssignmentsThisWeek)} auto-assign`}
                    positive={(data?.summary.avgProcessingTime || 0) <= 5}
                />
                <AdminStatCard
                    title="Rata Aprobare"
                    value={loading ? '...' : `${data?.summary.approvalRate ?? 0}%`}
                    change={loading ? '' : `${formatNumber(data?.reports.aiFlags)} respinse AI`}
                    positive={true}
                />
            </div>

            {/* Admin Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Gestionare Utilizatori
                    </h3>
                    <div className="space-y-3">
                        <AdminInfoItem title="Total utilizatori" count={loading ? '...' : formatNumber(data?.summary.totalUsers)} />
                        <AdminInfoItem title="Funcționari activi" count={loading ? '...' : formatNumber(data?.userManagement.activeClerks)} />
                        <AdminInfoItem title="Cereri de acces" count={loading ? '...' : formatNumber(data?.userManagement.pendingAccess)} />
                    </div>
                </div>

                {/* System Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configurare Sistem
                    </h3>
                    <div className="space-y-3">
                        <AdminInfoItem title="Setări generale" icon="⚙️" />
                        <AdminInfoItem title="Configurare AI" icon="🤖" />
                        <AdminInfoItem title="Bază de cunoștințe RAG" icon="📚" />
                    </div>
                </div>

                {/* Content Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Gestionare Conținut
                    </h3>
                    <div className="space-y-3">
                        <AdminInfoItem title="Documente în sistem" count={loading ? '...' : formatNumber(data?.content.documentsTotal)} />
                        <AdminInfoItem title="Șabloane cereri" count={loading ? '...' : formatNumber(data?.content.requestTemplates)} />
                        <AdminInfoItem title="Legislație actualizată" count={loading ? '...' : formatNumber(data?.content.legislationUpdates)} />
                    </div>
                </div>

                {/* Reports & Analytics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Rapoarte & Analize
                    </h3>
                    <div className="space-y-3">
                        <AdminInfoItem title="Raport lunar" count={loading ? '...' : formatNumber(data?.summary.requestsThisMonth)} />
                        <AdminInfoItem title="Statistici AI" count={loading ? '...' : formatNumber(data?.reports.aiFlags)} />
                        <AdminInfoItem title="Export date" count={loading ? '...' : formatNumber(data?.reports.exportsThisWeek)} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ActivityTab() {
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d' | 'all'>('7d')
    const [actionFilter, setActionFilter] = useState<string>('all')
    const [stats, setStats] = useState<any>(null)

    const loadActivities = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({ timeframe, limit: '100' })
            if (actionFilter !== 'all') {
                params.append('action_type', actionFilter)
            }

            const response = await fetch(`/api/admin/activity?${params}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load activities')
            }

            setActivities(result.data.activities)
            setStats(result.data.stats)
        } catch (error) {
            console.error('Error loading activities:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadActivities()
    }, [timeframe, actionFilter])

    const getActionLabel = (actionType: string): string => {
        const labels: Record<string, string> = {
            login: 'Autentificare',
            logout: 'Deconectare',
            create_request: 'Cerere Creată',
            update_request: 'Cerere Actualizată',
            delete_request: 'Cerere Ștearsă',
            upload_document: 'Document Încărcat',
            delete_document: 'Document Șters',
            document_approve: 'Document Aprobat',
            document_reject: 'Document Respins',
            role_change: 'Schimbare Rol',
            account_create: 'Cont Creat',
            account_disable: 'Cont Modificat',
            assign_clerk: 'Alocare Funcționar',
            unassign_clerk: 'Dealocare Funcționar',
            update_priority: 'Actualizare Prioritate'
        }
        return labels[actionType] || actionType
    }

    const getActionIcon = (actionType: string): string => {
        const icons: Record<string, string> = {
            login: '🔓',
            logout: '🔒',
            create_request: '📝',
            update_request: '✏️',
            delete_request: '🗑️',
            upload_document: '📤',
            delete_document: '🗑️',
            document_approve: '✅',
            document_reject: '❌',
            role_change: '👤',
            account_create: '➕',
            account_disable: '⚙️',
            assign_clerk: '👥',
            unassign_clerk: '👤',
            update_priority: '⭐'
        }
        return icons[actionType] || '📌'
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            {/* Header with Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Istoric Activitate Sistem
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {/* Timeframe Filter */}
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="24h">Ultimele 24 ore</option>
                            <option value="7d">Ultimele 7 zile</option>
                            <option value="30d">Ultimele 30 zile</option>
                            <option value="90d">Ultimele 90 zile</option>
                            <option value="all">Toate</option>
                        </select>

                        {/* Action Type Filter */}
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">Toate acțiunile</option>
                            <option value="login">Autentificări</option>
                            <option value="create_request">Cereri create</option>
                            <option value="upload_document">Documente încărcate</option>
                            <option value="document_approve">Documente aprobate</option>
                            <option value="document_reject">Documente respinse</option>
                            <option value="role_change">Schimbări rol</option>
                            <option value="assign_clerk">Alocări funcționar</option>
                        </select>

                        <button
                            onClick={loadActivities}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                            🔄 Reîmprospătează
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-900 mb-1">Total Activități</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-900 mb-1">Tipuri de Acțiuni</p>
                        <p className="text-3xl font-bold text-gray-800">{Object.keys(stats.actionCounts || {}).length}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-900 mb-1">Utilizatori Activi</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.mostActiveUsers?.length || 0}</p>
                    </div>
                </div>
            )}

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800">Timeline Activități</h4>
                </div>
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nicio activitate găsită</h3>
                            <p className="mt-1 text-sm text-gray-700">
                                Nu există activități pentru filtrul selectat.
                            </p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                                        {getActionIcon(activity.action_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-semibold text-gray-800">
                                                {activity.user?.full_name || activity.user?.email || 'Utilizator necunoscut'}
                                            </span>
                                            <span className="text-gray-700">•</span>
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                                                {getActionLabel(activity.action_type)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 mb-1">
                                            {formatDate(activity.created_at)}
                                        </p>
                                        {activity.details && Object.keys(activity.details).length > 0 && (
                                            <div className="mt-2 text-xs text-gray-900 bg-gray-50 rounded p-2 font-mono">
                                                <pre className="whitespace-pre-wrap break-words">
                                                    {JSON.stringify(activity.details, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {activity.affected_user && (
                                            <p className="text-xs text-gray-700 mt-1">
                                                Utilizator afectat: {activity.affected_user.full_name || activity.affected_user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function AdminStatCard({ title, value, change, positive }: {
    title: string
    value: string
    change: string
    positive: boolean
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-900 mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
        </div>
    )
}

function AdminInfoItem({ title, count, icon }: { title: string; count?: string; icon?: string }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
                {icon && <span className="text-lg">{icon}</span>}
                <span className="text-sm font-medium text-gray-800">{title}</span>
            </div>
            {count && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                    {count}
                </span>
            )}
        </div>
    )
}
