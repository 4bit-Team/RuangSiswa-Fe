'use client'

import React from 'react';
import { Bell, Shield, ChevronRight } from 'lucide-react';
import { HistoryItemProps, SettingItemProps } from '../types';


const HistoryItem: React.FC<HistoryItemProps> = ({ title, counselor, date, status, statusColor }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200">
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{counselor} • {date}</p>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor} bg-opacity-10`}>
      {status}
    </span>
  </div>
);

const SettingItem: React.FC<SettingItemProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </div>
);

const ProfilPage: React.FC = () => (
  <div className="p-8 max-w-4xl mx-auto space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-3xl text-white font-semibold">A</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Andi</h2>
          <p className="text-gray-500">Kelas XII IPA 1</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Total Sesi</p>
          <p className="text-xl font-bold text-gray-900">24</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Sesi Bulan Ini</p>
          <p className="text-xl font-bold text-gray-900">3</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Progres</p>
          <p className="text-xl font-bold text-gray-900">85%</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900">Riwayat Sesi</h3>
        <div className="bg-white rounded-lg border border-gray-200">
          <HistoryItem
            title="Konseling Akademik"
            counselor="Pak Budi"
            date="1 November 2025"
            status="Selesai"
            statusColor="text-green-600"
          />
          <HistoryItem
            title="Konseling Karir"
            counselor="Bu Sarah"
            date="28 Oktober 2025"
            status="Selesai"
            statusColor="text-green-600"
          />
          <HistoryItem
            title="Konseling Pribadi"
            counselor="Bu Rina"
            date="25 Oktober 2025"
            status="Dibatalkan"
            statusColor="text-red-600"
          />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200">
      <h3 className="font-bold text-gray-900 p-4 border-b border-gray-200">
        Pengaturan
      </h3>
      <div>
        <SettingItem icon={Bell} label="Notifikasi" />
        <SettingItem icon={Shield} label="Privasi & Keamanan" />
      </div>
    </div>
  </div>
);

export default ProfilPage;