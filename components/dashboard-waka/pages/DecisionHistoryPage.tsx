'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Eye } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface DecisionHistory {
  id: number
  reservasi: {
    student: { fullName: string; kelas?: string }
  }
  pembinaan: {
    kasus: string
  }
  wak_decision: 'sp3' | 'do'
  decision_reason: string
  student_acknowledged: boolean
  status: string
  decision_date: string
}

export default function DecisionHistoryPage() {
  const [decisions, setDecisions] = useState<DecisionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sp3' | 'do'>('all')

  useEffect(() => {
    fetchDecisionHistory()
  }, [])

  const fetchDecisionHistory = async () => {
    try {
      const response = await apiRequest('/api/v1/pembinaan-waka', 'GET')
      setDecisions(response.data || response)
    } catch (error) {
      console.error('Failed to fetch decision history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDecisions = decisions.filter((d) => {
    if (filter === 'all') return d.status === 'executed'
    return d.status === 'executed' && d.wak_decision === filter
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Keputusan</h1>
        <p className="text-gray-600 mt-2">Daftar keputusan yang telah dibuat dan dijalankan</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Semua ({decisions.filter((d) => d.status === 'executed').length})
        </button>
        <button
          onClick={() => setFilter('sp3')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'sp3'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          SP3 ({decisions.filter((d) => d.wak_decision === 'sp3' && d.status === 'executed').length})
        </button>
        <button
          onClick={() => setFilter('do')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'do'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          DO ({decisions.filter((d) => d.wak_decision === 'do' && d.status === 'executed').length})
        </button>
      </div>

      {/* Decisions Table */}
      {filteredDecisions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Kasus</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Keputusan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Alasan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tgl Putus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDecisions.map((decision) => (
                  <tr key={decision.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {decision.reservasi.student?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {decision.pembinaan?.kasus || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          decision.wak_decision === 'sp3'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {decision.wak_decision === 'sp3' ? 'SP3' : 'DO (Dropout)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{decision.decision_reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(decision.decision_date).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada riwayat keputusan</p>
        </div>
      )}
    </div>
  )
}
