'use client'

import React, { useState } from 'react'
import { Clock, AlertCircle, TrendingDown, Calendar } from 'lucide-react'
import TardinessDetailModal from '../modals/TardinessDetailModal'

interface TardinessRecord {
  id: number
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
  const [selectedTardiness, setSelectedTardiness] = useState<TardinessRecord | null>(null)

  // Sample data
  const stats: TardinessStats = {
    totalTardiness: 5,
    thisMonth: 2,
    averageMinutes: 8,
    longestLate: 15,
  }

  const tardinessRecords: TardinessRecord[] = [
    { id: 1, date: '2025-01-30', time: '07:45', minutesLate: 5, reason: 'Macet di jalan', status: 'Tercatat' },
    { id: 2, date: '2025-01-28', time: '07:50', minutesLate: 10, reason: 'Bangun kesiangan', status: 'Tercatat' },
    { id: 3, date: '2025-01-20', time: '07:35', minutesLate: 3, reason: 'Macet', status: 'Termaafkan' },
    { id: 4, date: '2025-01-15', time: '07:55', minutesLate: 15, reason: 'Sakit pagi', status: 'Tercatat' },
    { id: 5, date: '2025-01-10', time: '07:40', minutesLate: 8, reason: 'Macet', status: 'Tercatat' },
  ]

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

        {/* Tardiness Records - simplified container */}
        <section className="mt-6">
          <div className="overflow-hidden">
            <div className="p-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Riwayat Keterlambatan</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jam Masuk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Durasi Terlambat</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alasan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tardinessRecords.map((record) => (
                    <tr 
                      key={record.id}
                      onClick={() => {
                        setSelectedTardiness(record)
                        setIsModalOpen(true)
                      }}
                      className="hover:bg-orange-50 transition-colors cursor-pointer"
                    >
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
                  ))}
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
