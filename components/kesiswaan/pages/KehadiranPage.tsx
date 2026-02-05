'use client'

import React, { useState, useMemo } from 'react'
import { Calendar, Check, X, Clock, TrendingUp, Filter } from 'lucide-react'
import AttendanceDetailModal from '../modals/AttendanceDetailModal'

interface Student {
  id: number
  name: string
  nisn: string
  className: string
}

interface AttendanceRecord {
  id: number
  studentId: number
  studentName: string
  className: string
  date: string
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
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
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Hadir': { bg: 'bg-green-50', text: 'text-green-700', icon: <Check className="w-4 h-4" /> },
    'Sakit': { bg: 'bg-orange-50', text: 'text-orange-700', icon: <Clock className="w-4 h-4" /> },
    'Izin': { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Clock className="w-4 h-4" /> },
    'Alpa': { bg: 'bg-red-50', text: 'text-red-700', icon: <X className="w-4 h-4" /> },
  }

  const config = statusConfig[status] || statusConfig['Hadir']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
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

  // Sample students data
  const students: Student[] = [
    { id: 1, name: 'Ahmad Ridho Pratama', nisn: '0031234567', className: 'XI-A' },
    { id: 2, name: 'Siti Nurhaliza', nisn: '0031234568', className: 'XI-A' },
    { id: 3, name: 'Budi Santoso', nisn: '0031234569', className: 'XI-B' },
    { id: 4, name: 'Dina Kusuma', nisn: '0031234570', className: 'XI-B' },
    { id: 5, name: 'Eka Putra', nisn: '0031234571', className: 'XI-C' },
    { id: 6, name: 'Farah Azizah', nisn: '0031234572', className: 'XI-C' },
  ]

  // Get unique classes
  const classes = ['XI-A', 'XI-B', 'XI-C']

  // Get filtered students based on selected class
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return students
    return students.filter(s => s.className === selectedClass)
  }, [selectedClass])

  // Sample data - All attendance records
  const allAttendanceRecords: AttendanceRecord[] = [
    // Ahmad Ridho (Student 1, Class XI-A)
    { id: 1, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-30', status: 'Hadir', time: '07:15' },
    { id: 2, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-29', status: 'Hadir', time: '07:10' },
    { id: 3, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-28', status: 'Hadir', time: '07:20' },
    { id: 4, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-27', status: 'Sakit', notes: 'Demam' },
    { id: 5, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-24', status: 'Hadir', time: '07:05' },
    { id: 6, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-23', status: 'Izin', notes: 'Kegiatan sekolah' },
    { id: 7, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-22', status: 'Hadir', time: '07:18' },
    { id: 8, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-21', status: 'Hadir', time: '07:12' },
    
    // Siti Nurhaliza (Student 2, Class XI-A)
    { id: 9, studentId: 2, studentName: 'Siti Nurhaliza', className: 'XI-A', date: '2025-01-30', status: 'Hadir', time: '07:08' },
    { id: 10, studentId: 2, studentName: 'Siti Nurhaliza', className: 'XI-A', date: '2025-01-29', status: 'Hadir', time: '07:12' },
    { id: 11, studentId: 2, studentName: 'Siti Nurhaliza', className: 'XI-A', date: '2025-01-28', status: 'Hadir', time: '07:05' },
    { id: 12, studentId: 2, studentName: 'Siti Nurhaliza', className: 'XI-A', date: '2025-01-27', status: 'Hadir', time: '07:15' },
    
    // Budi Santoso (Student 3, Class XI-B)
    { id: 13, studentId: 3, studentName: 'Budi Santoso', className: 'XI-B', date: '2025-01-30', status: 'Hadir', time: '07:20' },
    { id: 14, studentId: 3, studentName: 'Budi Santoso', className: 'XI-B', date: '2025-01-29', status: 'Izin', notes: 'Sakit' },
    { id: 15, studentId: 3, studentName: 'Budi Santoso', className: 'XI-B', date: '2025-01-28', status: 'Hadir', time: '07:22' },
    
    // Dina Kusuma (Student 4, Class XI-B)
    { id: 16, studentId: 4, studentName: 'Dina Kusuma', className: 'XI-B', date: '2025-01-30', status: 'Hadir', time: '07:10' },
    { id: 17, studentId: 4, studentName: 'Dina Kusuma', className: 'XI-B', date: '2025-01-29', status: 'Hadir', time: '07:18' },
    
    // Eka Putra (Student 5, Class XI-C)
    { id: 18, studentId: 5, studentName: 'Eka Putra', className: 'XI-C', date: '2025-01-30', status: 'Hadir', time: '07:14' },
    { id: 19, studentId: 5, studentName: 'Eka Putra', className: 'XI-C', date: '2025-01-29', status: 'Hadir', time: '07:11' },
    { id: 20, studentId: 5, studentName: 'Eka Putra', className: 'XI-C', date: '2025-01-28', status: 'Alpa' },
  ]

  // Filter records based on selected class and student
  const attendanceRecords = useMemo(() => {
    let filtered = allAttendanceRecords

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(r => r.className === selectedClass)
    }

    // Filter by student
    if (selectedStudent !== 'all') {
      const student = students.find(s => s.id.toString() === selectedStudent)
      if (student) {
        filtered = filtered.filter(r => r.studentName === student.name)
      }
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedClass, selectedStudent])

  // Calculate stats based on filtered data
  const stats: AttendanceStats = useMemo(() => {
    const totalHadir = attendanceRecords.filter(r => r.status === 'Hadir').length
    const totalSakit = attendanceRecords.filter(r => r.status === 'Sakit').length
    const totalIzin = attendanceRecords.filter(r => r.status === 'Izin').length
    const totalAlpa = attendanceRecords.filter(r => r.status === 'Alpa').length
    const total = attendanceRecords.length

    return {
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      attendancePercentage: total > 0 ? Math.round((totalHadir / total) * 100) : 0,
    }
  }, [attendanceRecords])

  return (
    <div className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <StatCard icon={<Check className="w-12 h-12" />} label="Hadir" value={stats.totalHadir} color="bg-gradient-to-br from-green-400 to-green-600" />
          <StatCard icon={<Clock className="w-12 h-12" />} label="Sakit" value={stats.totalSakit} color="bg-gradient-to-br from-orange-400 to-orange-600" />
          <StatCard icon={<Clock className="w-12 h-12" />} label="Izin" value={stats.totalIzin} color="bg-gradient-to-br from-blue-400 to-blue-600" />
          <StatCard icon={<X className="w-12 h-12" />} label="Alpa" value={stats.totalAlpa} color="bg-gradient-to-br from-red-400 to-red-600" />
          <StatCard
            icon={<TrendingUp className="w-12 h-12" />}
            label="Persentase"
            value={stats.attendancePercentage}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
          />
        </div>

        {/* Attendance Progress - simplified */}
        <section className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Target Kehadiran Bulanan</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Target: 95%</span>
                <span className="text-sm font-bold text-green-600">Tercapai: 95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Class Summary Section */}
        <section className="mt-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Rekapitulasi Kehadiran Per Kelas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((kls) => {
              const classRecords = allAttendanceRecords.filter(r => r.className === kls)
              const classHadir = classRecords.filter(r => r.status === 'Hadir').length
              const classSakit = classRecords.filter(r => r.status === 'Sakit').length
              const classIzin = classRecords.filter(r => r.status === 'Izin').length
              const classAlpa = classRecords.filter(r => r.status === 'Alpa').length
              const classTotal = classRecords.length
              const classPercentage = classTotal > 0 ? Math.round((classHadir / classTotal) * 100) : 0

              return (
                <div key={kls} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{kls}</h4>
                    <span className="text-2xl font-bold text-blue-600">{classPercentage}%</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">✓ Hadir</span>
                      <span className="font-semibold text-green-600">{classHadir}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">🤒 Sakit</span>
                      <span className="font-semibold text-orange-600">{classSakit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">📋 Izin</span>
                      <span className="font-semibold text-blue-600">{classIzin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">✗ Alpa</span>
                      <span className="font-semibold text-red-600">{classAlpa}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: `${classPercentage}%` }}></div>
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
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
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
                        {student.name} ({student.className})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Info */}
              {(selectedClass !== 'all' || selectedStudent !== 'all') && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  📊 Menampilkan {attendanceRecords.length} record kehadiran
                  {selectedClass !== 'all' && ` untuk kelas ${selectedClass}`}
                  {selectedStudent !== 'all' && ` siswa ${students.find(s => s.id.toString() === selectedStudent)?.name}`}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Siswa / Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Waktu Masuk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => (
                      <tr 
                        key={record.id}
                        onClick={() => {
                          setSelectedAttendance({
                            date: record.date,
                            status: record.status,
                            time: record.time,
                            notes: record.notes,
                          })
                          setIsModalOpen(true)
                        }}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          <div>{record.studentName}</div>
                          <div className="text-xs text-gray-500">{record.className}</div>
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
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
