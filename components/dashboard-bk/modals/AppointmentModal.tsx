'use client'

import React from 'react'
import { X } from 'lucide-react'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    studentName: '',
    preferredDate: '',
    preferredTime: '',
    counselor: '',
    room: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      studentName: '',
      preferredDate: '',
      preferredTime: '',
      counselor: '',
      room: '',
      notes: '',
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
              <h2 className="text-2xl font-bold">Buat Janji Temu</h2>
              <p className="text-blue-100 text-sm mt-1">Jadwalkan janji temu dengan konselor</p>
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

              {/* Tanggal dan Jam */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam
                  </label>
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Konselor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Konselor
                </label>
                <select
                  name="counselor"
                  value={formData.counselor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Konselor</option>
                  <option value="bu-sarah">Bu Sarah</option>
                  <option value="pak-budi">Pak Budi</option>
                  <option value="bu-rina">Bu Rina</option>
                </select>
              </div>

              {/* Ruangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ruangan
                </label>
                <select
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Ruangan</option>
                  <option value="ruang-bk-1">Ruang BK 1</option>
                  <option value="ruang-bk-2">Ruang BK 2</option>
                  <option value="ruang-bk-3">Ruang BK 3</option>
                </select>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Masukkan catatan tambahan..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  Buat Janji
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppointmentModal
