'use client'

import React from 'react';
import BaseModal from './BaseModal';
import { Clock, AlertTriangle } from 'lucide-react';

interface TardinessRecord {
  date: string;
  time: string;
  minutesLate: number;
  reason?: string;
  status: 'Recorded' | 'Resolved' | 'Pending';
}

interface TardinessDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: TardinessRecord | null;
}

const TardinessDetailModal: React.FC<TardinessDetailModalProps> = ({ isOpen, onClose, record }) => {
  if (!record) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Resolved':
        return {
          color: 'bg-green-50 border-green-200 text-green-700',
          icon: 'text-green-600',
          label: '✅ Terselesaikan',
          gradient: 'bg-gradient-to-r from-green-500 to-emerald-600',
        };
      case 'Pending':
        return {
          color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          icon: 'text-yellow-600',
          label: '⏳ Menunggu',
          gradient: 'bg-gradient-to-r from-yellow-500 to-amber-600',
        };
      case 'Recorded':
        return {
          color: 'bg-blue-50 border-blue-200 text-blue-700',
          icon: 'text-blue-600',
          label: '📝 Tercatat',
          gradient: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        };
      default:
        return {
          color: 'bg-gray-50 border-gray-200 text-gray-700',
          icon: 'text-gray-600',
          label: 'Unknown',
          gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
        };
    }
  };

  const info = getStatusInfo(record.status);
  const dateObj = new Date(record.date);
  const isSevereTardiness = record.minutesLate > 30;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Keterlambatan"
      subtitle={dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
      icon={<Clock className={`w-6 h-6 ${info.icon}`} />}
      headerGradient={info.gradient}
      width="max-w-md"
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className={`inline-block px-6 py-3 rounded-lg text-lg font-bold border-2 ${info.color}`}>
            {info.label}
          </span>
        </div>

        {/* Time Details */}
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Jam Masuk</span>
              <span className="text-lg font-bold text-gray-900">{record.time}</span>
            </div>
          </div>

          <div className={`rounded-lg p-4 border-2 ${info.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Keterlambatan</span>
              <span className="text-2xl font-bold">{record.minutesLate}</span>
            </div>
            <p className="text-xs text-current mt-1 opacity-70">menit</p>
          </div>
        </div>

        {/* Reason */}
        {record.reason && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Alasan</p>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-700">{record.reason}</p>
            </div>
          </div>
        )}

        {/* Warning if severe tardiness */}
        {isSevereTardiness && record.status !== 'Resolved' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Perhatian!</p>
              <p className="text-xs text-red-700 mt-1">
                Keterlambatan lebih dari 30 menit dapat memicu pembukaan masalah di sistem Kesiswaan. 
                Pastikan untuk berkomunikasi dengan Guru BK jika ini berulang.
              </p>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            💡 Keterlambatan yang sering dapat mempengaruhi prestasi Anda. Cobalah untuk datang lebih awal 
            dan hindari hal-hal yang menyebabkan keterlambatan. Jika ada masalah, bicarakan dengan orang tua 
            dan Guru BK.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
        >
          Tutup
        </button>
      </div>
    </BaseModal>
  );
};

export default TardinessDetailModal;
