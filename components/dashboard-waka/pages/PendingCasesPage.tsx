'use client'

import { useEffect, useState } from 'react'
import { Eye, AlertCircle } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import DecisionModal from '../modals/DecisionModal'

interface PendingCase {
  id: number
  reservasi_id: number
  pembinaan_id: number
  reservasi: {
    studentId: number
    student: { fullName: string; kelas?: string }
  }
  pembinaan: {
    kasus: string
    tindak_lanjut: string
  }
  status: string
  created_at: string
}

export default function PendingCasesPage() {
  const [cases, setCases] = useState<PendingCase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<PendingCase | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPendingCases()
  }, [])

  const fetchPendingCases = async () => {
    try {
      const response = await apiRequest('/api/v1/pembinaan-waka/pending', 'GET')
      setCases(response.data || response)
    } catch (error) {
      console.error('Failed to fetch pending cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (caseData: PendingCase) => {
    setSelectedCase(caseData)
    setShowModal(true)
  }

  const handleDecisionSubmit = async (decision: 'sp3' | 'do', reason: string) => {
    if (!selectedCase) return

    try {
      await apiRequest(`/api/v1/pembinaan-waka/${selectedCase.id}/execute`, 'PATCH', {
        wak_decision: decision,
        decision_reason: reason,
      })

      // Refresh the list
      fetchPendingCases()
      setShowModal(false)
      setSelectedCase(null)

      // Show success message
      alert('Keputusan berhasil disimpan!')
    } catch (error) {
      console.error('Failed to submit decision:', error)
      alert('Gagal menyimpan keputusan')
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Kasus Menunggu Keputusan</h1>
        <p className="text-gray-600 mt-2">Daftar kasus yang memerlukan pengambilan keputusan dari WAKA</p>
      </div>

      {/* Statistics Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total Kasus Menunggu</p>
          <p className="text-2xl font-bold text-blue-600">{cases.length}</p>
        </div>
        <AlertCircle className="w-10 h-10 text-yellow-500" />
      </div>

      {/* Cases Table */}
      {cases.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Kasus</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tgl Ajukan</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.map((caseData) => (
                  <tr key={caseData.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {caseData.reservasi.student?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {caseData.reservasi.student?.kelas || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-block bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-xs">
                        {caseData.pembinaan?.kasus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(caseData.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(caseData)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        Lihat & Putuskan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Tidak ada kasus yang menunggu keputusan</p>
          <p className="text-sm text-gray-500 mt-2">Semua kasus pembinaan sudah ditangani</p>
        </div>
      )}

      {/* Decision Modal */}
      {selectedCase && (
        <DecisionModal
          isOpen={showModal}
          caseData={selectedCase}
          onClose={() => {
            setShowModal(false)
            setSelectedCase(null)
          }}
          onSubmit={handleDecisionSubmit}
        />
      )}
    </div>
  )
}
