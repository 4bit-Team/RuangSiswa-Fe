'use client'

import React, { useState } from 'react'
import { Calendar, Check, X, Clock, TrendingUp } from 'lucide-react'

interface AttendanceRecord {
  id: number
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

  // Sample data
  const stats: AttendanceStats = {
    totalHadir: 18,
    totalSakit: 2,
    totalIzin: 1,
    totalAlpa: 0,
    attendancePercentage: 95,
  }

  const attendanceRecords: AttendanceRecord[] = [
    { id: 1, date: '2025-01-30', status: 'Hadir', time: '07:15' },
    { id: 2, date: '2025-01-29', status: 'Hadir', time: '07:10' },
    { id: 3, date: '2025-01-28', status: 'Hadir', time: '07:20' },
    { id: 4, date: '2025-01-27', status: 'Sakit', notes: 'Demam' },
    { id: 5, date: '2025-01-24', status: 'Hadir', time: '07:05' },
    { id: 6, date: '2025-01-23', status: 'Izin', notes: 'Kegiatan sekolah' },
    { id: 7, date: '2025-01-22', status: 'Hadir', time: '07:18' },
    { id: 8, date: '2025-01-21', status: 'Hadir', time: '07:12' },
  ]

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* Attendance Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
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
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg">Riwayat Kehadiran</h3>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Waktu Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <AttendanceStatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.time || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Informasi Kehadiran</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Kehadiran setiap hari dicatat otomatis oleh sistem</li>
          <li>• Jika Anda sakit atau izin, harap informasikan ke guru piket</li>
          <li>• Target kehadiran minimum adalah 95% per semester</li>
          <li>• Kehadiran berpengaruh pada nilai rapor akhir</li>
        </ul>
      </div>
    </div>
  )
}

export default KehadiranPage
