'use client'

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Users, Target, FileText, AlertCircle } from 'lucide-react';
import ViolationDetailModal from '../modals/ViolationDetailModal';

interface ViolationRecord {
  id: number;
  date: string;
  category: 'Disiplin' | 'Akademik' | 'Perilaku';
  description: string;
  reportedBy: string;
  severity: 'Ringan' | 'Sedang' | 'Berat';
  resolutionStatus: 'Pending' | 'Dalam Proses' | 'Tuntas';
  guidanceSessions: number;
  followUpActions?: string[];
  notes?: string;
}

const PelanggaranPage: React.FC = () => {
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecord | null>(null);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Dalam Proses' | 'Tuntas'>('All');

  // Sample violation data integrated with Kesiswaan system
  const violationData: ViolationRecord[] = [
    {
      id: 1,
      date: '2025-01-20',
      category: 'Disiplin',
      description: 'Tidak memakai seragam lengkap saat masuk sekolah',
      reportedBy: 'Guru BK',
      severity: 'Ringan',
      resolutionStatus: 'Tuntas',
      guidanceSessions: 1,
      followUpActions: ['Konseling ringan dengan Guru BK'],
      notes: 'Siswa telah memperbaiki perilakunya dan konsisten memakai seragam lengkap'
    },
    {
      id: 2,
      date: '2025-02-01',
      category: 'Perilaku',
      description: 'Terlibat konflik dengan teman sekelas',
      reportedBy: 'Wali Kelas',
      severity: 'Sedang',
      resolutionStatus: 'Dalam Proses',
      guidanceSessions: 2,
      followUpActions: ['Sesi bimbingan intensif', 'Mediasi antar siswa'],
      notes: 'Sedang menjalani proses bimbingan intensif bersama Guru BK'
    },
    {
      id: 3,
      date: '2025-02-05',
      category: 'Disiplin',
      description: 'Menggunakan telepon pintar di dalam kelas',
      reportedBy: 'Guru Mapel',
      severity: 'Ringan',
      resolutionStatus: 'Tuntas',
      guidanceSessions: 1,
      followUpActions: ['Pemberian teguran lisan dan catatan', 'Pemahaman tata tertib'],
      notes: 'Siswa mengerti dan setuju untuk tidak membawa HP saat pelajaran'
    },
    {
      id: 4,
      date: '2025-02-10',
      category: 'Akademik',
      description: 'Mencontek saat ujian',
      reportedBy: 'Guru Mapel',
      severity: 'Berat',
      resolutionStatus: 'Pending',
      guidanceSessions: 0,
      followUpActions: [],
      notes: 'Menunggu jadwal bimbingan dengan Guru BK untuk evaluasi dan pemberian pembinaan'
    }
  ];

  const filteredViolations = filterStatus === 'All'
    ? violationData
    : violationData.filter(v => v.resolutionStatus === filterStatus);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Disiplin':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' };
      case 'Akademik':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' };
      case 'Perilaku':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-600' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Ringan':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Sedang':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Berat':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tuntas':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600', label: '✅ Selesai' };
      case 'Dalam Proses':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600', label: '⏳ Proses' };
      case 'Pending':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600', label: '🔴 Menunggu' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-600', label: 'Unknown' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">⚠️ Catatan Pelanggaran & Status Penyelesaian</h2>
        <p className="text-red-50">Pantau pelanggaran Anda dan status bimbingan dari Guru BK</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Total Pelanggaran</p>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{violationData.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Selesai</p>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {violationData.filter(v => v.resolutionStatus === 'Tuntas').length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Dalam Proses</p>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {violationData.filter(v => v.resolutionStatus === 'Dalam Proses').length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Menunggu Proses</p>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            {violationData.filter(v => v.resolutionStatus === 'Pending').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-sm font-medium text-gray-700 block mb-3">Filter Status Penyelesaian</label>
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Pending', 'Dalam Proses', 'Tuntas'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'All' ? 'Semua' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Violation Records */}
      <div className="space-y-4">
        {filteredViolations.length > 0 ? (
          filteredViolations.map((violation) => {
            const categoryColor = getCategoryColor(violation.category);
            const statusColor = getStatusColor(violation.resolutionStatus);

            const handleOpenModal = () => {
              setSelectedViolation(violation);
              setIsViolationModalOpen(true);
            };

            return (
              <div
                key={violation.id}
                onClick={handleOpenModal}
                className={`${categoryColor.bg} border-2 ${categoryColor.border} rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Icon & Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-white ${categoryColor.bg} border ${categoryColor.border} flex-shrink-0`}>
                      {violation.category === 'Disiplin' && <AlertTriangle className={`w-6 h-6 ${categoryColor.icon}`} />}
                      {violation.category === 'Akademik' && <Target className={`w-6 h-6 ${categoryColor.icon}`} />}
                      {violation.category === 'Perilaku' && <Users className={`w-6 h-6 ${categoryColor.icon}`} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${categoryColor.text} bg-white ${categoryColor.border}`}>
                          {violation.category}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 mb-1 line-clamp-2">{violation.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>📅 {new Date(violation.date).toLocaleDateString('id-ID')}</span>
                        <span>📝 {violation.reportedBy}</span>
                        <span>💬 {violation.guidanceSessions} sesi</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <div className={`px-4 py-2 rounded-lg text-xs font-semibold border whitespace-nowrap ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}>
                      {statusColor.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900">Tidak ada pelanggaran!</p>
            <p className="text-gray-600 mt-2">Terus jaga disiplin dan perilaku baik Anda di sekolah</p>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Sistem Penyelesaian Masalah</p>
            <p className="text-sm text-blue-700">
              Setiap pelanggaran melalui proses bimbingan yang terstruktur sesuai dengan sistem Kesiswaan. 
              Anda akan mendapatkan kesempatan untuk memperbaiki diri melalui sesi bimbingan dengan Guru BK. 
              Status pelanggaran akan diperbarui sesuai dengan progress Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Flowchart Reference */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h3 className="font-bold text-purple-900 mb-3">📊 Alur Penyelesaian Masalah</h3>
        <div className="space-y-2 text-sm text-purple-700">
          <p>1️⃣ <strong>Identifikasi Masalah</strong> - Pelanggaran dicatat</p>
          <p>2️⃣ <strong>Bimbingan</strong> - Sesi dengan Guru BK untuk memahami masalah</p>
          <p>3️⃣ <strong>Evaluasi Status</strong> - Perbaikan dinilai (Tuntas/Tidak Tuntas)</p>
          <p>4️⃣ <strong>Tindak Lanjut</strong> - Jika belum tuntas, ada program lanjutan</p>
          <p>5️⃣ <strong>Referral</strong> - Jika perlu, dirujuk ke ahli yang sesuai</p>
        </div>
      </div>

      {/* Violation Detail Modal */}
      <ViolationDetailModal
        isOpen={isViolationModalOpen}
        onClose={() => setIsViolationModalOpen(false)}
        violation={selectedViolation}
      />
    </div>
  );
};

export default PelanggaranPage;
