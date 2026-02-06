'use client'

import React, { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'

interface SPRecord {
  id: number
  date: string
  reason: string
  level: 'SP1' | 'SP2' | 'SP3'
  description: string
}

interface SpFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SpFormData) => void
  students: Array<{ id: number; name: string; nisn: string; className: string; spHistory?: SPRecord[] }>
}

export interface SpFormData {
  studentId: string
  level: 'SP1' | 'SP2' | 'SP3'
  reason: string
  description: string
}

const SpFormModal: React.FC<SpFormModalProps> = ({ isOpen, onClose, onSubmit, students }) => {
  const [formData, setFormData] = useState<SpFormData>({
    studentId: '',
    level: 'SP1',
    reason: '',
    description: '',
  })
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null)

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const student = students.find(s => s.id.toString() === e.target.value)
    setSelectedStudent(student || null)
    setFormData({ ...formData, studentId: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.studentId) {
      alert('Pilih siswa terlebih dahulu')
      return
    }
    
    if (!formData.reason || !formData.description) {
      alert('Isian alasan dan deskripsi tidak boleh kosong')
      return
    }

    onSubmit(formData)
    setFormData({
      studentId: '',
      level: 'SP1',
      reason: '',
      description: '',
    })
    setSelectedStudent(null)
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6 text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Beri Surat Peringatan (SP)</h2>
                <p className="text-orange-100 text-sm">Dokumentasikan teguran tertulis untuk siswa</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Pilih Siswa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Siswa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={handleStudentChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              >
                <option value="">-- Pilih Siswa --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id.toString()}>
                    {student.name} ({student.className})
                  </option>
                ))}
              </select>
            </div>

            {/* Student Info */}
            {selectedStudent && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Nama Siswa</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">NISN</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.nisn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Kelas</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.className}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total SP</p>
                    <p className="font-semibold text-red-600">
                      {selectedStudent.spHistory?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Riwayat SP */}
            {selectedStudent && selectedStudent.spHistory && selectedStudent.spHistory.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Riwayat SP</h4>
                <div className="space-y-2">
                  {selectedStudent.spHistory.map((sp) => (
                    <div key={sp.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-orange-700">{sp.level}</span>
                        <span className="text-xs text-orange-600">{sp.date}</span>
                      </div>
                      <p className="text-sm text-orange-700">{sp.reason}</p>
                      <p className="text-xs text-orange-600 mt-1">{sp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStudent && (
              <>
                {/* Tingkat SP */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat SP</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                  >
                    <option value="SP1">SP 1 (Peringatan Pertama)</option>
                    <option value="SP2">SP 2 (Peringatan Kedua)</option>
                    <option value="SP3">SP 3 (Peringatan Ketiga)</option>
                  </select>
                </div>

                {/* Alasan SP */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alasan SP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Masukkan alasan pemberian SP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Deskripsi / Keterangan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi / Keterangan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan detail pelanggaran dan tindakan yang harus dilakukan..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </>
            )}

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 -mx-8 -mb-8 px-8 py-4 flex items-center justify-end gap-3 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!selectedStudent}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Beri SP
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default SpFormModal
