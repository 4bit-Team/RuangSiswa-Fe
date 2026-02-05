'use client'

import React, { useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'

interface ViolationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ViolationFormData) => void
  students: Array<{ id: number; name: string; className: string }>
}

export interface ViolationFormData {
  studentId: string
  type: 'Pelanggaran Ringan' | 'Pelanggaran Sedang' | 'Pelanggaran Berat'
  description: string
  consequence: string
  witness: string
  notes: string
}

const ViolationFormModal: React.FC<ViolationFormModalProps> = ({ isOpen, onClose, onSubmit, students }) => {
  const [formData, setFormData] = useState<ViolationFormData>({
    studentId: '',
    type: 'Pelanggaran Ringan',
    description: '',
    consequence: '',
    witness: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.studentId || !formData.description) {
      alert('Silakan isi siswa dan deskripsi pelanggaran')
      return
    }
    onSubmit(formData)
    setFormData({
      studentId: '',
      type: 'Pelanggaran Ringan',
      description: '',
      consequence: '',
      witness: '',
      notes: '',
    })
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
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-6 text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Catat Pelanggaran Baru</h2>
                <p className="text-pink-100 text-sm">Dokumentasikan pelanggaran siswa terhadap tata tertib</p>
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
            {/* Siswa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Siswa <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
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

            {/* Jenis Pelanggaran */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Pelanggaran</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              >
                <option value="Pelanggaran Ringan">Pelanggaran Ringan</option>
                <option value="Pelanggaran Sedang">Pelanggaran Sedang</option>
                <option value="Pelanggaran Berat">Pelanggaran Berat</option>
              </select>
            </div>

            {/* Deskripsi Pelanggaran */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi Pelanggaran <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan pelanggaran yang dilakukan siswa..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Hukuman/Konsekuensi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hukuman/Konsekuensi</label>
              <textarea
                value={formData.consequence}
                onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                placeholder="Jelaskan hukuman atau tindakan yang diberikan..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Saksi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Saksi (Guru/Staff)</label>
              <input
                type="text"
                value={formData.witness}
                onChange={(e) => setFormData({ ...formData, witness: e.target.value })}
                placeholder="Nama guru atau staf yang menjadi saksi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Tambahan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Catatan atau informasi tambahan..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 placeholder-gray-400"
              />
            </div>

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
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Catat Pelanggaran
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ViolationFormModal
