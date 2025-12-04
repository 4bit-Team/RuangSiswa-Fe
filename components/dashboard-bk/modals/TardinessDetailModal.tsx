'use client'

import React, { useState, useEffect } from 'react'
import { X, Clock, Download, MessageSquare } from 'lucide-react'

interface TardinessRecord {
  id: number
  nis: string
  name: string
  class: string
  major: string
  date: string
  time: string
  minutesLate: number
  reason: string
  frequency: number
  status: 'Tercatat' | 'Termaafkan'
}

interface TardinessDetailModalProps {
  isOpen: boolean
  onClose: () => void
  tardiness: TardinessRecord
}

const TardinessDetailModal: React.FC<TardinessDetailModalProps> = ({
  isOpen,
  onClose,
  tardiness,
}) => {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Keterlambatan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Siswa</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">NIS</label>
                <p className="text-sm font-medium text-gray-900">{tardiness.nis}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nama</label>
                <p className="text-sm font-medium text-gray-900">{tardiness.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kelas</label>
                <p className="text-sm font-medium text-gray-900">{tardiness.class}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Jurusan</label>
                <p className="text-sm font-medium text-gray-900">{tardiness.major}</p>
              </div>
            </div>
          </div>

          {/* Tardiness Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Detail Keterlambatan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tanggal</label>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(tardiness.date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Waktu Datang</label>
                <p className="text-sm font-medium text-gray-900">{tardiness.time}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Terlambat</label>
                <p className="text-sm font-medium text-orange-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {tardiness.minutesLate} menit
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Frekuensi</label>
                <p className={`text-sm font-medium ${tardiness.frequency > 5 ? 'text-red-600' : 'text-orange-600'}`}>
                  {tardiness.frequency}x (Bulan Ini)
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Alasan Terlambat</label>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-gray-700">{tardiness.reason}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
            <select
              defaultValue={tardiness.status}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Tercatat">Tercatat</option>
              <option value="Termaafkan">Termaafkan</option>
            </select>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Catatan Admin</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan atau tindakan yang diambil..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TardinessDetailModal
