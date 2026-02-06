'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import BaseModal from './BaseModal'

interface ProblemRecord {
  id: number
  category: 'Presensi' | 'Disiplin' | 'Akademik'
  description: string
  referenceFrom: string
  problemType: 'Attendance' | 'Discipline' | 'Academic'
  dateReported: string
  resolutionStatus: 'Tuntas' | 'Tidak Tuntas'
  guidanceHistory: Array<{
    id: number
    date: string
    counselor: string
    notes: string
  }>
  followUpActions: Array<{
    id: number
    type: 'Pangilan Orang Tua' | 'Home Visit' | 'Konferensi Kasus'
    date: string
    description: string
    result: string
    status: 'Terjadwal' | 'Selesai' | 'Ditunda'
  }>
  referralStatus?: 'Belum' | 'Dirujuk' | 'Ditangani Ahli'
}

interface DashboardItem {
  id: number
  studentName: string
  nisn: string
  className: string
  jurusan: string
  status: 'Aktif' | 'Nonaktif'
  phoneNumber: string
  dateOfBirth: string
  address: string
  parentName: string
  parentPhone: string
  totalAttendance: number
  totalTardiness: number
  totalViolations: number
  guidanceStatus: 'Normal' | 'Peringatan' | 'Perlu Tindak Lanjut'
  problemRecords: ProblemRecord[]
}

interface DashboardFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  data?: DashboardItem
  onSubmit: (data: DashboardItem) => void
}

const DashboardFormModal: React.FC<DashboardFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  data,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Omit<DashboardItem, 'id'>>({
    studentName: '',
    nisn: '',
    className: '',
    jurusan: '',
    status: 'Aktif',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    parentName: '',
    parentPhone: '',
    totalAttendance: 0,
    totalTardiness: 0,
    totalViolations: 0,
    guidanceStatus: 'Normal',
    problemRecords: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === 'edit' && data) {
      setFormData({
        studentName: data.studentName,
        nisn: data.nisn,
        className: data.className,
        jurusan: data.jurusan,
        status: data.status,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        totalAttendance: data.totalAttendance,
        totalTardiness: data.totalTardiness,
        totalViolations: data.totalViolations,
        guidanceStatus: data.guidanceStatus,
        problemRecords: data.problemRecords || [],
      })
    } else {
      setFormData({
        studentName: '',
        nisn: '',
        className: '',
        jurusan: '',
        status: 'Aktif',
        phoneNumber: '',
        dateOfBirth: '',
        address: '',
        parentName: '',
        parentPhone: '',
        totalAttendance: 0,
        totalTardiness: 0,
        totalViolations: 0,
        guidanceStatus: 'Normal',
        problemRecords: [],
      })
    }
    setErrors({})
  }, [mode, data, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Nama siswa harus diisi'
    }
    if (!formData.nisn.trim()) {
      newErrors.nisn = 'NISN harus diisi'
    } else if (!/^\d{10}$/.test(formData.nisn)) {
      newErrors.nisn = 'NISN harus 10 digit'
    }
    if (!formData.className.trim()) {
      newErrors.className = 'Kelas harus diisi'
    }
    if (!formData.jurusan.trim()) {
      newErrors.jurusan = 'Jurusan harus diisi'
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor telepon harus diisi'
    } else if (!/^(\+62|0)[0-9]{9,12}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = 'Nomor telepon tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      id: data?.id || Date.now(),
      ...formData,
    })

    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Tambah Data Siswa' : 'Edit Data Siswa'}
      subtitle={mode === 'add' ? 'Tambahkan siswa baru ke dalam sistem' : 'Perbarui informasi siswa'}
      width="max-w-2xl"
      headerGradient="bg-gradient-to-r from-purple-500 to-pink-500"
      icon={mode === 'add' ? <Plus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Siswa */}
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Siswa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Masukkan nama siswa"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.studentName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
            {errors.studentName && <p className="text-xs text-red-600 mt-1">{errors.studentName}</p>}
          </div>

          {/* NISN */}
          <div>
            <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-2">
              NISN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nisn"
              name="nisn"
              value={formData.nisn}
              onChange={handleChange}
              placeholder="Masukkan NISN (10 digit)"
              maxLength={10}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.nisn ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
            {errors.nisn && <p className="text-xs text-red-600 mt-1">{errors.nisn}</p>}
          </div>

          {/* Kelas */}
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
              Kelas <span className="text-red-500">*</span>
            </label>
            <select
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.className ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            >
              <option value="">Pilih Kelas</option>
              <option value="X-A">X-A</option>
              <option value="X-B">X-B</option>
              <option value="X-C">X-C</option>
              <option value="XI-A">XI-A</option>
              <option value="XI-B">XI-B</option>
              <option value="XI-C">XI-C</option>
              <option value="XII-A">XII-A</option>
              <option value="XII-B">XII-B</option>
              <option value="XII-C">XII-C</option>
            </select>
            {errors.className && <p className="text-xs text-red-600 mt-1">{errors.className}</p>}
          </div>

          {/* Jurusan */}
          <div>
            <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700 mb-2">
              Jurusan <span className="text-red-500">*</span>
            </label>
            <select
              id="jurusan"
              name="jurusan"
              value={formData.jurusan}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.jurusan ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            >
              <option value="">Pilih Jurusan</option>
              <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
              <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
              <option value="MM">MM (Multimedia)</option>
              <option value="BDP">BDP (Bisnis Daring dan Pemasaran)</option>
            </select>
            {errors.jurusan && <p className="text-xs text-red-600 mt-1">{errors.jurusan}</p>}
          </div>

          {/* Nomor Telepon */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Masukkan nomor telepon"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
            {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Tanggal Lahir */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Lahir
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Nama Orang Tua */}
          <div>
            <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Orang Tua
            </label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              placeholder="Masukkan nama orang tua/wali"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Nomor Orang Tua */}
          <div>
            <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Orang Tua
            </label>
            <input
              type="tel"
              id="parentPhone"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              placeholder="Masukkan nomor telepon orang tua"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Alamat - Full Width */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Alamat
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => {
              setFormData((prev) => ({...prev, address: e.target.value}))
            }}
            placeholder="Masukkan alamat lengkap siswa"
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            💡 Pastikan semua data yang Anda masukkan akurat. Data ini akan digunakan untuk keperluan administrasi dan pelaporan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            {mode === 'add' ? 'Tambah Data' : 'Perbarui Data'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default DashboardFormModal
