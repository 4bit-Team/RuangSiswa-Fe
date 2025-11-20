"use client"

import React, { useState } from 'react'
import { Users, Video, Calendar, Clock, Check } from 'lucide-react'
import { ReservationItemProps } from '@types'
import CounselorCardWithModal from './CounselorCardWithModal'

const ReservationItem: React.FC<ReservationItemProps> = ({ icon: Icon, type, tag, tagColor, counselor, date, time, status, statusColor }) => (
  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-4 flex-1">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="font-semibold text-gray-900">{type}</h5>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${tagColor}`}>{tag}</span>
        </div>
        <p className="text-sm text-gray-600">{counselor} • {date} • {time}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className={`font-medium ${statusColor}`}>{status}</span>
      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Detail</button>
    </div>
  </div>
)

const ReservasiPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('tatap-muka')

  return (
    <div className="pt-16 px-8 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Reservasi Konseling</h3>
        <p className="text-gray-600 mb-6">Buat reservasi untuk chat atau bertemu langsung dengan konselor</p>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Reservasi Saya</h4>
          <div className="space-y-3">
            <ReservationItem icon={Users} type="Konseling Tatap Muka" tag="Tatap Muka" tagColor="bg-blue-100 text-blue-700" counselor="Bu Sarah" date="25 Oktober 2025" time="10:00" status="Terkonfirmasi" statusColor="text-green-600" />
            <ReservationItem icon={Video} type="Sesi Chat" tag="Chat" tagColor="bg-purple-100 text-purple-700" counselor="Pak Budi" date="26 Oktober 2025" time="14:00" status="Menunggu" statusColor="text-yellow-600" />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setSelectedTab('tatap-muka')} className={`flex-1 py-3 rounded-lg font-medium transition-colors duration-200 ${selectedTab === 'tatap-muka' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tatap Muka
          </button>
          <button onClick={() => setSelectedTab('sesi-chat')} className={`flex-1 py-3 rounded-lg font-medium transition-colors duration-200 ${selectedTab === 'sesi-chat' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Sesi Chat
          </button>
        </div>

        <h4 className="font-semibold text-gray-900 mb-4">Pilih Konselor</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CounselorCardWithModal 
            initial="S" 
            name="Bu Sarah Wijaya" 
            status="Tersedia" 
            statusColor="bg-green-500" 
            specialty="Konseling Pribadi & Emosional"
            selectedTab={selectedTab}
          />
          <CounselorCardWithModal 
            initial="B" 
            name="Pak Budi Santoso" 
            status="Tersedia" 
            statusColor="bg-green-500" 
            specialty="Konseling Akademik & Karir"
            selectedTab={selectedTab}
          />
          <CounselorCardWithModal 
            initial="D" 
            name="Bu Dina Kartika" 
            status="Tidak Tersedia" 
            statusColor="bg-gray-400" 
            specialty="Konseling Sosial & Pertemanan"
            selectedTab={selectedTab}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-2">Pilih Tanggal</h4>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">24 Oktober 2025</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Gunakan kalender untuk memilih tanggal yang tersedia</p>

          <h4 className="font-semibold text-gray-900 mb-4">Pilih Waktu</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((time, idx) => (
              <button key={idx} className={`py-3 rounded-lg border-2 transition-all duration-200 ${idx === 2 || idx === 6 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`} disabled={idx === 2 || idx === 6}>
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{time}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Detail Reservasi</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Tipe: Konseling {selectedTab === 'tatap-muka' ? 'Tatap Muka' : 'Chat'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Tanggal: 24 Oktober 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Waktu: Pilih dari menu di atas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ReservasiPage