'use client'
import React, { useState, useEffect, useCallback } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getAllRequests } from '@/lib/api/requestsApi'

interface AnalyticsData {
  requestsByMonth: { month: string; count: number }[]
  requestsByType: { type: string; count: number; percentage: number }[]
  avgProcessingTime: number
  approvalRate: number
  totalRequests: number
  activeRequests: number
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [loading, setLoading] = useState(true)

  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'A apărut o eroare neașteptată')

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/requests/analytics?timeframe=${timeframe}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load analytics')
      }

      setData(result.data)
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      toast.error(`Eroare la încărcarea analizei: ${message}`)
      console.error('Analytics error:', message)
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const handleExportCSV = async () => {
    try {
      toast.loading('Pregătesc exportul CSV...', { id: 'export' })
      
      const requests = await getAllRequests()
      
      const headers = ['ID', 'Tip Cerere', 'Status', 'Data Creare', 'Prioritate']
      const rows = requests.map(req => [
        req.id,
        req.request_type,
        req.status,
        new Date(req.created_at).toLocaleDateString('ro-RO'),
        req.priority?.toString() || 'N/A'
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `cereri_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      toast.success('Export CSV completat!', { id: 'export' })
    } catch (error: unknown) {
      toast.error(`Eroare la export CSV: ${getErrorMessage(error)}`, { id: 'export' })
    }
  }

  const handleExportExcel = async () => {
    try {
      toast.loading('Pregătesc exportul Excel...', { id: 'export' })
      
      const requests = await getAllRequests()
      
      // Create Excel-compatible CSV (with BOM for UTF-8)
      const headers = ['ID', 'Tip Cerere', 'Status', 'Data Creare', 'Prioritate', 'Email Utilizator']
      const rows = requests.map(req => [
        req.id,
        req.request_type,
        req.status,
        new Date(req.created_at).toLocaleDateString('ro-RO'),
        req.priority?.toString() || 'N/A',
        req.user?.email || 'N/A'
      ])

      const csv = '\uFEFF' + [
        headers.join('\t'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join('\t'))
      ].join('\n')

      const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `cereri_${timeframe}_${new Date().toISOString().split('T')[0]}.xls`
      link.click()

      toast.success('Export Excel completat!', { id: 'export' })
    } catch (error: unknown) {
      toast.error(`Eroare la export Excel: ${getErrorMessage(error)}`, { id: 'export' })
    }
  }

  const handleExportPDF = async () => {
    try {
      toast.loading('Generez raportul PDF...', { id: 'export' })

      const requests = await getAllRequests()
      const doc = new jsPDF()

      doc.setFontSize(16)
      doc.text('Raport Cereri - CityFix', 14, 18)
      doc.setFontSize(11)
      doc.text(`Generat la ${new Date().toLocaleString('ro-RO')}`, 14, 26)

      autoTable(doc, {
        startY: 32,
        head: [['Tip cerere', 'Status', 'Cetățean', 'Funcționar', 'Creat la']],
        body: requests.slice(0, 50).map(req => [
          req.request_type,
          req.status,
          req.user.full_name || req.user.email,
          req.assigned_clerk?.full_name || 'Nealocat',
          new Date(req.created_at).toLocaleDateString('ro-RO')
        ]),
        styles: { fontSize: 9 }
      })

      doc.save(`raport-cereri-${timeframe}.pdf`)
      toast.success('PDF generat cu succes!', { id: 'export' })
    } catch (error: unknown) {
      toast.error(`Eroare la export PDF: ${getErrorMessage(error)}`, { id: 'export' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Nu s-au putut încărca datele de analiză</div>
      </div>
    )
  }

  const maxCount = Math.max(...data.requestsByMonth.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Analiză & Rapoarte</h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tf === '7d' ? '7 Zile' : tf === '30d' ? '30 Zile' : tf === '90d' ? '90 Zile' : '1 An'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Cereri"
          value={data.totalRequests.toString()}
          change="+12%"
          trend="up"
          icon="📊"
        />
        <MetricCard
          title="Timp Mediu Procesare"
          value={`${data.avgProcessingTime} zile`}
          change="-15%"
          trend="up"
          icon="⏱️"
        />
        <MetricCard
          title="Rată Aprobare"
          value={`${data.approvalRate}%`}
          change="+2%"
          trend="up"
          icon="✅"
        />
        <MetricCard
          title="Cereri Active"
          value={data.activeRequests.toString()}
          change="-8%"
          trend="down"
          icon="⚡"
        />
      </div>

      {/* Chart: Requests by Month */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-gray-800">Evoluție Cereri (Lunar)</h4>
          <span className="text-sm text-gray-600">
            Total: {data.requestsByMonth.reduce((sum, item) => sum + item.count, 0)} cereri
          </span>
        </div>
        
        {data.requestsByMonth.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="font-medium">Nicio cerere în perioada selectată</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Y-axis labels */}
            <div className="flex items-end justify-between h-64 gap-2">
              {/* Y-axis with grid lines */}
              <div className="flex flex-col justify-between h-full pr-2 text-xs text-gray-500 border-r border-gray-200">
                <span>{maxCount}</span>
                <span>{Math.floor(maxCount * 0.75)}</span>
                <span>{Math.floor(maxCount * 0.5)}</span>
                <span>{Math.floor(maxCount * 0.25)}</span>
                <span>0</span>
              </div>
              
              {/* Bars */}
              <div className="flex-1 flex items-end justify-between h-full gap-2 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 25, 50, 75, 100].map((_, idx) => (
                    <div key={idx} className="border-t border-gray-100 w-full"></div>
                  ))}
                </div>
                
                {data.requestsByMonth.map((item, idx) => {
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                  const minHeight = item.count > 0 ? 4 : 0 // Minimum visible height for non-zero values
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                      <div className="relative w-full h-full flex items-end justify-center">
                        <div
                          className="w-full max-w-[60px] bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg hover:from-purple-700 hover:to-purple-500 transition-all cursor-pointer group relative shadow-sm"
                          style={{ height: `${Math.max(height, minHeight)}%` }}
                        >
                          {/* Count label on top of bar */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <span className="text-xs font-semibold text-gray-800 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-sm">
                              {item.count}
                            </span>
                          </div>
                          
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                              <div className="font-semibold">{item.month}</div>
                              <div>{item.count} {item.count === 1 ? 'cerere' : 'cereri'}</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                              <div className="border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Month label */}
                      <span className="text-xs font-medium text-gray-700 mt-1">{item.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Types Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Distribuție după Tip Cerere</h4>
        <div className="space-y-4">
          {data.requestsByType.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.type}</span>
                <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    idx === 0
                      ? 'bg-purple-600'
                      : idx === 1
                      ? 'bg-blue-600'
                      : idx === 2
                      ? 'bg-green-600'
                      : 'bg-orange-600'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Exportă Rapoarte</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={handleExportExcel}
            className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
          >
            📄 Export Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          >
            📑 Export PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
          >
            📊 Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend === 'up'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}
