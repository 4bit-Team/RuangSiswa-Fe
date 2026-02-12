'use client'

import React, { useState } from 'react';
import { Clock, AlertTriangle, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import TardinessDetailModal from '../modals/TardinessDetailModal';

interface TardinessRecord {
  date: string;
  time: string;
  minutesLate: number;
  reason?: string;
  status: 'Recorded' | 'Resolved' | 'Pending';
}

interface TardinessStats {
  currentMonth: number;
  lastMonth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  totalMinutes: number;
  averageMinutes: number;
}

const KetarlatanganPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRecord, setSelectedRecord] = useState<TardinessRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sample data untuk keterlambatan
  const tardinessData: TardinessRecord[] = [
    { date: '2025-02-05', time: '07:35', minutesLate: 25, reason: 'Kemacetan lalu lintas', status: 'Resolved' },
    { date: '2025-02-01', time: '07:28', minutesLate: 18, reason: 'Bangun kesiangan', status: 'Resolved' },
    { date: '2025-01-28', time: '07:42', minutesLate: 32, reason: 'Masalah transportasi', status: 'Resolved' },
    { date: '2025-01-25', time: '07:20', minutesLate: 10, reason: undefined, status: 'Resolved' },
    { date: '2025-01-22', time: '07:45', minutesLate: 35, reason: 'Sakit di rumah', status: 'Resolved' },
  ];

  // Calculate statistics
  const tardinessStats: TardinessStats = {
    currentMonth: 2,
    lastMonth: 4,
    trend: 'decreasing',
    totalMinutes: 120,
    averageMinutes: Math.round(120 / tardinessData.length)
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Resolved':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: '✅ Terselesaikan' };
      case 'Pending':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: '⏳ Menunggu' };
      case 'Recorded':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: '📝 Tercatat' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-4 md:p-8 text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">⏰ Rekap Keterlambatan</h2>
        <p className="text-orange-50 text-sm md:text-base">Pantau catatan keterlambatan dan capai kehadiran yang lebih disiplin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Current Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Bulan Ini</p>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{tardinessStats.currentMonth}</p>
          <p className="text-sm sm:text-xs text-gray-500 mt-2">Kali terlambat</p>
        </div>

        {/* Last Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Bulan Lalu</p>
            <TrendingUp className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{tardinessStats.lastMonth}</p>
          <p className="text-sm sm:text-xs text-green-600 mt-2">↓ Menurun {tardinessStats.lastMonth - tardinessStats.currentMonth} kali</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Bulan</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tardiness Records */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Riwayat Keterlambatan
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {tardinessData.length > 0 ? (
            tardinessData.map((record, idx) => {
              const statusVariant = getStatusVariant(record.status);
              return (
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
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 text-orange-600">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-600">
                          Masuk pukul {record.time} ({record.minutesLate} menit terlambat)
                        </p>
                        {record.reason && (
                          <p className="text-sm sm:text-xs text-gray-500 mt-1">Alasan: {record.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-sm sm:text-xs font-semibold border ${statusVariant.bg} ${statusVariant.border} ${statusVariant.text}`}>
                        {statusVariant.label}
                      </span>
                      <p className="text-sm font-bold text-orange-600 mt-2">{record.minutesLate}m</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Tidak ada keterlambatan!</p>
              <p className="text-sm text-gray-600">Terus pertahankan disiplin waktu anda</p>
            </div>
          )}
        </div>
      </div>

      {/* Problem Tracking Info */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 mb-1">Peringatan Sistem</p>
            <p className="text-sm text-red-700">
              Keterlambatan yang sering dapat di-track di sistem Kesiswaan dan dapat menjadi masalah bimbingan. Jika keterlambatan terus meningkat, Guru BK akan memberikan bimbingan khusus.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 <strong>Tips:</strong> Coba atur alarm lebih awal atau siapkan waktu untuk perjalanan. Disiplin waktu adalah kebiasaan yang dapat dipelajari dan ditingkatkan setiap harinya.
        </p>
      </div>

      {/* Tardiness Detail Modal */}
      <TardinessDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
};

export default KetarlatanganPage;
