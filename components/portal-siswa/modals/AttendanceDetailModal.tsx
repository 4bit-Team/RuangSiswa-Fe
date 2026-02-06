'use client'

import React from 'react';
import BaseModal from './BaseModal';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Tanpa Keterangan';
  time?: string;
  notes?: string;
}

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({ isOpen, onClose, record }) => {
  if (!record) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Hadir':
        return {
          color: 'bg-green-50 border-green-200 text-green-700',
          icon: 'text-green-600',
          label: '✅ Hadir',
          gradient: 'bg-gradient-to-r from-green-500 to-emerald-600',
        };
      case 'Sakit':
        return {
          color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          icon: 'text-yellow-600',
          label: '🤒 Sakit',
          gradient: 'bg-gradient-to-r from-yellow-500 to-amber-600',
        };
      case 'Izin':
        return {
          color: 'bg-blue-50 border-blue-200 text-blue-700',
          icon: 'text-blue-600',
          label: '📝 Izin',
          gradient: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        };
      case 'Tanpa Keterangan':
        return {
          color: 'bg-red-50 border-red-200 text-red-700',
          icon: 'text-red-600',
          label: '❌ Tanpa Keterangan',
          gradient: 'bg-gradient-to-r from-red-500 to-rose-600',
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Kehadiran"
      subtitle={dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
      icon={<CheckCircle className={`w-6 h-6 ${info.icon}`} />}
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

        {/* Time Info */}
        {record.time && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${info.icon}`} />
              <div>
                <p className="text-xs text-gray-600 font-medium">Jam Masuk</p>
                <p className="text-lg font-bold text-gray-900">{record.time}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Catatan</p>
            <div className={`p-4 rounded-lg border-2 ${info.color}`}>
              <p className="text-sm leading-relaxed">{record.notes}</p>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            💡 Data kehadiran ini akan mempengaruhi perhitungan persentase kehadiran Anda setiap bulan. 
            Kehadiran yang baik adalah kunci kesuksesan akademik!
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

export default AttendanceDetailModal;
