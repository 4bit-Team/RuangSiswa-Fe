'use client'

import React, { useState, useMemo } from 'react'
import { AlertTriangle, Plus, Trash2, Filter, Eye, AlertCircle } from 'lucide-react'
import ViolationDetailModal from '../modals/ViolationDetailModal'
import ViolationFormModal from '../modals/ViolationFormModal'

interface Student {
  id: number
  name: string
  nisn: string
  className: string
}

interface ViolationRecord {
  id: number
  studentId: number
  studentName: string
  nisn: string
  className: string
  date: string
  type: 'Pelanggaran Ringan' | 'Pelanggaran Sedang' | 'Pelanggaran Berat'
  description: string
  consequence: string
  witness?: string
  notes?: string
}

interface ViolationStats {
  totalViolations: number
  lightViolations: number
  mediumViolations: number
  severeViolations: number
}

const ViolationTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const typeConfig: Record<string, { bg: string; text: string; icon: string }> = {
    'Pelanggaran Ringan': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '⚠️' },
    'Pelanggaran Sedang': { bg: 'bg-orange-50', text: 'text-orange-700', icon: '⚠️⚠️' },
    'Pelanggaran Berat': { bg: 'bg-red-50', text: 'text-red-700', icon: '🚫' },
  }

  const config = typeConfig[type] || typeConfig['Pelanggaran Ringan']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon} {type}
    </span>
  )
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <div className={`${color} rounded-xl p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-white/40">{icon}</div>
    </div>
  </div>
)

const PelanggaranPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecord | undefined>()
  const [violations, setViolations] = useState<ViolationRecord[]>([
    {
      id: 1,
      studentId: 1,
      studentName: 'Ahmad Ridho Pratama',
      nisn: '0031234567',
      className: 'XI-A',
      date: '2025-01-30',
      type: 'Pelanggaran Ringan',
      description: 'Tidak mengerjakan PR',
      consequence: 'Teguran lisan',
      witness: 'Bapak Suryanto',
      notes: 'Siswa lupa membawa buku PR',
    },
    {
      id: 2,
      studentId: 2,
      studentName: 'Siti Nurhaliza',
      nisn: '0031234568',
      className: 'XI-A',
      date: '2025-01-28',
      type: 'Pelanggaran Sedang',
      description: 'Berbicara tidak sopan kepada guru',
      consequence: 'Peringatan tertulis',
      witness: 'Bu Sarah Wijaya',
      notes: 'Diajak konsultasi dengan BK',
    },
    {
      id: 3,
      studentId: 3,
      studentName: 'Budi Santoso',
      nisn: '0031234569',
      className: 'XI-B',
      date: '2025-01-25',
      type: 'Pelanggaran Ringan',
      description: 'Memakai seragam tidak sesuai',
      consequence: 'Teguran lisan',
      witness: 'Pak Hendra',
      notes: 'Baju tidak tertutup rapi',
    },
    {
      id: 4,
      studentId: 4,
      studentName: 'Dina Kusuma',
      nisn: '0031234570',
      className: 'XI-B',
      date: '2025-01-20',
      type: 'Pelanggaran Berat',
      description: 'Menyontek saat ujian',
      consequence: 'Nilai ujian dibatalkan + SP1',
      witness: 'Bu Siti Aisyah',
      notes: 'Terbukti membawa catatan kecil',
    },
    {
      id: 5,
      studentId: 5,
      studentName: 'Eka Putra',
      nisn: '0031234571',
      className: 'XI-C',
      date: '2025-01-18',
      type: 'Pelanggaran Sedang',
      description: 'Membawa HP ke dalam kelas',
      consequence: 'HP disita 1 minggu',
      witness: 'Pak Rudi Hartono',
      notes: 'HP akan dikembalikan ke orang tua',
    },
  ])

  // Sample students data
  const students: Student[] = [
    { id: 1, name: 'Ahmad Ridho Pratama', nisn: '0031234567', className: 'XI-A' },
    { id: 2, name: 'Siti Nurhaliza', nisn: '0031234568', className: 'XI-A' },
    { id: 3, name: 'Budi Santoso', nisn: '0031234569', className: 'XI-B' },
    { id: 4, name: 'Dina Kusuma', nisn: '0031234570', className: 'XI-B' },
    { id: 5, name: 'Eka Putra', nisn: '0031234571', className: 'XI-C' },
    { id: 6, name: 'Farah Azizah', nisn: '0031234572', className: 'XI-C' },
  ]

  const classes = ['XI-A', 'XI-B', 'XI-C']
  const violationTypes = ['Pelanggaran Ringan', 'Pelanggaran Sedang', 'Pelanggaran Berat']

  // Filter violations
  const filteredViolations = useMemo(() => {
    let filtered = violations

    if (selectedClass !== 'all') {
      filtered = filtered.filter(v => v.className === selectedClass)
    }

    if (selectedStudent !== 'all') {
      const student = students.find(s => s.id.toString() === selectedStudent)
      if (student) {
        filtered = filtered.filter(v => v.studentName === student.name)
      }
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(v => v.type === selectedType)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedClass, selectedStudent, selectedType, violations])

  // Calculate stats
  const stats: ViolationStats = useMemo(() => {
    return {
      totalViolations: violations.length,
      lightViolations: violations.filter(v => v.type === 'Pelanggaran Ringan').length,
      mediumViolations: violations.filter(v => v.type === 'Pelanggaran Sedang').length,
      severeViolations: violations.filter(v => v.type === 'Pelanggaran Berat').length,
    }
  }, [violations])

  const handleAddViolation = (formData: any) => {
    const selectedStudentData = students.find(s => s.id.toString() === formData.studentId)
    if (!selectedStudentData) return

    const violation: ViolationRecord = {
      id: Math.max(...violations.map(v => v.id), 0) + 1,
      studentId: parseInt(formData.studentId),
      studentName: selectedStudentData.name,
      nisn: selectedStudentData.nisn,
      className: selectedStudentData.className,
      date: new Date().toISOString().split('T')[0],
      type: formData.type as any,
      description: formData.description,
      consequence: formData.consequence,
      witness: formData.witness,
      notes: formData.notes,
    }

    setViolations([...violations, violation])
    setIsFormModalOpen(false)
    alert('Pelanggaran berhasil dicatat')
  }

  const handleViewViolation = (violation: ViolationRecord) => {
    setSelectedViolation(violation)
    setIsDetailModalOpen(true)
  }

  const handleDeleteViolation = (id: number) => {
    if (window.confirm('Hapus catatan pelanggaran ini?')) {
      setViolations(violations.filter(v => v.id !== id))
    }
  }

  // Get filtered students for dropdown
  const filteredStudentsDropdown = useMemo(() => {
    if (selectedClass === 'all') return students
    return students.filter(s => s.className === selectedClass)
  }, [selectedClass])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Pencatatan Pelanggaran</h2>
                <p className="text-pink-50">Catat dan pantau pelanggaran siswa terhadap tata tertib sekolah</p>
              </div>
            </div>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-50 transition-all hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Catat Pelanggaran
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<AlertTriangle className="w-12 h-12" />}
            label="Total Pelanggaran"
            value={stats.totalViolations}
            color="bg-gradient-to-br from-red-400 to-red-600"
          />
          <StatCard
            icon={<AlertCircle className="w-12 h-12" />}
            label="Pelanggaran Ringan"
            value={stats.lightViolations}
            color="bg-gradient-to-br from-yellow-400 to-yellow-600"
          />
          <StatCard
            icon={<AlertTriangle className="w-12 h-12" />}
            label="Pelanggaran Sedang"
            value={stats.mediumViolations}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
          />
          <StatCard
            icon={<AlertTriangle className="w-12 h-12" />}
            label="Pelanggaran Berat"
            value={stats.severeViolations}
            color="bg-gradient-to-br from-red-500 to-red-700"
          />
        </div>

        {/* Filter Section */}
        <section className="mb-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-gray-900">Filter Data Pelanggaran</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setSelectedStudent('all')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map((kls) => (
                    <option key={kls} value={kls}>
                      {kls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Siswa</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                >
                  <option value="all">Semua Siswa</option>
                  {filteredStudentsDropdown.map((student) => (
                    <option key={student.id} value={student.id.toString()}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Pelanggaran</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                >
                  <option value="all">Semua Jenis</option>
                  {violationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedClass !== 'all' || selectedStudent !== 'all' || selectedType !== 'all') && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <span>Filter aktif: </span>
                {selectedClass !== 'all' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Kelas: {selectedClass}</span>}
                {selectedStudent !== 'all' && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Siswa: {students.find(s => s.id.toString() === selectedStudent)?.name}</span>}
                {selectedType !== 'all' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Jenis: {selectedType}</span>}
              </div>
            )}
          </div>
        </section>

        {/* Violation Records Table */}
        <section>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Siswa</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kelas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jenis</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hukuman</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredViolations.length > 0 ? (
                    filteredViolations.map((violation) => (
                      <tr key={violation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{violation.studentName}</p>
                            <p className="text-xs text-gray-600">{violation.nisn}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{violation.className}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{violation.date}</td>
                        <td className="px-6 py-4">
                          <ViolationTypeBadge type={violation.type} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{violation.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{violation.consequence}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewViolation(violation)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteViolation(violation.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada data pelanggaran yang sesuai dengan filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

    {/* Form Modal */}
        {isFormModalOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <ViolationFormModal
              isOpen={isFormModalOpen}
              onClose={() => setIsFormModalOpen(false)}
              onSubmit={handleAddViolation}
              students={students}
            />
            </div>
          </>
        )}

    {/* Detail Modal */}
      {isDetailModalOpen && selectedViolation && (
        <>
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          {selectedViolation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <ViolationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                  setIsDetailModalOpen(false)
                  setSelectedViolation(undefined)
                }}
                violationType={selectedViolation.type}
                description={selectedViolation.description}
                consequence={selectedViolation.consequence}
                date={selectedViolation.date}
                studentName={selectedViolation.studentName}
                witness={selectedViolation.witness}
                notes={selectedViolation.notes}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PelanggaranPage