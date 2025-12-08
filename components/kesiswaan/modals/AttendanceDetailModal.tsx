'use client'

import React, { useState } from 'react'
import { Calendar, Clock, AlertCircle, Send } from 'lucide-react'
import BaseModal from './BaseModal'

interface AttendanceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  attendanceDate: string
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
  time?: string
  notes?: string
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  attendanceDate,
  status,
  time,
  notes,
}) => {
  const [reportReason, setReportReason] = useState('')
  const [reportType, setReportType] = useState<'izin' | 'sakit'>('sakit')

  const statusColor: Record<string, { bg: string; text: string; icon: string }> = {
    'Hadir': { bg: 'bg-green-50', text: 'text-green-700', icon: '✓' },
    'Sakit': { bg: 'bg-orange-50', text: 'text-orange-700', icon: '🤒' },
    'Izin': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '📋' },
    'Alpa': { bg: 'bg-red-50', text: 'text-red-700', icon: '❌' },
  }

  const config = statusColor[status] || statusColor['Hadir']
  const formattedDate = new Date(attendanceDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ reportType, reportReason })
    alert('Laporan telah dikirim. Menunggu persetujuan dari guru piket.')
    setReportReason('')
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Kehadiran"
      subtitle="Informasi lengkap kehadiran Anda"
      width="max-w-2xl"
      headerGradient="bg-gradient-to-r from-blue-500 to-cyan-500"
      icon={<Calendar className="w-6 h-6" />}
    >
      <div className="p-6 space-y-6">
        {/* Status Card */}
        <div className={`${config.bg} rounded-xl p-6 border-2 border-gray-200`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{config.icon}</div>
            <div>
              <p className={`text-sm text-gray-600 mb-1`}>Status Kehadiran</p>
              <p className={`text-2xl font-bold ${config.text}`}>{status}</p>
            </div>
          </div>
        </div>

        {/* Date and Time Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600 font-semibold uppercase">Tanggal</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600 font-semibold uppercase">Waktu Masuk</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{time || 'Tidak tercatat'}</p>
          </div>
        </div>

        {/* Notes Section */}
        {notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Keterangan</p>
            <p className="text-sm text-gray-900">{notes}</p>
          </div>
        )}

        {/* Report/Appeal Section - Only show if status is Alpa or Izin */}
        {(status === 'Alpa' || status === 'Izin') && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Ajukan Perubahan Status
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubah Status Menjadi</label>
                <div className="space-y-2">
                  {['sakit', 'izin'].map((type) => (
                    <label key={type} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="reportType"
                        value={type}
                        checked={reportType === type}
                        onChange={(e) => setReportType(e.target.value as 'sakit' | 'izin')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">{type === 'sakit' ? 'Sakit' : 'Izin'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alasan</label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Jelaskan alasan perubahan status kehadiran Anda..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  💡 Perubahan status memerlukan persetujuan dari guru piket. Pastikan alasan Anda jelas dan lengkap.
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-800">
            ✓ Data kehadiran Anda tercatat otomatis dalam sistem. Jika ada kesalahan, hubungi guru piket untuk verifikasi.
          </p>
        </div>
      </div>
    </BaseModal>
  )
}

export default AttendanceDetailModal
