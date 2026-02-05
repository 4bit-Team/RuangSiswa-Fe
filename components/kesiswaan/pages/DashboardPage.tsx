'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, TrendingUp, Activity, Award, Search, ChevronRight, Eye, AlertCircle, CheckCircle } from 'lucide-react'
import DashboardFormModal from '../modals/DashboardFormModal'

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
}

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  rplStudents: number
  tkjStudents: number
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; trend?: string }> = ({
  icon,
  label,
  value,
  color,
  trend,
}) => (
  <div className={`${color} rounded-xl p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {trend && <p className="text-xs text-white/70 mt-2">{trend}</p>}
      </div>
      <div className="text-white/40">{icon}</div>
    </div>
  </div>
)

const StatusBadge: React.FC<{ status: 'Aktif' | 'Nonaktif' }> = ({ status }) => {
  const isActive = status === 'Aktif'
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
      {status}
    </span>
  )
}

const GuidanceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Normal': { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
    'Peringatan': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <AlertCircle className="w-3 h-3" /> },
    'Perlu Tindak Lanjut': { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
  }

  const config = statusConfig[status] || statusConfig['Normal']

  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  )
}

const DashboardPage: React.FC = () => {
  const [students, setStudents] = useState<DashboardItem[]>([
    {
      id: 1,
      studentName: 'Ahmad Ridho Pratama',
      nisn: '0031234567',
      className: 'XI-RPL-A',
      jurusan: 'RPL',
      status: 'Aktif',
      phoneNumber: '085123456789',
      dateOfBirth: '2007-05-15',
      address: 'Jl. Merdeka No. 45, Jakarta Selatan',
      parentName: 'Budi Pratama',
      parentPhone: '081234567890',
      totalAttendance: 95,
      totalTardiness: 3,
      totalViolations: 0,
      guidanceStatus: 'Normal',
    },
    {
      id: 2,
      studentName: 'Siti Nurhaliza',
      nisn: '0031234568',
      className: 'XI-TKJ-B',
      jurusan: 'TKJ',
      status: 'Aktif',
      phoneNumber: '085234567890',
      dateOfBirth: '2007-08-22',
      address: 'Jl. Ahmad Yani No. 12, Bandung',
      parentName: 'Heru Wijaya',
      parentPhone: '081345678901',
      totalAttendance: 85,
      totalTardiness: 8,
      totalViolations: 1,
      guidanceStatus: 'Peringatan',
    },
    {
      id: 3,
      studentName: 'Budi Santoso',
      nisn: '0031234569',
      className: 'XI-MM-C',
      jurusan: 'MM',
      status: 'Aktif',
      phoneNumber: '085345678901',
      dateOfBirth: '2007-03-10',
      address: 'Jl. Sudirman No. 88, Tangerang',
      parentName: 'Suyanto',
      parentPhone: '081456789012',
      totalAttendance: 92,
      totalTardiness: 4,
      totalViolations: 0,
      guidanceStatus: 'Normal',
    },
  ])

  const [filteredStudents, setFilteredStudents] = useState<DashboardItem[]>(students)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [selectedStudent, setSelectedStudent] = useState<DashboardItem | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Update filtered students when search term changes
  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nisn.includes(searchTerm) ||
        student.className.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredStudents(filtered)
    setCurrentPage(1)
  }, [searchTerm, students])

  // Calculate stats
  const stats: DashboardStats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'Aktif').length,
    rplStudents: students.filter((s) => s.jurusan === 'RPL').length,
    tkjStudents: students.filter((s) => s.jurusan === 'TKJ').length,
  }

  const handleAddClick = () => {
    setFormMode('add')
    setSelectedStudent(undefined)
    setIsFormOpen(true)
  }

  const handleEditClick = (student: DashboardItem) => {
    setFormMode('edit')
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setStudents((prev) => prev.filter((student) => student.id !== id))
    }
  }

  const handleFormSubmit = (data: DashboardItem) => {
    if (formMode === 'add') {
      setStudents((prev) => [...prev, data])
    } else {
      setStudents((prev) => prev.map((student) => (student.id === data.id ? data : student)))
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Main Card Container */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Dashboard Kesiswaan</h2>
              <p className="text-pink-50">Kelola data siswa dan pantau status kesiswaan secara real-time</p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-all hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Tambah Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-12 h-12" />}
            label="Total Siswa"
            value={stats.totalStudents}
            color="bg-gradient-to-br from-blue-400 to-blue-600"
          />
          <StatCard
            icon={<Activity className="w-12 h-12" />}
            label="Siswa Aktif"
            value={stats.activeStudents}
            color="bg-gradient-to-br from-green-400 to-green-600"
            trend={`${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% dari total`}
          />
          <StatCard
            icon={<Award className="w-12 h-12" />}
            label="Status Normal"
            value={students.filter((s) => s.guidanceStatus === 'Normal').length}
            color="bg-gradient-to-br from-emerald-400 to-emerald-600"
          />
          <StatCard
            icon={<TrendingUp className="w-12 h-12" />}
            label="Perlu Perhatian"
            value={students.filter((s) => s.guidanceStatus !== 'Normal').length}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
          />
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data siswa</h3>
              <p className="text-gray-600 mb-6">Mulai tambahkan data siswa untuk melihatnya di sini</p>
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambah Data Pertama
              </button>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Siswa</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NISN / Kelas</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Monitoring</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bimbingan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-xs text-gray-500">{student.parentName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{student.nisn}</div>
                        <div className="text-xs text-gray-600">{student.className}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-gray-700">📍 H: <span className="font-semibold">{student.totalAttendance}%</span></div>
                          <div className="text-gray-700">⏰ T: <span className="font-semibold">{student.totalTardiness}x</span></div>
                          <div className="text-gray-700">⚠️  P: <span className="font-semibold">{student.totalViolations}x</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <GuidanceStatusBadge status={student.guidanceStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            title="Detail"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} hingga {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari{' '}
                    {filteredStudents.length} data
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-purple-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Box */}
        <section className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Panduan Penggunaan Dashboard</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Klik tombol "Tambah Data" untuk menambahkan data siswa baru</li>
              <li>• Gunakan fitur pencarian untuk menemukan siswa berdasarkan nama, NISN, atau kelas</li>
              <li>• Klik ikon edit untuk mengubah data siswa</li>
              <li>• Klik ikon hapus untuk menghapus data siswa (dengan konfirmasi)</li>
              <li>• Data yang ditampilkan dapat difilter dan dipaginate untuk kemudahan navigasi</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Form Modal (grouped, render only when open) */}
      {isFormOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          {(formMode === 'add' || selectedStudent) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <DashboardFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                mode={formMode}
                data={selectedStudent}
                onSubmit={handleFormSubmit}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DashboardPage
