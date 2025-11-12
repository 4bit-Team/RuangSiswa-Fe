'use client'

import React from 'react';
import { Heart, MessageCircle, Calendar, Users } from 'lucide-react';
import { StatCardProps, UpdateCardProps } from '@types';


const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

// Wrapper component untuk konten
const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pt-16 px-8">
    {children}
  </div>
);

const UpdateCard: React.FC<UpdateCardProps> = ({ avatar, name, time, message, likes, comments }) => (
  <div className="border border-gray-200 rounded-xl p-6">
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-semibold">{avatar}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <span className="text-sm text-gray-500">{time}</span>
        </div>
        <p className="text-gray-700 leading-relaxed">{message}</p>
        <div className="flex items-center gap-6 mt-4">
          <button className="flex items-center gap-2 text-gray-500 hover:text-pink-600">
            <Heart className="w-5 h-5" />
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
            <MessageCircle className="w-5 h-5" />
            <span>{comments}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  return (

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Selamat Datang di Portal BK! 👋</h2>
          <p className="text-blue-50">Tempat yang aman untuk berbagi, berkonsultasi, dan berkembang bersama</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Heart} label="Sesi Konseling" value="12" color="bg-pink-50 text-pink-600" />
          <StatCard icon={MessageCircle} label="Konsultasi Bulan Ini" value="8" color="bg-green-50 text-green-600" />
          <StatCard icon={Calendar} label="Reservasi Aktif" value="3" color="bg-orange-50 text-orange-600" />
          <StatCard icon={Users} label="Progres Pribadi" value="85%" color="bg-blue-50 text-blue-600" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Update dari BK</h3>
          <div className="space-y-4">
            <UpdateCard
              avatar="S"
              name="Bu Sarah - Konselor BK"
              time="2 jam yang lalu"
              message="Selamat pagi siswa-siswi! 🌟 Jangan lupa bahwa setiap tantangan adalah kesempatan untuk berkembang. Jika ada yang ingin dibicarakan, konselor BK selalu siap membantu kalian."
              likes={42}
              comments={8}
            />
            <UpdateCard
              avatar="B"
              name="Pak Budi - Konselor BK"
              time="5 jam yang lalu"
              message="Reminder: Sesi konseling kelompok mengenai 'Mengelola Stress Ujian' akan diadakan besok pukul 14.00 di ruang BK. Pendaftaran masih dibuka untuk 5 siswa lagi. Silakan daftar melalui menu Reservasi!"
              likes={28}
              comments={12}
            />
          </div>
        </div>
      </div>

  );
};


export default DashboardPage;