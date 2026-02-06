'use client'

import React, { useState, useMemo } from 'react'
import { BookOpen, CheckCircle, TrendingUp, Award, User, MessageSquare, Filter, AlertCircle, X } from 'lucide-react'
import SessionDetailModal from '../modals/SessionDetailModal'

interface CounselingSession {
  id: number
  sessionNumber: string
  counselor: string
  date: string
  title: string
  topic: string
  notes: string
  status: 'Selesai' | 'Terjadwal' | 'Dalam Proses'
}

interface GuidanceProgress {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  progressPercentage: number
  currentFocus: string
}

interface Student {
  id: number
  name: string
  nisn: string
  className: string
  counselor: string
  status: 'Normal' | 'Peringatan' | 'Perlu Tindak Lanjut'
  lastSession: string
  notes: string
  spHistory: SPRecord[]
}

interface SPRecord {
  id: number
  date: string
  reason: string
  level: 'SP1' | 'SP2' | 'SP3'
  description: string
}

const SessionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Selesai': { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
    'Terjadwal': { bg: 'bg-blue-50', text: 'text-blue-700', icon: <BookOpen className="w-4 h-4" /> },
    'Dalam Proses': { bg: 'bg-orange-50', text: 'text-orange-700', icon: <TrendingUp className="w-4 h-4" /> },
  }

  const config = statusConfig[status] || statusConfig['Selesai']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  )
}

const GuidanceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Normal': { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
    'Peringatan': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <AlertCircle className="w-4 h-4" /> },
    'Perlu Tindak Lanjut': { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
  }

  const config = statusConfig[status] || statusConfig['Normal']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  )
}

const SessionCard: React.FC<CounselingSession & { onOpen: (session: CounselingSession) => void }> = ({ 
  id,
  sessionNumber, 
  counselor, 
  date, 
  title, 
  topic, 
  notes, 
  status,
  onOpen 
}) => (
  <div 
    onClick={() => onOpen({ id, sessionNumber, counselor, date, title, topic, notes, status })}
    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-purple-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h4 className="font-bold text-gray-900">{sessionNumber}</h4>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <SessionStatusBadge status={status} />
    </div>

    <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Judul Sesi</p>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Topik Utama</p>
        <p className="text-sm text-gray-700">{topic}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Konselor</p>
        <p className="text-sm text-gray-700">{counselor}</p>
      </div>
    </div>

    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Catatan Sesi</p>
      <p className="text-sm text-gray-700 line-clamp-3">{notes}</p>
    </div>
  </div>
)

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string }> = ({
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

const StatusBimbinganPage: React.FC = () => {
  const [expandedSession, setExpandedSession] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null)
  const [selectedName, setSelectedName] = useState('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Sample students data
  const students: Student[] = [
    {
      id: 1,
      name: 'Ahmad Hidayat',
      nisn: '0012345670',
      className: 'XI-A',
      counselor: 'Bu Sarah Wijaya',
      status: 'Normal',
      lastSession: '28 Januari 2025',
      notes: 'Siswa menunjukkan progress baik dalam manajemen waktu.',
      spHistory: [],
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      nisn: '0012345671',
      className: 'XI-A',
      counselor: 'Bu Sarah Wijaya',
      status: 'Peringatan',
      lastSession: '25 Januari 2025',
      notes: 'Sering izin tanpa keterangan, perlu ditingkatkan kedisiplinan.',
      spHistory: [
        {
          id: 1,
          date: '30 Januari 2025',
          reason: 'Sering tidak mengikuti pelajaran tanpa izin',
          level: 'SP1',
          description: 'Peringatan pertama atas ketidakdisiplinan siswa dalam kehadiran.',
        },
      ],
    },
    {
      id: 3,
      name: 'Reza Pratama',
      nisn: '0012345672',
      className: 'XI-B',
      counselor: 'Pak Rudi Hartono',
      status: 'Perlu Tindak Lanjut',
      lastSession: '15 Januari 2025',
      notes: 'Memiliki masalah perilaku, tidak fokus dalam belajar.',
      spHistory: [
        {
          id: 2,
          date: '22 Januari 2025',
          reason: 'Pelanggaran tata tertib sekolah',
          level: 'SP1',
          description: 'Peringatan atas pelanggaran tata tertib sekolah.',
        },
        {
          id: 3,
          date: '3 Februari 2025',
          reason: 'Pelanggaran berulang dan perilaku tidak terpuji',
          level: 'SP2',
          description: 'Peringatan kedua atas pelanggaran berulang dan perilaku yang perlu diperbaiki.',
        },
      ],
    },
    {
      id: 4,
      name: 'Dewi Lestari',
      nisn: '0012345673',
      className: 'XI-B',
      counselor: 'Pak Rudi Hartono',
      status: 'Normal',
      lastSession: '27 Januari 2025',
      notes: 'Aktif dalam kegiatan ekstrakurikuler, akademik stabil.',
      spHistory: [],
    },
    {
      id: 5,
      name: 'Budi Santoso',
      nisn: '0012345674',
      className: 'XI-C',
      counselor: 'Ibu Siti Aisyah',
      status: 'Peringatan',
      lastSession: '20 Januari 2025',
      notes: 'Terlambat berkali-kali, perlu bimbingan orang tua.',
      spHistory: [
        {
          id: 4,
          date: '1 Februari 2025',
          reason: 'Keterlambatan berulang kali ke sekolah',
          level: 'SP1',
          description: 'Peringatan atas keterlambatan yang sering terjadi.',
        },
      ],
    },
    {
      id: 6,
      name: 'Mega Putri',
      nisn: '0012345675',
      className: 'XI-C',
      counselor: 'Ibu Siti Aisyah',
      status: 'Normal',
      lastSession: '29 Januari 2025',
      notes: 'Siswa berprestasi, terus berkembang dalam akademik maupun karakter.',
      spHistory: [],
    },
  ]

  // Filtered students based on selected filters
  const filteredStudents = useMemo(() => {
    let filtered = students
    
    if (selectedName !== 'all') {
      const student = students.find(s => s.id.toString() === selectedName)
      if (student) {
        filtered = filtered.filter(s => s.id.toString() === selectedName)
      }
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.className === selectedClass)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus)
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [selectedName, selectedClass, selectedStatus])

  const uniqueClasses = Array.from(new Set(students.map(s => s.className))).sort()

  // Sample data
  const progress: GuidanceProgress = {
    totalSessions: 10,
    completedSessions: 7,
    upcomingSessions: 2,
    progressPercentage: 70,
    currentFocus: 'Manajemen Stress dan Waktu',
  }

  const sessions: CounselingSession[] = [
    {
      id: 1,
      sessionNumber: 'Sesi 7',
      counselor: 'Bu Sarah Wijaya',
      date: '28 Januari 2025',
      title: 'Teknik Pomodoro untuk Fokus Belajar',
      topic: 'Manajemen Waktu',
      notes:
        'Menunjukkan bahwa siswa sudah mulai menerapkan teknik Pomodoro dalam belajar. Terdapat peningkatan fokus belajar yang signifikan. Lanjutkan kebiasaan ini dan evaluasi hasilnya setelah 2 minggu.',
      status: 'Selesai',
    },
    {
      id: 2,
      sessionNumber: 'Sesi 6',
      counselor: 'Bu Sarah Wijaya',
      date: '21 Januari 2025',
      title: 'Identifikasi Penyebab Prokrastinasi',
      topic: 'Manajemen Waktu',
      notes:
        'Menemukan bahwa siswa sering terdestrasi oleh media sosial. Sudah mulai membuat jadwal harian dan mingguan. Target harian: mengurangi waktu media sosial hingga 30 menit.',
      status: 'Selesai',
    },
    {
      id: 3,
      sessionNumber: 'Sesi 5',
      counselor: 'Bu Sarah Wijaya',
      date: '15 Januari 2025',
      title: 'Assessment Awal',
      topic: 'Manajemen Stress',
      notes:
        'Siswa mengalami kecemasan menjelang ujian dan merasa stress dengan beban tugas yang banyak. Dibutuhkan strategi coping yang lebih efektif. Akan dilanjutkan dengan sesi tentang teknik relaksasi.',
      status: 'Selesai',
    },
    {
      id: 4,
      sessionNumber: 'Sesi 8',
      counselor: 'Bu Sarah Wijaya',
      date: '04 Februari 2025',
      title: 'Evaluasi Progress & Goal Setting',
      topic: 'Manajemen Stress dan Waktu',
      notes:
        'Progress yang baik terlihat dalam 3 minggu terakhir. Siswa berhasil menerapkan teknik yang diajarkan dan merasa lebih tenang. Akan mengatur goal baru untuk semester depan.',
      status: 'Terjadwal',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Status Bimbingan</h2>
              <p className="text-pink-50">Progres dan riwayat sesi bimbingan Anda dengan konselor BK</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard
            icon={<BookOpen className="w-12 h-12" />}
            label="Total Sesi"
            value={progress.totalSessions}
            color="bg-gradient-to-br from-blue-400 to-blue-600"
          />
          <StatCard
            icon={<CheckCircle className="w-12 h-12" />}
            label="Selesai"
            value={progress.completedSessions}
            color="bg-gradient-to-br from-green-400 to-green-600"
          />
          <StatCard
            icon={<TrendingUp className="w-12 h-12" />}
            label="Akan Datang"
            value={progress.upcomingSessions}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
          />
          <StatCard
            icon={<Award className="w-12 h-12" />}
            label="Progress"
            value={`${progress.progressPercentage}%`}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
          />
        </div>

        {/* Progress Summary - simplified (no nested white card) */}
        <section className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Ringkasan Progress Bimbingan</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Penyelesaian Sesi Bimbingan</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Anda telah menyelesaikan {progress.completedSessions} dari {progress.totalSessions} sesi yang direncanakan
                  </p>
                </div>
                <span className="text-2xl font-bold text-purple-600">{progress.progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Fokus Utama Saat Ini</p>
                <p className="text-sm font-semibold text-gray-900">{progress.currentFocus}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Konselor Pembimbing</p>
                <p className="text-sm font-semibold text-gray-900">Bu Sarah Wijaya</p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Status Box */}
        <section className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Status Bimbingan Anda</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Anda sedang dalam program bimbingan fokus yang dimulai pada 15 Januari 2025. Konselor Anda adalah Bu Sarah Wijaya dan progres
                  yang Anda tunjukkan sangat memuaskan.
                </p>
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Chat dengan Konselor
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sessions */}
        <section className="mt-6">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Riwayat Sesi Bimbingan</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  {...session}
                  onOpen={(s) => {
                    setSelectedSession(s)
                    setIsModalOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="mt-8">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Filter Data Bimbingan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Siswa</label>
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="all">Semua Siswa</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id.toString()}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setSelectedName('all')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="all">Semua Kelas</option>
                  {uniqueClasses.map((kls) => (
                    <option key={kls} value={kls}>
                      {kls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Bimbingan</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="all">Semua Status</option>
                  <option value="Normal">Normal</option>
                  <option value="Peringatan">Peringatan</option>
                  <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut</option>
                </select>
              </div>
            </div>

            {(selectedName !== 'all' || selectedClass !== 'all' || selectedStatus !== 'all') && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <span>Filter aktif: </span>
                {selectedName !== 'all' && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Siswa: {students.find(s => s.id.toString() === selectedName)?.name}</span>}
                {selectedClass !== 'all' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Kelas: {selectedClass}</span>}
                {selectedStatus !== 'all' && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Status: {selectedStatus}</span>}
              </div>
            )}
          </div>
        </section>

        {/* Student Guidance Table */}
        <section className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Siswa</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kelas</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Konselor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sesi Terakhir</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-600">{student.nisn}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{student.className}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{student.counselor}</td>
                        <td className="px-6 py-4">
                          <GuidanceStatusBadge status={student.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{student.lastSession}</td>
                        <td className="px-6 py-4">
                          <button
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Tidak ada data bimbingan yang sesuai dengan filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-green-900 mb-3">✨ Rekomendasi Konselor</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ Terus terapkan teknik manajemen waktu yang sudah diajarkan</li>
              <li>✓ Catat perkembangan harian dalam jurnal untuk evaluasi lebih baik</li>
              <li>✓ Jangan ragu untuk menghubungi konselor jika ada kendala</li>
              <li>✓ Diskusikan pencapaian Anda dengan orang tua</li>
              <li>✓ Rencanakan tujuan jangka panjang pada sesi berikutnya</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Session Detail Modal (grouped, render only when open) */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
          {selectedSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <SessionDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sessionNumber={selectedSession.sessionNumber}
                counselor={selectedSession.counselor}
                date={selectedSession.date}
                title={selectedSession.title}
                topic={selectedSession.topic}
                notes={selectedSession.notes}
                status={selectedSession.status}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StatusBimbinganPage
