'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    reportType: '',
    studentName: '',
    category: '',
    description: '',
    status: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      title: '',
      reportType: '',
      studentName: '',
      category: '',
      description: '',
      status: '',
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold">Buat Laporan</h2>
              <p className="text-blue-100 text-sm mt-1">Buat laporan konseling siswa</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Judul Laporan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Laporan
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Masukkan judul laporan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Jenis Laporan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Laporan
                </label>
                <select
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Jenis Laporan</option>
                  <option value="konseling">Konseling</option>
                  <option value="progress">Progress</option>
                  <option value="insiden">Insiden</option>
                  <option value="evaluasi">Evaluasi</option>
                </select>
              </div>

              {/* Nama Siswa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Siswa
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Masukkan nama siswa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="akademik">Akademik</option>
                  <option value="sosial">Sosial</option>
                  <option value="keluarga">Keluarga</option>
                  <option value="karir">Karir</option>
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Masukkan deskripsi laporan..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReportModal
