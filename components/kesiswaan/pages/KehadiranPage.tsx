'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Calendar, Check, X, Clock, TrendingUp, Filter, AlertCircle, RefreshCw } from 'lucide-react'
import AttendanceDetailModal from '../modals/AttendanceDetailModal'
import { getAttendanceRecords, getAttendanceSummary, syncAttendanceFromWalas } from '../../../lib/backup/attendanceAPI'
import { generateDummyAttendanceRecords, generateDummyAttendanceStats } from '../../../lib/backup/dummyData'

interface AttendanceRecord {
  id: number
  studentId: number
  studentName: string
  className: string
  date: string
  status: string // Can be 'H', 'S', 'I', 'A' or 'Hadir', 'Sakit', 'Izin', 'Alpa'
  time?: string
  notes?: string
}

interface AttendanceStats {
  totalHadir: number
  totalSakit: number
  totalIzin: number
  totalAlpa: number
  attendancePercentage: number
}

const AttendanceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const mappedStatus = mapStatusCode(status)
  const colors = getStatusColorClass(mappedStatus)

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
      {getStatusIcon(mappedStatus)}
      {mappedStatus}
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

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Helper function to map status codes to full names
 * Handles both code format (H/S/I/A) and full name format (Hadir/Sakit/Izin/Alpa)
 */
const mapStatusCode = (code: string): string => {
  if (!code) return 'Hadir'
  
  const statusMap: Record<string, string> = {
    'H': 'Hadir',
    'S': 'Sakit',
    'I': 'Izin',
    'A': 'Alpa',
    'Hadir': 'Hadir',
    'Sakit': 'Sakit',
    'Izin': 'Izin',
    'Alpa': 'Alpa',
  }
  return statusMap[code] || 'Hadir'
}

/**
 * Get color classes for status display
 */
const getStatusColorClass = (status: string): { bg: string; text: string } => {
  const statusLower = status?.toLowerCase() || 'hadir'
  const colorMap: Record<string, { bg: string; text: string }> = {
    'hadir': { bg: 'bg-green-50', text: 'text-green-700' },
    'sakit': { bg: 'bg-orange-50', text: 'text-orange-700' },
    'izin': { bg: 'bg-blue-50', text: 'text-blue-700' },
    'alpa': { bg: 'bg-red-50', text: 'text-red-700' },
  }
  return colorMap[statusLower] || colorMap['hadir']
}

/**
 * Get icon/emoji for status
 */
const getStatusIcon = (status: string): React.ReactNode => {
  const statusLower = status?.toLowerCase() || 'hadir'
  switch (statusLower) {
    case 'hadir':
      return <Check className="w-4 h-4" />
    case 'sakit':
      return <Clock className="w-4 h-4" />
    case 'izin':
      return <Clock className="w-4 h-4" />
    case 'alpa':
      return <X className="w-4 h-4" />
    default:
      return <Check className="w-4 h-4" />
  }
}

const KehadiranPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [selectedAttendance, setSelectedAttendance] = useState<{
    date: string
    status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
    time?: string
    notes?: string
  } | null>(null)

  // API State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    totalHadir: 0,
    totalSakit: 0,
    totalIzin: 0,
    totalAlpa: 0,
    attendancePercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        setError(null)
        const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
        const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
        
        // Fetch with pagination (max 100 per request)
        const allRecords: any[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await getAttendanceRecords({
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            page: page,
            limit: 100,
          })

          if (response.success && response.data && response.data.length > 0) {
            allRecords.push(...response.data)
            page++
            
            // Check if there are more pages
            if (response.pagination && page > response.pagination.pages) {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        }

        const response = { success: true, data: allRecords, pagination: { page: 1, limit: allRecords.length, total: allRecords.length } }

        // Check if there's actual data from API
        let mappedRecords = []
        
        if (!response.success || !response.data || response.data.length === 0) {
          // No data from API, use dummy data
          mappedRecords = generateDummyAttendanceRecords()
        } else {
          // Map status codes to full names (handle both 'H' and 'Hadir' formats)
          mappedRecords = (response.data || []).map((record: any) => ({
            ...record,
            status: mapStatusCode(record.status),
          }))
        }

        setAttendanceRecords(mappedRecords)

        // Extract unique classes from records
        const uniqueClasses = Array.from(new Set(mappedRecords?.map((r: AttendanceRecord) => r.className) || []))
        setClasses(uniqueClasses as string[])

        // Calculate stats
        const totalHadir = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Hadir').length || 0
        const totalSakit = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Sakit').length || 0
        const totalIzin = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Izin').length || 0
        const totalAlpa = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Alpa').length || 0
        const total = mappedRecords?.length || 0

        setStats({
          totalHadir,
          totalSakit,
          totalIzin,
          totalAlpa,
          attendancePercentage: total > 0 ? Math.round((totalHadir / total) * 100) : 0,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Gagal memuat data kehadiran'
        setError(errorMsg)
        console.error('Error fetching attendance:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [selectedMonth])

  // Handle sync from Walas
  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
      
      // Call sync endpoint
      const syncResult = await syncAttendanceFromWalas(
        formatDate(startDate),
        formatDate(endDate),
        false
      )

      if (!syncResult.success) {
        throw new Error(syncResult.message || 'Sinkronisasi gagal')
      }

      // Wait a moment for data to be processed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh data after sync with pagination (max 100 per request)
      const allRecords: any[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await getAttendanceRecords({
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          page: page,
          limit: 100,
        })

        if (response.success && response.data && response.data.length > 0) {
          allRecords.push(...response.data)
          page++
          
          // Check if there are more pages
          if (response.pagination && page > response.pagination.pages) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      const response = { success: true, data: allRecords, pagination: { page: 1, limit: allRecords.length, total: allRecords.length } }

      // Check if there's actual data from API
      let mappedRecords = []
      
      if (response.success && response.data && response.data.length > 0) {
        // Map status codes to full names
        mappedRecords = (response.data || []).map((record: any) => ({
          ...record,
          status: mapStatusCode(record.status),
        }))
      } else {
        // No data from API, use dummy data
        mappedRecords = generateDummyAttendanceRecords()
      }
      
      setAttendanceRecords(mappedRecords)

      // Extract unique classes from records
      const uniqueClasses = Array.from(new Set(mappedRecords?.map((r: AttendanceRecord) => r.className) || []))
      setClasses(uniqueClasses as string[])

      // Recalculate stats
      const totalHadir = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Hadir').length || 0
      const totalSakit = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Sakit').length || 0
      const totalIzin = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Izin').length || 0
      const totalAlpa = mappedRecords?.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Alpa').length || 0
      const total = mappedRecords?.length || 0

      setStats({
        totalHadir,
        totalSakit,
        totalIzin,
        totalAlpa,
        attendancePercentage: total > 0 ? Math.round((totalHadir / total) * 100) : 0,
      })

      // Show success message
      setError(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal sinkronisasi kehadiran'
      setError(errorMsg)
      console.error('Error syncing attendance:', err)
    } finally {
      setSyncing(false)
    }
  }

  // Filter records based on selected class and student
  const filteredRecords = useMemo(() => {
    let filtered = attendanceRecords

    if (selectedClass !== 'all') {
      filtered = filtered.filter((r: AttendanceRecord) => r.className === selectedClass)
    }

    if (selectedStudent !== 'all') {
      filtered = filtered.filter((r: AttendanceRecord) => r.studentId.toString() === selectedStudent)
    }

    return filtered.sort((a: AttendanceRecord, b: AttendanceRecord) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [attendanceRecords, selectedClass, selectedStudent])

  // Get unique students from filtered records by class
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return []
    const students = attendanceRecords.filter((r: AttendanceRecord) => r.className === selectedClass)
    const uniqueMap = new Map()
    students.forEach((s: AttendanceRecord) => {
      if (!uniqueMap.has(s.studentId)) {
        uniqueMap.set(s.studentId, { id: s.studentId, name: s.studentName, className: s.className })
      }
    })
    return Array.from(uniqueMap.values())
  }, [attendanceRecords, selectedClass])

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-2 text-blue-900 font-medium">Memuat data kehadiran...</p>
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

      {/* Main Content */}
      {!loading && !error && (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Kehadiran Kelas</h2>
              <p className="text-blue-50">Rekap kehadiran dan statistik kehadiran Anda</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard icon={<Check className="w-12 h-12" />} label="Hadir" value={stats.totalHadir} color="bg-gradient-to-br from-green-400 to-green-600" />
          <StatCard icon={<Clock className="w-12 h-12" />} label="Sakit" value={stats.totalSakit} color="bg-gradient-to-br from-orange-400 to-orange-600" />
          <StatCard icon={<Clock className="w-12 h-12" />} label="Izin" value={stats.totalIzin} color="bg-gradient-to-br from-blue-400 to-blue-600" />
          <StatCard icon={<X className="w-12 h-12" />} label="Alpa" value={stats.totalAlpa} color="bg-gradient-to-br from-red-400 to-red-600" />
        </div>

        {/* Class Summary Section */}
        <section className="mt-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Rekapitulasi Kehadiran {selectedClass !== 'all' ? `Kelas ${selectedClass}` : 'Per Kelas'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(selectedClass === 'all' ? classes : [selectedClass]).map((kls: string) => {
              const classRecords = attendanceRecords.filter((r: AttendanceRecord) => r.className === kls)
              const classHadir = classRecords.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Hadir').length
              const classSakit = classRecords.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Sakit').length
              const classIzin = classRecords.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Izin').length
              const classAlpa = classRecords.filter((r: AttendanceRecord) => mapStatusCode(r.status) === 'Alpa').length
              const classTotal = classRecords.length
              return (
                <div key={kls} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="font-bold text-xl text-blue-900 mb-4 pb-3 border-b-2 border-blue-400">📚 {kls}</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                      <span className="text-gray-700 font-medium">✓ Hadir</span>
                      <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">{classHadir}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                      <span className="text-gray-700 font-medium">🤒 Sakit</span>
                      <span className="font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">{classSakit}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                      <span className="text-gray-700 font-medium">📋 Izin</span>
                      <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{classIzin}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                      <span className="text-gray-700 font-medium">✗ Alpa</span>
                      <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">{classAlpa}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg px-3 py-2 mt-3 border border-purple-300">
                      <span className="text-gray-700 font-semibold">Total</span>
                      <span className="font-bold text-purple-700 text-lg">{classTotal}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Attendance Records */}
        <section className="mt-6">
          <div className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Riwayat Kehadiran</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Menyinkronisasi...' : 'Sinkronisasi dari Walas'}
                  </button>
                </div>
              </div>

              {/* Filter Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Pilih Kelas
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value)
                      setSelectedStudent('all') // Reset student when class changes
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">Semua Kelas</option>
                    {classes.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Siswa</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="all">Semua Siswa</option>
                    {filteredStudents.map(student => (
                      <option key={student.id} value={student.id.toString()}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Info */}
              {(selectedClass !== 'all' || selectedStudent !== 'all') && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  📊 Menampilkan {filteredRecords.length} record kehadiran
                  {selectedClass !== 'all' && ` untuk kelas ${selectedClass}`}
                  {selectedStudent !== 'all' && ` siswa ${filteredStudents.find(s => s.id.toString() === selectedStudent)?.name}`}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Siswa</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Waktu Masuk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr 
                        key={record.id}
                        onClick={() => {
                          setSelectedAttendance({
                            date: record.date,
                            status: mapStatusCode(record.status) as 'Hadir' | 'Sakit' | 'Izin' | 'Alpa',
                            time: record.time,
                            notes: record.notes,
                          })
                          setIsModalOpen(true)
                        }}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {record.studentName}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                            {record.className}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <AttendanceStatusBadge status={record.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.time || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <p className="font-medium">Tidak ada data kehadiran</p>
                        <p className="text-sm">Coba ubah filter untuk melihat data lainnya</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Info Box */}
        <section className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Informasi Kehadiran</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Kehadiran setiap hari dicatat otomatis oleh sistem</li>
              <li>• Jika Anda sakit atau izin, harap informasikan ke guru piket</li>
              <li>• Target kehadiran minimum adalah 95% per semester</li>
              <li>• Kehadiran berpengaruh pada nilai rapor akhir</li>
            </ul>
          </div>
        </section>
      </div>
      )}

      {/* Attendance Detail Modal (grouped, render only when open) */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          {selectedAttendance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <AttendanceDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                attendanceDate={selectedAttendance.date}
                status={selectedAttendance.status}
                time={selectedAttendance.time}
                notes={selectedAttendance.notes}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default KehadiranPage
