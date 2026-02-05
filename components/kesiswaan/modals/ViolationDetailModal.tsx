'use client'

import React from 'react'
import { X, User, Calendar, FileText, Gavel, Eye, StickyNote } from 'lucide-react'

interface ViolationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  violationType?: 'Pelanggaran Ringan' | 'Pelanggaran Sedang' | 'Pelanggaran Berat'
  description?: string
  consequence?: string
  date?: string
  studentName?: string
  witness?: string
  notes?: string
}

const ViolationDetailModal: React.FC<ViolationDetailModalProps> = ({
  isOpen,
  onClose,
  violationType = 'Pelanggaran Ringan',
  description = '',
  consequence = '',
  date = '',
  studentName = '',
  witness,
  notes,
}) => {
  if (!isOpen) return null

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Pelanggaran Ringan':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'Pelanggaran Sedang':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'Pelanggaran Berat':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Pelanggaran Ringan':
        return '⚠️'
      case 'Pelanggaran Sedang':
        return '⚠️⚠️'
      case 'Pelanggaran Berat':
        return '🚫'
      default:
        return '⚠️'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`sticky top-0 ${getTypeColor(violationType)} border-b px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon(violationType)}</span>
              <div>
                <h2 className="text-xl font-bold">Detail Pelanggaran</h2>
                <p className="text-sm opacity-80">{violationType}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Informasi Siswa</h3>
            </div>
            <p className="text-lg font-medium text-gray-900 ml-8">{studentName || '-'}</p>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Tanggal Kejadian</h3>
              <p className="text-gray-700">
                {date ? new Date(date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : '-'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Deskripsi Pelanggaran</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                {description || '-'}
              </p>
            </div>
          </div>

          {/* Consequence */}
          <div className="flex items-start gap-3">
            <Gavel className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Hukuman/Konsekuensi</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                {consequence || '-'}
              </p>
            </div>
          </div>

          {/* Witness */}
          {witness && (
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Saksi</h3>
                <p className="text-gray-700">{witness}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="flex items-start gap-3">
              <StickyNote className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Catatan Tambahan</h3>
                <p className="text-gray-700 bg-yellow-50 rounded-lg p-3 border border-yellow-200 italic">
                  {notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViolationDetailModal