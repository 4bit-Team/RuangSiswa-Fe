'use client'

import React, { useState, useMemo } from 'react'
import { Clock, AlertCircle, TrendingDown, Calendar, Filter } from 'lucide-react'
import TardinessDetailModal from '../modals/TardinessDetailModal'

interface Student {
  id: number
  name: string
  nisn: string
  className: string
}

interface TardinessRecord {
  id: number
  studentId: number
  studentName: string
  className: string
  date: string
  time: string
  minutesLate: number
  reason?: string
  status: 'Tercatat' | 'Termaafkan'
}

interface TardinessStats {
  totalTardiness: number
  thisMonth: number
  averageMinutes: number
  longestLate: number
}

const TardinessStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string }> = {
    'Tercatat': { bg: 'bg-orange-50', text: 'text-orange-700' },
    'Termaafkan': { bg: 'bg-green-50', text: 'text-green-700' },
  }

  const config = statusConfig[status] || statusConfig['Tercatat']

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {status}
    </span>
  )
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
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

const KeterlambatanPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<string>('all')
  const [selectedTardiness, setSelectedTardiness] = useState<TardinessRecord | null>(null)

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

  // Sample data - All tardiness records
  const allTardinessRecords: TardinessRecord[] = [
    // Ahmad Ridho (Student 1, Class XI-A)
    { id: 1, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-30', time: '07:45', minutesLate: 5, reason: 'Macet di jalan', status: 'Tercatat' },
    { id: 2, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-28', time: '07:50', minutesLate: 10, reason: 'Bangun kesiangan', status: 'Tercatat' },
    { id: 3, studentId: 1, studentName: 'Ahmad Ridho Pratama', className: 'XI-A', date: '2025-01-20', time: '07:35', minutesLate: 3, reason: 'Macet', status: 'Termaafkan' },
    
    // Siti Nurhaliza (Student 2, Class XI-A)
    { id: 4, studentId: 2, studentName: 'Siti Nurhaliza', className: 'XI-A', date: '2025-01-25', time: '07:42', minutesLate: 7, reason: 'Bangun kesiangan', status: 'Tercatat' },
    { id: 5, studentId: 2, studentName: 'Siti Nurhaliza', className: 'XI-A', date: '2025-01-15', time: '07:55', minutesLate: 15, reason: 'Sakit pagi', status: 'Tercatat' },
    
    // Budi Santoso (Student 3, Class XI-B)
    { id: 6, studentId: 3, studentName: 'Budi Santoso', className: 'XI-B', date: '2025-01-29', time: '07:48', minutesLate: 8, reason: 'Macet', status: 'Tercatat' },
    { id: 7, studentId: 3, studentName: 'Budi Santoso', className: 'XI-B', date: '2025-01-22', time: '07:38', minutesLate: 2, reason: 'Terlambat bis', status: 'Termaafkan' },
    
    // Dina Kusuma (Student 4, Class XI-B)
    { id: 8, studentId: 4, studentName: 'Dina Kusuma', className: 'XI-B', date: '2025-01-27', time: '07:52', minutesLate: 12, reason: 'Macet', status: 'Tercatat' },
    
    // Eka Putra (Student 5, Class XI-C)
    { id: 9, studentId: 5, studentName: 'Eka Putra', className: 'XI-C', date: '2025-01-30', time: '07:44', minutesLate: 4, reason: 'Macet', status: 'Tercatat' },
    
    // Farah Azizah (Student 6, Class XI-C)
    { id: 10, studentId: 6, studentName: 'Farah Azizah', className: 'XI-C', date: '2025-01-28', time: '07:40', minutesLate: 0, reason: 'Tepat waktu', status: 'Termaafkan' },
  ]

  // Filter records based on selected class and student
  const tardinessRecords = useMemo(() => {
    let filtered = allTardinessRecords

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
  const stats: TardinessStats = useMemo(() => {
    const totalTardiness = tardinessRecords.length
    const thisMonth = tardinessRecords.filter(r => {
      const recordDate = new Date(r.date)
      const currentMonth = new Date()
      return recordDate.getMonth() === currentMonth.getMonth() && 
             recordDate.getFullYear() === currentMonth.getFullYear()
    }).length
    
    const averageMinutes = totalTardiness > 0 
      ? Math.round(tardinessRecords.reduce((sum, r) => sum + r.minutesLate, 0) / totalTardiness)
      : 0
    
    const longestLate = totalTardiness > 0 
      ? Math.max(...tardinessRecords.map(r => r.minutesLate))
      : 0

    return {
      totalTardiness,
      thisMonth,
      averageMinutes,
      longestLate,
    }
  }, [tardinessRecords])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Keterlambatan Masuk</h2>
              <p className="text-red-50">Pantau riwayat keterlambatan Anda</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard
            icon={<Clock className="w-12 h-12" />}
            label="Total Keterlambatan"
            value={stats.totalTardiness}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
          />
          <StatCard
            icon={<Calendar className="w-12 h-12" />}
            label="Bulan Ini"
            value={stats.thisMonth}
            color="bg-gradient-to-br from-red-400 to-red-600"
          />
          <StatCard
            icon={<TrendingDown className="w-12 h-12" />}
            label="Rata-rata (Menit)"
            value={stats.averageMinutes}
            color="bg-gradient-to-br from-yellow-400 to-yellow-600"
          />
          <StatCard
            icon={<AlertCircle className="w-12 h-12" />}
            label="Terlama (Menit)"
            value={stats.longestLate}
            color="bg-gradient-to-br from-pink-400 to-pink-600"
          />
        </div>

        {/* Warning Box */}
        <section className="mt-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">⚠️ Perhatian Keterlambatan</h4>
              <p className="text-sm text-orange-800 mb-3">
                Keterlambatan yang terlalu sering dapat mempengaruhi nilai perilaku dan disiplin Anda.
              </p>
              <ul className="text-xs text-orange-800 space-y-1">
                <li>• Keterlambatan lebih dari 5 kali akan dicatat dalam ketenangan BK</li>
                <li>• Usahakan untuk tiba di sekolah tepat waktu setiap hari</li>
                <li>• Keterlambatan dapat dihapus dengan surat orang tua jika memiliki alasan yang kuat</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Class Summary Section */}
        <section className="mt-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Rekapitulasi Keterlambatan Per Kelas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((kls) => {
              const classRecords = allTardinessRecords.filter(r => r.className === kls)
              const totalLate = classRecords.length
              const averageLate = totalLate > 0 ? Math.round(classRecords.reduce((sum, r) => sum + r.minutesLate, 0) / totalLate) : 0
              const longestLate = totalLate > 0 ? Math.max(...classRecords.map(r => r.minutesLate)) : 0
              const recorded = classRecords.filter(r => r.status === 'Tercatat').length
              const excused = classRecords.filter(r => r.status === 'Termaafkan').length

              return (
                <div key={kls} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{kls}</h4>
                    <span className="text-2xl font-bold text-orange-600">{totalLate}x</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">📋 Tercatat</span>
                      <span className="font-semibold text-orange-600">{recorded}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">✓ Termaafkan</span>
                      <span className="font-semibold text-green-600">{excused}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">⏱️ Rata-rata</span>
                      <span className="font-semibold text-gray-700">{averageLate} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">🔴 Terlama</span>
                      <span className="font-semibold text-red-600">{longestLate} min</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <div className="text-xs text-gray-600 text-center">
                      {totalLate > 5 ? '⚠️ Butuh perhatian khusus' : '✓ Dalam batas normal'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Tardiness Records - simplified container */}
        <section className="mt-6">
          <div className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Riwayat Keterlambatan</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </span>
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
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
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                  📊 Menampilkan {tardinessRecords.length} record keterlambatan
                  {selectedClass !== 'all' && ` untuk kelas ${selectedClass}`}
                  {selectedStudent !== 'all' && ` siswa ${students.find(s => s.id.toString() === selectedStudent)?.name}`}
                </div>
              )}
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Siswa / Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jam Masuk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Durasi Terlambat</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alasan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tardinessRecords.length > 0 ? (
                    tardinessRecords.map((record) => (
                      <tr 
                        key={record.id}
                        onClick={() => {
                          setSelectedTardiness(record)
                          setIsModalOpen(true)
                        }}
                        className="hover:bg-orange-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          <div>{record.studentName}</div>
                          <div className="text-xs text-gray-500">{record.className}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {new Date(record.date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.time}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${record.minutesLate > 10 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                            {record.minutesLate} menit
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.reason || '-'}</td>
                        <td className="px-6 py-4">
                          <TardinessStatusBadge status={record.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <p className="font-medium">Tidak ada data keterlambatan</p>
                        <p className="text-sm">Coba ubah filter untuk melihat data lainnya</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tips Box */}
        <section className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-green-900 mb-2">💡 Tips Menghindari Keterlambatan</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ Tidur lebih awal agar bangun tepat waktu</li>
              <li>✓ Persiapkan seragam dan perlengkapan malam hari</li>
              <li>✓ Berangkat lebih awal untuk mengantisipasi kemacetan</li>
              <li>✓ Atur alarm untuk memberi waktu cukup untuk persiapan</li>
              <li>✓ Informasikan orang tua jika ada keperluan mendesak</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Tardiness Detail Modal (grouped, render only when open) */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          {selectedTardiness && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <TardinessDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                date={selectedTardiness.date}
                time={selectedTardiness.time}
                minutesLate={selectedTardiness.minutesLate}
                reason={selectedTardiness.reason}
                status={selectedTardiness.status}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default KeterlambatanPage
