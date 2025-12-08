'use client'

import React, { useState } from 'react'
import { BookOpen, CheckCircle, TrendingUp, Award, User, MessageSquare } from 'lucide-react'
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
