'use client'

import React from 'react';
import BaseModal from './BaseModal';
import { AlertTriangle, Target, Users, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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

interface ViolationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  violation: ViolationRecord | null;
}

const ViolationDetailModal: React.FC<ViolationDetailModalProps> = ({ isOpen, onClose, violation }) => {
  if (!violation) return null;

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

  const categoryColor = getCategoryColor(violation.category);
  const statusColor = getStatusColor(violation.resolutionStatus);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pelanggaran"
      subtitle={violation.description}
      icon={
        violation.category === 'Disiplin' ? (
          <AlertTriangle className={`w-6 h-6 ${categoryColor.icon}`} />
        ) : violation.category === 'Akademik' ? (
          <Target className={`w-6 h-6 ${categoryColor.icon}`} />
        ) : (
          <Users className={`w-6 h-6 ${categoryColor.icon}`} />
        )
      }
      headerGradient={
        violation.category === 'Disiplin'
          ? 'bg-gradient-to-r from-red-500 to-rose-600'
          : violation.category === 'Akademik'
          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
          : 'bg-gradient-to-r from-orange-500 to-amber-600'
      }
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Category & Severity Badges */}
        <div className="flex gap-2 flex-wrap">
          <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${categoryColor.text} bg-white ${categoryColor.border}`}>
            {violation.category}
          </span>
          <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getSeverityColor(violation.severity)}`}>
            {violation.severity}
          </span>
          <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}>
            {statusColor.label}
          </span>
        </div>

        {/* Date & Reporter */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 font-medium mb-1">Tanggal Pelanggaran</p>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(violation.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium mb-1">Dilaporkan Oleh</p>
            <p className="text-sm font-semibold text-gray-900">{violation.reportedBy}</p>
          </div>
        </div>

        {/* Full Description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className={`w-4 h-4 ${categoryColor.icon}`} />
            <p className="font-semibold text-gray-900">Deskripsi Pelanggaran</p>
          </div>
          <p className={`text-sm ${categoryColor.text} leading-relaxed`}>{violation.description}</p>
        </div>

        {/* Guidance Sessions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className={`w-4 h-4 ${categoryColor.icon}`} />
            <p className="font-semibold text-gray-900">Sesi Bimbingan</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${categoryColor.bg} border-current border-opacity-20`}>
            <p className={`text-sm ${categoryColor.text}`}>
              {violation.guidanceSessions > 0 ? (
                <>
                  <strong>{violation.guidanceSessions} sesi bimbingan</strong> telah dilakukan dengan Guru BK
                </>
              ) : (
                <>
                  <strong>Belum ada sesi bimbingan</strong> - Menunggu jadwal dengan Guru BK
                </>
              )}
            </p>
          </div>
        </div>

        {/* Follow-up Actions */}
        {violation.followUpActions && violation.followUpActions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className={`w-4 h-4 ${categoryColor.icon}`} />
              <p className="font-semibold text-gray-900">Tindak Lanjut</p>
            </div>
            <div className="space-y-2">
              {violation.followUpActions.map((action, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${categoryColor.bg} border-2 border-current border-opacity-20`}>
                  <p className={`text-sm ${categoryColor.text} flex items-center gap-2`}>
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'currentColor' }}></span>
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {violation.notes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-4 h-4 ${categoryColor.icon}`} />
              <p className="font-semibold text-gray-900">Catatan dari Guru BK</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${categoryColor.bg} border-current border-opacity-20`}>
              <p className={`text-sm ${categoryColor.text} leading-relaxed`}>{violation.notes}</p>
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div className={`p-4 rounded-lg border-2 ${statusColor.bg} ${statusColor.border}`}>
          <div className="flex items-start gap-3">
            {statusColor.label === '✅ Selesai' && <CheckCircle className={`w-5 h-5 ${statusColor.icon}`} />}
            {statusColor.label === '⏳ Proses' && <Clock className={`w-5 h-5 ${statusColor.icon}`} />}
            {statusColor.label === '🔴 Menunggu' && <AlertCircle className={`w-5 h-5 ${statusColor.icon}`} />}
            <div>
              <p className={`font-semibold ${statusColor.text}`}>Status: {statusColor.label}</p>
              <p className={`text-sm ${statusColor.text} mt-1`}>
                {violation.resolutionStatus === 'Pending' &&
                  'Pelanggaran ini sedang dalam proses identifikasi. Segera hubungi Guru BK untuk memulai proses bimbingan.'}
                {violation.resolutionStatus === 'Dalam Proses' &&
                  'Anda sedang menjalani proses bimbingan. Ikuti semua jadwal dan petunjuk dari Guru BK untuk penyelesaian terbaik.'}
                {violation.resolutionStatus === 'Tuntas' &&
                  'Pelanggaran telah terselesaikan. Terus jaga perilaku baik Anda dan hindari pelanggaran serupa di masa depan.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-4 flex gap-3 flex-wrap">
          {violation.resolutionStatus === 'Pending' && (
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Hubungi Guru BK
            </button>
          )}
          {violation.resolutionStatus === 'Dalam Proses' && (
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Lihat Jadwal Bimbingan
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ViolationDetailModal;
