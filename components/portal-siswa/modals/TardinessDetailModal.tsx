'use client'

import React, { useState } from 'react'
import { Clock, AlertCircle, Upload, FileText } from 'lucide-react'
import BaseModal from './BaseModal'

interface TardinessDetailModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  time: string
  minutesLate: number
  reason?: string
  status: 'Tercatat' | 'Termaafkan'
}

const TardinessDetailModal: React.FC<TardinessDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  time,
  minutesLate,
  reason,
  status,
}) => {
  const [appealReason, setAppealReason] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statusConfig = {
    'Tercatat': { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100' },
    'Termaafkan': { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  }

  const config = statusConfig[status]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      console.log({ appealReason, attachmentFile })
      alert('Banding keterlambatan telah dikirim. Menunggu persetujuan dari guru piket.')
      setAppealReason('')
      setAttachmentFile(null)
      setIsSubmitting(false)
      onClose()
    }, 1000)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Keterlambatan"
      subtitle="Informasi dan opsi banding keterlambatan"
      width="max-w-2xl"
      headerGradient="bg-gradient-to-r from-orange-500 to-red-500"
      icon={<Clock className="w-6 h-6" />}
    >
      <div className="p-6 space-y-6">
        {/* Status Card */}
        <div className={`${config.bg} rounded-xl p-6 border-2 border-gray-200`}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.badge}`}>
                {status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Durasi Terlambat</p>
              <p className={`text-2xl font-bold ${config.text}`}>{minutesLate}m</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Jam Masuk</p>
              <p className="text-lg font-bold text-gray-900">{time}</p>
            </div>
          </div>
        </div>

        {/* Date and Details */}
        <div>
          <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Tanggal</p>
          <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
        </div>

        {/* Reason */}
        {reason && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Alasan Tercatat</p>
            <p className="text-sm text-gray-900">{reason}</p>
          </div>
        )}

        {/* Important Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-yellow-900 mb-1">ℹ️ Informasi Keterlambatan</p>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Keterlambatan lebih dari 5 kali akan dicatat dalam buku catatan perilaku</li>
              <li>• Anda dapat mengajukan banding jika merasa ada kesalahan</li>
              <li>• Banding memerlukan bukti/dokumen pendukung</li>
            </ul>
          </div>
        </div>

        {/* Appeal Section */}
        {status === 'Tercatat' && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Ajukan Banding Keterlambatan
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Banding</label>
                <textarea
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Jelaskan alasan Anda terlambat dan mengapa perlu dipertimbangkan kembali..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bukti Pendukung (Opsional)</label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {attachmentFile ? attachmentFile.name : 'Klik untuk upload bukti (PDF, JPG, PNG)'}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  💡 Banding yang disertai dengan bukti dokumentasi memiliki kemungkinan lebih tinggi untuk diterima.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Banding'}
                </button>
              </div>
            </form>
          </div>
        )}

        {status === 'Termaafkan' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✓ Keterlambatan Anda telah dimaafkan. Tidak perlu mengajukan banding lebih lanjut.
            </p>
          </div>
        )}
      </div>
    </BaseModal>
  )
}

export default TardinessDetailModal
