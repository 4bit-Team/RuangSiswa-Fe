'use client'

import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, TrendingUp, Award, User, MessageSquare, Search, Filter, X, Eye, Edit } from 'lucide-react'
import SessionDetailModal from '../modals/SessionDetailModal'

interface ProblemStudent {
  id: number
  nis: string
  name: string
  class: string
  major: string
  category: 'Akademik' | 'Perilaku' | 'Kesehatan' | 'Sosial'
  problem: string
  letterWarning: number
  status: 'Dalam Pengawasan' | 'Butuh Bimbingan' | 'Mendapat SP'
  lastUpdate: string
  counselor: string
}

interface CounselingSession {
  id: number
  sessionNumber: string
  counselor: string
  date: string
  title: string
  topic: string
  notes: string
  status: 'Selesai' | 'Terjadwal' | 'Dalam Proses'
  studentId?: number
}

const ProblemStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Dalam Pengawasan': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <Eye className="w-4 h-4" /> },
    'Butuh Bimbingan': { bg: 'bg-orange-50', text: 'text-orange-700', icon: <AlertTriangle className="w-4 h-4" /> },
    'Mendapat SP': { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertTriangle className="w-4 h-4" /> },
  }

  const config = statusConfig[status] || statusConfig['Dalam Pengawasan']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  )
}

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const categoryConfig: Record<string, string> = {
    'Akademik': 'bg-blue-100 text-blue-800',
    'Perilaku': 'bg-red-100 text-red-800',
    'Kesehatan': 'bg-green-100 text-green-800',
    'Sosial': 'bg-purple-100 text-purple-800',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${categoryConfig[category] || 'bg-gray-100 text-gray-800'}`}>
      {category}
    </span>
  )
}

const StudentProblemCard: React.FC<ProblemStudent & { onOpenSession: () => void }> = ({ 
  id,
  nis,
  name, 
  class: className, 
  major,
  category,
  problem, 
  letterWarning, 
  status,
  lastUpdate,
  counselor,
  onOpenSession 
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-bold text-lg text-gray-900">{name}</h4>
          <CategoryBadge category={category} />
        </div>
        <p className="text-sm text-gray-600">NIS: {nis} | {className}</p>
      </div>
      <ProblemStatusBadge status={status} />
    </div>

    <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Masalah</p>
        <p className="text-sm font-semibold text-gray-900">{problem}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Konselor Pembimbing</p>
        <p className="text-sm text-gray-700">{counselor}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Surat Peringatan</p>
          <p className="text-sm font-semibold text-gray-900">{letterWarning} SP</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Update Terakhir</p>
          <p className="text-sm text-gray-700">{new Date(lastUpdate).toLocaleDateString('id-ID')}</p>
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      <button onClick={onOpenSession} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-medium text-sm transition-colors">
        <Eye className="w-4 h-4" />
        Lihat Detail
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2 rounded-lg font-medium text-sm transition-colors">
        <MessageSquare className="w-4 h-4" />
        Chat
      </button>
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Dalam Pengawasan' | 'Butuh Bimbingan' | 'Mendapat SP'>('Semua')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<ProblemStudent | null>(null)
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null)

  // Sample data - Problem Students
  const problemStudents: ProblemStudent[] = [
    {
      id: 1,
      nis: '2023001',
      name: 'Ahmad Fauzi',
      class: 'XII IPA 1',
      major: 'IPA',
      category: 'Perilaku',
      problem: 'Sering berkelahi dengan teman sejawat',
      letterWarning: 2,
      status: 'Mendapat SP',
      lastUpdate: '2024-12-01',
      counselor: 'Bu Sarah Wijaya',
    },
    {
      id: 2,
      nis: '2023045',
      name: 'Budi Santoso',
      class: 'X MIPA 3',
      major: 'MIPA',
      category: 'Akademik',
      problem: 'Nilai akademik menurun signifikan',
      letterWarning: 0,
      status: 'Butuh Bimbingan',
      lastUpdate: '2024-11-28',
      counselor: 'Bapak Hendra Saputra',
    },
    {
      id: 3,
      nis: '2023102',
      name: 'Dewi Lestari',
      class: 'XII IPS 1',
      major: 'IPS',
      category: 'Kesehatan',
      problem: 'Gangguan kesehatan mental (depresi ringan)',
      letterWarning: 0,
      status: 'Dalam Pengawasan',
      lastUpdate: '2024-11-25',
      counselor: 'Bu Ratih Kusuma',
    },
    {
      id: 4,
      nis: '2023067',
      name: 'Maya Putri',
      class: 'X IPS 2',
      major: 'IPS',
      category: 'Sosial',
      problem: 'Pergaulan dengan kelompok yang kurang sehat',
      letterWarning: 1,
      status: 'Dalam Pengawasan',
      lastUpdate: '2024-11-30',
      counselor: 'Bu Sarah Wijaya',
    },
    {
      id: 5,
      nis: '2023089',
      name: 'Rian Wijaya',
      class: 'XI MIPA 2',
      major: 'MIPA',
      category: 'Perilaku',
      problem: 'Sering merokok di lingkungan sekolah',
      letterWarning: 1,
      status: 'Mendapat SP',
      lastUpdate: '2024-12-01',
      counselor: 'Bapak Hendra Saputra',
    },
  ]

  // Sample counseling sessions for selected student
  const counselingSessions: CounselingSession[] = [
    {
      id: 1,
      sessionNumber: 'Sesi 1',
      counselor: 'Bu Sarah Wijaya',
      date: '15 Januari 2025',
      title: 'Assessment Awal',
      topic: 'Identifikasi Masalah Perilaku',
      notes: 'Siswa mengakui seringnya berkelahi dikarenakan emosi yang tidak terkontrol. Perlu training manajemen emosi.',
      status: 'Selesai',
    },
    {
      id: 2,
      sessionNumber: 'Sesi 2',
      counselor: 'Bu Sarah Wijaya',
      date: '22 Januari 2025',
      title: 'Manajemen Emosi',
      topic: 'Teknik Kontrol Kemarahan',
      notes: 'Diajarkan teknik breathing dan self-talk positif. Siswa mulai menunjukkan pemahaman.',
      status: 'Selesai',
    },
    {
      id: 3,
      sessionNumber: 'Sesi 3',
      counselor: 'Bu Sarah Wijaya',
      date: '29 Januari 2025',
      title: 'Follow-up & Monitoring',
      topic: 'Evaluasi Penerapan Teknik',
      notes: 'Ada progres, tapi masih perlu dipantau ketat. Orang tua sudah dilibatkan dalam pembinaan.',
      status: 'Selesai',
    },
    {
      id: 4,
      sessionNumber: 'Sesi 4',
      counselor: 'Bu Sarah Wijaya',
      date: '05 Februari 2025',
      title: 'Pembinaan Lanjutan',
      topic: 'Resolusi Konflik',
      notes: 'Masih dalam fase pembinaan. Akan dilakukan monitoring lebih ketat bulan depan.',
      status: 'Terjadwal',
    },
  ]

  const filteredStudents = problemStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nis.includes(searchQuery) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'Semua' || student.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: problemStudents.length,
    dalam_pengawasan: problemStudents.filter(s => s.status === 'Dalam Pengawasan').length,
    butuh_bimbingan: problemStudents.filter(s => s.status === 'Butuh Bimbingan').length,
    mendapat_sp: problemStudents.filter(s => s.status === 'Mendapat SP').length,
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Status Bimbingan Siswa</h2>
              <p className="text-orange-50">Pantau status bimbingan dan perkembangan siswa yang memerlukan perhatian khusus</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard
            icon={<AlertTriangle className="w-12 h-12" />}
            label="Total Siswa Bermasalah"
            value={stats.total}
            color="bg-gradient-to-br from-red-400 to-red-600"
          />
          <StatCard
            icon={<Eye className="w-12 h-12" />}
            label="Dalam Pengawasan"
            value={stats.dalam_pengawasan}
            color="bg-gradient-to-br from-yellow-400 to-yellow-600"
          />
          <StatCard
            icon={<TrendingUp className="w-12 h-12" />}
            label="Butuh Bimbingan"
            value={stats.butuh_bimbingan}
            color="bg-gradient-to-br from-orange-400 to-orange-600"
          />
          <StatCard
            icon={<Award className="w-12 h-12" />}
            label="Mendapat SP"
            value={stats.mendapat_sp}
            color="bg-gradient-to-br from-pink-400 to-pink-600"
          />
        </div>

        {/* Filters & Search */}
        <section className="mt-6 bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Pencarian & Filter</h3>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NIS, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Status
              </p>
              <div className="flex flex-wrap gap-2">
                {(['Semua', 'Dalam Pengawasan', 'Butuh Bimbingan', 'Mendapat SP'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      filterStatus === status
                        ? 'bg-red-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <p className="text-sm text-gray-600 pt-2">
              Menampilkan <span className="font-semibold">{filteredStudents.length}</span> siswa dari <span className="font-semibold">{stats.total}</span> total siswa
            </p>
          </div>
        </section>

        {/* Student Cards */}
        <section className="mt-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Daftar Siswa Bermasalah</h3>
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStudents.map((student) => (
                <StudentProblemCard
                  key={student.id}
                  {...student}
                  onOpenSession={() => {
                    setSelectedStudent(student)
                    setSelectedSession(counselingSessions[0])
                    setIsModalOpen(true)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Tidak ada siswa yang sesuai dengan filter pencarian</p>
            </div>
          )}
        </section>

        {/* Info Box */}
        <section className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Catatan Penting</h4>
                <p className="text-sm text-red-800 mb-3">
                  Pantau perkembangan siswa secara berkala dan lakukan intervensi sesuai dengan status dan kategori masalah yang dihadapi. Komunikasi dengan konselor dan orang tua sangat penting untuk keberhasilan pembinaan.
                </p>
                <button className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Hubungi Konselor
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Session Detail Modal */}
      {isModalOpen && selectedSession && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
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
        </>
      )}
    </div>
  )
}

export default StatusBimbinganPage
