'use client'

import React, { useState } from 'react'
import { UserPlus, Plus, X } from 'lucide-react'

interface AddTardinessModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: AddTardinessFormData) => void
  classes: string[]
  students: any[]
}

export interface AddTardinessFormData {
  studentId: string
  studentName: string
  className: string
  date: string
  time: string
  minutesLate: number
  reason: string
}

const AddTardinessModal: React.FC<AddTardinessModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  classes,
  students,
}) => {
  const [formData, setFormData] = useState<AddTardinessFormData>({
    studentId: '',
    studentName: '',
    className: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00',
    minutesLate: 5,
    reason: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    
    // Reset form
    setFormData({
      studentId: '',
      studentName: '',
      className: '',
      date: new Date().toISOString().split('T')[0],
      time: '07:00',
      minutesLate: 5,
      reason: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Tambah Siswa Terlambat</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
            <select
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value, studentId: '', studentName: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Pilih Kelas</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
            <select
              value={formData.studentId}
              onChange={(e) => {
                const selectedStudent = students.find((s) => s.id.toString() === e.target.value)
                if (selectedStudent) {
                  setFormData({
                    ...formData,
                    studentId: e.target.value,
                    studentName: selectedStudent.name,
                  })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Pilih Siswa</option>
              {students
                .filter((s) => !formData.className || s.className === formData.className)
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Masuk</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Terlambat (Menit)</label>
              <input
                type="number"
                value={formData.minutesLate}
                onChange={(e) => setFormData({ ...formData, minutesLate: Number(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alasan (Opsional)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Alasan siswa terlambat"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTardinessModal
