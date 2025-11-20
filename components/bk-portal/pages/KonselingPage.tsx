"use client"

import React, { useState } from 'react'
import { Heart, MessageSquare, Shield, Clock, Calendar, Users, MessageCircle } from 'lucide-react'
import { SessionItemProps, CounselingCardProps } from '@types'
import { AppointmentScheduleModal } from '../modals'

const SessionItem: React.FC<SessionItemProps> = ({ icon: Icon, title, counselor, date, time, status, statusColor }) => (
  <div className="bg-white rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h5 className="font-semibold text-gray-900">{title}</h5>
        <p className="text-sm text-gray-600">{counselor} • {date} • {time}</p>
      </div>
    </div>
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>{status}</span>
  </div>
)

const CounselingCard: React.FC<CounselingCardProps> = ({ icon: Icon, title, description, duration, color, badge }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <span className="absolute top-0 right-0 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">{badge}</span>
          )}
        </div>
        <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 hover:shadow-lg"
        >
          Buat Janji
        </button>
      </div>

      <AppointmentScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        counselingType={title}
        counselorName="Bu Sarah Wijaya"
      />
    </>
  )
}

const KonselingPage: React.FC = () => (
  <div className="pt-16 px-8 space-y-6">
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-bold text-gray-900 mb-2">Layanan Konseling</h3>
      <p className="text-gray-600 mb-6">Pilih jenis konseling yang sesuai dengan kebutuhan Anda</p>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Sesi Mendatang</h4>
        <div className="space-y-3">
          <SessionItem icon={Heart} title="Konseling Pribadi" counselor="Bu Sarah" date="25 Oktober 2025" time="10:00" status="Terkonfirmasi" statusColor="bg-green-100 text-green-700" />
          <SessionItem icon={MessageSquare} title="Konseling Akademik" counselor="Pak Budi" date="27 Oktober 2025" time="14:00" status="Menunggu" statusColor="bg-yellow-100 text-yellow-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CounselingCard icon={Heart} title="Konseling Pribadi" description="Sesi one-on-one dengan konselor untuk membahas masalah pribadi, emosional, atau sosial" duration="45-60 menit" color="bg-pink-500" />
        <CounselingCard icon={MessageCircle} title="Konseling Akademik" description="Bantuan untuk mengatasi kesulitan belajar, motivasi akademik, dan perencanaan studi" duration="30-45 menit" color="bg-blue-500" />
        <CounselingCard icon={Calendar} title="Konseling Karir" description="Bimbingan untuk eksplorasi minat, bakat, dan perencanaan karir masa depan" duration="60 menit" color="bg-purple-500" />
        <CounselingCard icon={Users} title="Konseling Kelompok" description="Sesi bersama siswa lain untuk membahas topik tertentu dan saling mendukung" duration="90 menit" color="bg-green-500" badge="Terbatas" />
      </div>

      <div className="mt-6 bg-green-50 rounded-xl p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 mb-1">Kerahasiaan Terjamin</p>
            <p className="text-sm text-green-700">Semua informasi dan percakapan Anda dengan konselor BK bersifat rahasia dan dilindungi sesuai dengan kebijakan privasi sekolah.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default KonselingPage
