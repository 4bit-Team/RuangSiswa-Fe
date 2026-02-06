'use client'

import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, TrendingUp, BarChart3, Clock } from 'lucide-react';
import AttendanceDetailModal from '../modals/AttendanceDetailModal';

interface AttendanceRecord {
  date: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Tanpa Keterangan';
  time?: string;
  notes?: string;
}

interface MonthlyStats {
  totalDays: number;
  presentDays: number;
  sickDays: number;
  permissionDays: number;
  noExcuseDays: number;
}

const KehadiranPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sample data untuk kehadiran
  const attendanceData: AttendanceRecord[] = [
    { date: '2025-02-06', status: 'Hadir', time: '07:15' },
    { date: '2025-02-05', status: 'Hadir', time: '07:20' },
    { date: '2025-02-04', status: 'Sakit', notes: 'Demam tinggi' },
    { date: '2025-02-03', status: 'Hadir', time: '07:10' },
    { date: '2025-01-31', status: 'Tanpa Keterangan', notes: 'Tidak ada informasi' },
    { date: '2025-01-30', status: 'Izin', notes: 'Acara keluarga' },
    { date: '2025-01-29', status: 'Hadir', time: '07:25' },
    { date: '2025-01-28', status: 'Hadir', time: '07:18' },
  ];

  // Calculate monthly stats
  const monthlyStats: MonthlyStats = {
    totalDays: 20,
    presentDays: 18,
    sickDays: 1,
    permissionDays: 1,
    noExcuseDays: 1
  };

  const attendancePercentage = Math.round((monthlyStats.presentDays / monthlyStats.totalDays) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'Sakit':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Izin':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Tanpa Keterangan':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Hadir':
        return <CheckCircle className="w-5 h-5" />;
      case 'Sakit':
        return <AlertCircle className="w-5 h-5" />;
      case 'Izin':
        return <Clock className="w-5 h-5" />;
      case 'Tanpa Keterangan':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">📊 Rekap Kehadiran</h2>
        <p className="text-green-50">Pantau catatan kehadiran Anda secara detail setiap hari</p>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Attendance Percentage Card */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Persentase Kehadiran</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(attendancePercentage / 100) * 251} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{attendancePercentage}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Status Kehadiran</p>
              <p className="text-lg font-bold text-green-600">Sangat Baik ✅</p>
              <p className="text-xs text-gray-500 mt-2">
                {monthlyStats.presentDays} dari {monthlyStats.totalDays} hari hadir
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-xs text-gray-600 font-medium">Hadir</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{monthlyStats.presentDays}</p>
          <p className="text-xs text-green-600 mt-1">Hari</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-xs text-gray-600 font-medium">Sakit</p>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{monthlyStats.sickDays}</p>
          <p className="text-xs text-yellow-600 mt-1">Hari</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-xs text-gray-600 font-medium">Tanpa Ket.</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{monthlyStats.noExcuseDays}</p>
          <p className="text-xs text-red-600 mt-1">Hari</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Bulan</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((month, idx) => (
              <option key={idx} value={idx}>{month}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Tahun</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Riwayat Kehadiran Terbaru
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {attendanceData.map((record, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedRecord(record);
                setIsDetailModalOpen(true);
              }}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${getStatusColor(record.status).split(' ')[0]} ${getStatusColor(record.status).split(' ')[2]}`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {record.notes && (
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                  {record.time && (
                    <p className="text-xs text-gray-600 mt-2">Jam: {record.time}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 <strong>Tips:</strong> Kehadiran yang baik adalah kunci kesuksesan akademik. Pastikan untuk selalu hadir tepat waktu kecuali ada alasan yang jelas dan mohon izin terlebih dahulu.
        </p>
      </div>

      {/* Attendance Detail Modal */}
      <AttendanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
};

export default KehadiranPage;
