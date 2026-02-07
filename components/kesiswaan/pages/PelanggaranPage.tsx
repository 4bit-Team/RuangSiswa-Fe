'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { AlertTriangle, Plus, Trash2, Filter, Eye, AlertCircle } from 'lucide-react'
import ViolationDetailModal from '../modals/ViolationDetailModal'
import ViolationFormModal from '../modals/ViolationFormModal'
import SpFormModal from '../modals/SpFormModal'
import { getViolationRecords, reportViolation, getSPLetters, syncViolationsFromWalas } from '@/lib/violationsAPI'

interface Student {
  id: number
  name: string
  nisn: string
  className: string
  spHistory?: SPRecord[]
}

interface ViolationRecordLocal {
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

// Helper to map API response to local format
const mapViolationRecord = (record: any): ViolationRecordLocal => ({
  id: typeof record.id === 'string' ? parseInt(record.id) : record.id,
  studentId: record.studentId,
  studentName: record.studentName,
  nisn: record.nisn || '',
  className: record.className,
  date: record.date,
  type: mapViolationType(record.severity || record.type),
  description: record.description,
  consequence: record.consequence || `${record.severity || 1} point violation`,
  witness: record.witness,
  notes: record.notes || record.catatan_petugas,
})

// Helper to map severity to violation type
const mapViolationType = (severity: number | string): 'Pelanggaran Ringan' | 'Pelanggaran Sedang' | 'Pelanggaran Berat' => {
  const level = typeof severity === 'string' ? parseInt(severity) : severity
  if (level >= 4) return 'Pelanggaran Berat'
  if (level >= 2) return 'Pelanggaran Sedang'
  return 'Pelanggaran Ringan'
}

interface ViolationStats {
  totalViolations: number
  lightViolations: number
  mediumViolations: number
  severeViolations: number
}

interface SPRecord {
  id: number
  date: string
  reason: string
  level: 'SP1' | 'SP2' | 'SP3'
  description: string
}

const ViolationTypeBadge: React.FC<{ type: string }> = ({ type }: { type: string }) => {
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
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
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
  // State
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecordLocal | undefined>()
  const [isSpModalOpen, setIsSpModalOpen] = useState(false)

  // API State
  const [violations, setViolations] = useState<ViolationRecordLocal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Fetch violations
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getViolationRecords({ page: 1, limit: 1000 })
        setViolations((response.data || []).map(mapViolationRecord))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data pelanggaran')
        console.error('Error fetching violations:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchViolations()
  }, [])

  // Handle sync
  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const monthEnd = new Date()
      const formatDate = (date: Date) => date.toISOString().split('T')[0]
      
      await syncViolationsFromWalas(formatDate(monthStart), formatDate(monthEnd))
      
      // Refresh data
      const response = await getViolationRecords({ page: 1, limit: 1000 })
      setViolations((response.data || []).map(mapViolationRecord))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal sinkronisasi pelanggaran')
      console.error('Error syncing violations:', err)
    } finally {
      setSyncing(false)
    }
  }

  // Extract unique classes and students from violations data
  // Derive students from violations data
  const allStudents = useMemo(() => {
    const uniqueMap = new Map()
    violations.forEach((v: ViolationRecordLocal) => {
      if (!uniqueMap.has(v.studentId)) {
        uniqueMap.set(v.studentId, { id: v.studentId, name: v.studentName, nisn: v.nisn, className: v.className })
      }
    })
    return Array.from(uniqueMap.values())
  }, [violations])

  const classes = useMemo(() => Array.from(new Set(violations.map((v: ViolationRecordLocal) => v.className))), [violations])
  const violationTypes = ['Pelanggaran Ringan', 'Pelanggaran Sedang', 'Pelanggaran Berat']

  // Calculate statistics
  const stats: ViolationStats = useMemo(() => ({
    totalViolations: violations.length,
    lightViolations: violations.filter((v: ViolationRecordLocal) => v.type === 'Pelanggaran Ringan').length,
    mediumViolations: violations.filter((v: ViolationRecordLocal) => v.type === 'Pelanggaran Sedang').length,
    severeViolations: violations.filter((v: ViolationRecordLocal) => v.type === 'Pelanggaran Berat').length,
  }), [violations])

  // Alias for compatibility
  const students = allStudents

  // Filter violations based on selected criteria
  const filteredViolations = useMemo(() => {
    return violations.filter((v: ViolationRecordLocal) => {
      const classMatch = selectedClass === 'all' || v.className === selectedClass
      const studentMatch = selectedStudent === 'all' || v.studentId.toString() === selectedStudent
      const typeMatch = selectedType === 'all' || v.type === selectedType
      return classMatch && studentMatch && typeMatch
    })
  }, [violations, selectedClass, selectedStudent, selectedType])

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return []
    return allStudents.filter((s: any) => s.className === selectedClass)
  }, [allStudents, selectedClass])


  const handleAddViolation = (formData: any) => {
    const selectedStudentData = allStudents.find((s: any) => s.id.toString() === formData.studentId)
    if (!selectedStudentData) return

    const violation: ViolationRecordLocal = {
      id: Math.max(...violations.map((v: ViolationRecordLocal) => v.id), 0) + 1,
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

  const handleViewViolation = (violation: ViolationRecordLocal) => {
    setSelectedViolation(violation)
    setIsDetailModalOpen(true)
  }

  const handleDeleteViolation = (id: number) => {
    if (window.confirm('Hapus catatan pelanggaran ini?')) {
      setViolations(violations.filter((v: ViolationRecordLocal) => v.id !== id))
    }
  }

  const handleAddSp = (formData: any) => {
    const selectedStudentData = allStudents.find((s: any) => s.id.toString() === formData.studentId)
    if (!selectedStudentData) return

    const sp: SPRecord = {
      id: Math.max(...(selectedStudentData.spHistory?.map((s: any) => s.id) || [0]), 0) + 1,
      date: new Date().toISOString().split('T')[0],
      reason: formData.reason,
      level: formData.level,
      description: formData.description,
    }

    // Update student's SP history
    const updatedStudents = allStudents.map((s: any) => {
      if (s.id.toString() === formData.studentId) {
        return {
          ...s,
          spHistory: [...(s.spHistory || []), sp],
        }
      }
      return s
    })

    setIsSpModalOpen(false)
    alert(`SP ${formData.level} berhasil diberikan kepada ${selectedStudentData.name}`)
  }

  // Get filtered students for dropdown
  const filteredStudentsDropdown = useMemo(() => {
    if (selectedClass === 'all') return allStudents
    return allStudents.filter((s: any) => s.className === selectedClass)
  }, [selectedClass, allStudents])

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-2 text-blue-900 font-medium">Memuat data pelanggaran...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Terjadi Kesalahan</h4>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
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
              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all"
                >
                  {syncing ? 'Sinkronisasi...' : 'Sinkronisasi'}
                </button>
                <button
                  onClick={() => setIsFormModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-50 transition-all hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Catat Pelanggaran
                </button>
                <button
                  onClick={() => setIsSpModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                  Beri SP
                </button>
              </div>
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
                    filteredViolations.map((violation: ViolationRecordLocal) => (
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
      )}

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

      {/* SP Modal */}
      {isSpModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <SpFormModal
              isOpen={isSpModalOpen}
              onClose={() => setIsSpModalOpen(false)}
              onSubmit={handleAddSp}
              students={filteredStudents}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default PelanggaranPage