'use client'

import React, { useState, useEffect } from 'react'
import { X, AlertTriangle, Calendar, FileText } from 'lucide-react'

interface ProblemStudent {
  id: number
  nis: string
  name: string
  class: string
  major: string
  category: 'Akademik' | 'Perilaku' | 'Kesehatan' | 'Sosial'
  problem: string
  letterWarning: number
  status: 'Dalam Pengawasan' | 'Butuh Bimbingan' | 'Mendapat SP'
  lastUpdate: string
  notes: string
}

interface ProblemStudentModalProps {
  isOpen: boolean
  onClose: () => void
  student: ProblemStudent
}

const ProblemStudentModal: React.FC<ProblemStudentModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [adminNotes, setAdminNotes] = useState(student?.notes ?? '')
  const [status, setStatus] = useState(student?.status ?? 'Dalam Pengawasan')
  const [letterWarning, setLetterWarning] = useState(student?.letterWarning ?? 0)

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
          <h2 className="text-xl font-bold text-gray-900">Detail Siswa Bermasalah</h2>
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
                <p className="text-sm font-medium text-gray-900">{student.nis}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nama</label>
                <p className="text-sm font-medium text-gray-900">{student.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kelas</label>
                <p className="text-sm font-medium text-gray-900">{student.class}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Jurusan</label>
                <p className="text-sm font-medium text-gray-900">{student.major}</p>
              </div>
            </div>
          </div>

          {/* Problem Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Detail Masalah</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kategori Masalah</label>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                  {student.category}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Deskripsi Masalah</label>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-gray-700">{student.problem}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Terakhir Diperbarui</label>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(student.lastUpdate).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Manajemen Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Status Siswa</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Dalam Pengawasan">Dalam Pengawasan</option>
                  <option value="Butuh Bimbingan">Butuh Bimbingan</option>
                  <option value="Mendapat SP">Mendapat SP</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Jumlah SP</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLetterWarning(Math.max(0, letterWarning - 1))}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={letterWarning}
                    onChange={(e) => setLetterWarning(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
                  />
                  <button
                    onClick={() => setLetterWarning(letterWarning + 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Catatan Pembinaan & Tindakan</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Dokumentasikan pembinaan, konseling, atau tindakan yang sudah dilakukan..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={5}
            />
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Tindakan Cepat</p>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                📞 Hubungi Orang Tua
              </button>
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                📋 Cetak SP
              </button>
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                👤 Rujuk ke BK
              </button>
              <button className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                📧 Kirim Email
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemStudentModal
