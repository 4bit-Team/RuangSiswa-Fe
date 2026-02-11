'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface DecisionModalProps {
  isOpen: boolean
  caseData: any
  onClose: () => void
  onSubmit: (decision: 'sp3' | 'do', reason: string) => void
}

export default function DecisionModal({ isOpen, caseData, onClose, onSubmit }: DecisionModalProps) {
  const [selectedDecision, setSelectedDecision] = useState<'sp3' | 'do' | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedDecision || !reason.trim()) {
      alert('Pilih keputusan dan masukkan alasan!')
      return
    }

    setLoading(true)
    try {
      await onSubmit(selectedDecision, reason)
    } catch (error) {
      console.error('Error submitting decision:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pengambilan Keputusan</h2>
            <p className="text-blue-100 text-sm mt-1">Putuskan tindak lanjut pembinaan siswa</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Case Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Detail Kasus</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-medium">Nama Siswa</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {caseData.reservasi.student?.fullName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Kelas</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {caseData.reservasi.student?.kelas || 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 font-medium">Kasus/Pelanggaran</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{caseData.pembinaan?.kasus || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 font-medium">Tindak Lanjut dari BK</p>
                <p className="text-sm text-gray-700 mt-1">{caseData.pembinaan?.tindak_lanjut || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Decision Options */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Pilih Keputusan</h3>
            <div className="space-y-3">
              {/* SP3 Option */}
              <button
                onClick={() => setSelectedDecision('sp3')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedDecision === 'sp3'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-1 ${
                    selectedDecision === 'sp3'
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">SP3 (Surat Peringatan 3)</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Memberikan surat peringatan terakhir kepada siswa
                    </p>
                  </div>
                </div>
              </button>

              {/* DO Option */}
              <button
                onClick={() => setSelectedDecision('do')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedDecision === 'do'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-1 ${
                    selectedDecision === 'do'
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">DO (Dropout)</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Mutasi/Putus sekolah dari lembaga pendidikan
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Alasan Pengambilan Keputusan
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan dari keputusan yang diambil..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-600 mt-2">* Alasan akan dikirimkan kepada siswa dan orang tua</p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">Perhatian</p>
              <p className="text-sm text-yellow-800 mt-1">
                Keputusan ini akan segera dikirimkan kepada siswa dan orang tua. Pastikan keputusan sudah benar sebelum menyimpan.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
           >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedDecision || !reason.trim() || loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? 'Memproses...' : 'Simpan Keputusan'}
          </button>
        </div>
      </div>
    </div>
  )
}
