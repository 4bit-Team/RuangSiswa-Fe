'use client'

import React from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import BaseModal from './BaseModal'

interface TardinessDetailModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  time: string
  minutesLate: number
  reason?: string
}

const TardinessDetailModal: React.FC<TardinessDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  time,
  minutesLate,
  reason,
}) => {

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Keterlambatan"
      subtitle="Informasi lengkap keterlambatan siswa"
      width="max-w-2xl"
      headerGradient="bg-gradient-to-r from-orange-500 to-red-500"
      icon={<Clock className="w-6 h-6" />}
    >
      <div className="p-6 space-y-6">
        {/* Tardiness Info Card */}
        <div className="bg-orange-50 rounded-xl p-6 border-2 border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Durasi Terlambat</p>
              <p className="text-2xl font-bold text-orange-600">{minutesLate}m</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Jam Masuk</p>
              <p className="text-lg font-bold text-gray-900">{time}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                Tercatat
              </span>
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
            <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Alasan</p>
            <p className="text-sm text-gray-900">{reason}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-yellow-900 mb-1">ℹ️ Informasi</p>
            <p className="text-xs text-yellow-800">Keterlambatan lebih dari 5 kali akan dicatat dalam buku catatan perilaku.</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export default TardinessDetailModal
