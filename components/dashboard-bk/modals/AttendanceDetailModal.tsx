'use client'

import React, { useState } from 'react'
import { X, Calendar, Users, TrendingUp, Download } from 'lucide-react'

interface AttendanceMonth {
  id: number
  minggu: number
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpa: number
  persentase: number
  inputDate: string
}

interface AttendanceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  attendance: AttendanceMonth
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  attendance,
}) => {
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    hadir: attendance?.hadir ?? 0,
    sakit: attendance?.sakit ?? 0,
    izin: attendance?.izin ?? 0,
    alpa: attendance?.alpa ?? 0,
  })

  if (!isOpen) return null

  const handleInputChange = (field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculatePercentage = () => {
    const total = formData.hadir + formData.sakit + formData.izin + formData.alpa
    return total > 0 ? Math.round((formData.hadir / total) * 100) : 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Data Kehadiran Minggu {attendance?.minggu ?? 0}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Siswa</p>
                  <p className="text-2xl font-bold text-blue-600">{attendance?.totalSiswa ?? 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Persentase Hadir</p>
                  <p className="text-2xl font-bold text-green-600">{editMode ? calculatePercentage() : (attendance?.persentase ?? 0)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Attendance Data */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Data Kehadiran</h3>
            <div className="space-y-4">
              {/* Hadir */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Hadir</p>
                  <p className="text-xs text-gray-500 mt-1">Siswa yang hadir sesuai jadwal</p>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={formData.hadir}
                    onChange={(e) => handleInputChange('hadir', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right font-semibold"
                  />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{formData.hadir}</p>
                )}
              </div>

              {/* Sakit */}
              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Sakit</p>
                  <p className="text-xs text-gray-500 mt-1">Siswa yang tidak hadir karena sakit</p>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={formData.sakit}
                    onChange={(e) => handleInputChange('sakit', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right font-semibold"
                  />
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">{formData.sakit}</p>
                )}
              </div>

              {/* Izin */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Izin</p>
                  <p className="text-xs text-gray-500 mt-1">Siswa yang tidak hadir karena izin</p>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={formData.izin}
                    onChange={(e) => handleInputChange('izin', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right font-semibold"
                  />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{formData.izin}</p>
                )}
              </div>

              {/* Alpa */}
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Alpa</p>
                  <p className="text-xs text-gray-500 mt-1">Siswa yang tidak hadir tanpa keterangan</p>
                </div>
                {editMode ? (
                  <input
                    type="number"
                    value={formData.alpa}
                    onChange={(e) => handleInputChange('alpa', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-right font-semibold"
                  />
                ) : (
                  <p className="text-2xl font-bold text-red-600">{formData.alpa}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Tanggal Input</p>
              <p className="text-sm font-medium text-gray-900">
                {attendance?.inputDate ? new Date(attendance.inputDate).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : '-'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Total Siswa Dicatat</p>
              <p className="text-sm font-medium text-gray-900">
                {formData.hadir + formData.sakit + formData.izin + formData.alpa}
              </p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <p className="text-sm font-semibold text-gray-700">Akurasi Data</p>
              <p className={`text-sm font-semibold ${
                (formData.hadir + formData.sakit + formData.izin + formData.alpa) === (attendance?.totalSiswa ?? 0)
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}>
                {(formData.hadir + formData.sakit + formData.izin + formData.alpa) === (attendance?.totalSiswa ?? 0)
                  ? '✓ Sesuai'
                  : '⚠ Tidak Sesuai'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Tutup
            </button>
            {editMode && (
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Batal Edit
              </button>
            )}
            <button
              onClick={() => {
                if (editMode) {
                  setEditMode(false)
                } else {
                  setEditMode(true)
                }
              }}
              className={`flex-1 px-4 py-2 rounded-lg hover:shadow-lg transition-all font-medium ${
                editMode
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              }`}
            >
              {editMode ? 'Simpan Perubahan' : 'Edit Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceDetailModal
