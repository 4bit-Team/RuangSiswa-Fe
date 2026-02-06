"use client"
import React, { useState } from 'react'
import { 
  BarChart3, User, MessageCircle, Calendar, FileText, TrendingUp, Users, Settings,
  Clock, AlertCircle, Trophy, CheckCircle, ArrowRight, Zap, ChevronRight, Sparkles
} from 'lucide-react'
import type { Feature } from '@/types'

const Features = () => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'bk' | 'kesiswaan'>('siswa')

  // Portal Siswa
  const siswaFeatures: Feature[] = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard Siswa",
      description: "Ringkasan kegiatan, jadwal, dan status permohonan konseling"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Konsultasi Online",
      description: "Sesi konsultasi via chat, voice, dan video dengan guru BK"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Reservasi Janji Temu",
      description: "Pesan jadwal konseling dan terima notifikasi pengingat"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Chat Real-time",
      description: "Komunikasi langsung dengan guru BK dengan dukungan lampiran"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Pusat Berita & Edukasi",
      description: "Artikel, pengumuman, dan konten pengembangan diri dengan like/komentar"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Kehadiran Mingguan",
      description: "Input hadir/sakit/izin/alfa terstruktur per kelas dan jurusan"
    }
  ]

  // Dashboard BK
  const bkFeatures: Feature[] = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard BK",
      description: "Statistik konseling, kehadiran, keterlambatan, dan catatan siswa"
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "Manajemen Siswa",
      description: "Profil lengkap, riwayat konseling, pelanggaran, dan status pemantauan"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Penjadwalan Konseling",
      description: "Pengaturan jadwal BK, kelola request siswa, dan kalender layanan"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Monitoring Siswa Bermasalah",
      description: "Data kasus, status pembinaan, SP level, dan tindak lanjut per siswa"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Chat Internal BK",
      description: "Komunikasi khusus antar guru BK mengenai kasus tertentu"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Dokumentasi Riwayat",
      description: "Pencatatan lengkap riwayat konseling untuk tindak lanjut akurat"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Manajemen Berita & Pengumuman",
      description: "Publikasi konten edukasi dan pengumuman untuk Portal Siswa"
    }
  ]

  // Dashboard Kesiswaan
  const kesiswaanFeatures: Feature[] = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard Kesiswaan",
      description: "Statistik kehadiran, keterlambatan, dan catatan siswa bermasalah"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Manajemen Kehadiran",
      description: "Rekap data absensi tiap kelas dan laporan mingguan/bulanan"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Manajemen Keterlambatan",
      description: "Input digital keterlambatan dan riwayat per siswa dengan SP otomatis"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Monitoring Siswa Bermasalah",
      description: "Data kasus terstruktur, status pembinaan, dan tindak lanjut monitoring"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Pelaporan & Analitik",
      description: "Laporan absensi, keterlambatan, grafik tren pelanggaran, dan efektivitas BK per periode"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Pengaturan Sistem",
      description: "Konfigurasi jurusan, kelas, periode akademik, dan kebijakan SP"
    }
  ]

  const getFeatures = () => {
    switch(activeTab) {
      case 'siswa': return siswaFeatures
      case 'bk': return bkFeatures
      case 'kesiswaan': return kesiswaanFeatures
      default: return siswaFeatures
    }
  }

  const getColorClass = () => {
    switch(activeTab) {
      case 'siswa': return { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' }
      case 'bk': return { icon: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' }
      case 'kesiswaan': return { icon: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300' }
      default: return { icon: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' }
    }
  }

  return (
    <section id="features" className="relative scroll-mt-20 overflow-hidden">
      <style>{`
        .features-section {
          background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f4f8 100%);
          position: relative;
          width: 100%;
          padding: 6rem 0;
        }
        .features-pattern {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.08;
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(59, 130, 246, 0.1) 35px, rgba(59, 130, 246, 0.1) 70px),
            repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(59, 130, 246, 0.1) 35px, rgba(59, 130, 246, 0.1) 70px);
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slideInUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      
      <div className="features-section relative">
        {/* Pattern overlay */}
        <div className="features-pattern absolute inset-0"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Gradient circles */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full blur-3xl opacity-15"></div>
        </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-400/30 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Fitur Lengkap & Terintegrasi
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Platform All-in-One
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Solusi manajemen kesiswaan terpadu dengan fitur konseling, kehadiran, dan komunikasi yang seamless
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-20 flex-wrap animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { id: 'siswa', label: '✨ Portal Siswa', color: 'from-emerald-400 to-teal-600' },
            { id: 'bk', label: '🧑‍💼 Dashboard BK', color: 'from-orange-400 to-red-600' },
            { id: 'kesiswaan', label: '📊 Dashboard Kesiswaan', color: 'from-purple-400 to-pink-600' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'siswa' | 'bk' | 'kesiswaan')}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 transform ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl scale-105`
                  : 'bg-white/60 backdrop-blur-md text-gray-700 hover:bg-white/80 border border-white/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {getFeatures().map((feature, index) => {
            const colors = getColorClass()
            return (
              <div
                key={index}
                className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-8 border-2 border-white/50 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 overflow-hidden"
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activeTab === 'siswa' ? 'from-emerald-50 to-transparent' : activeTab === 'bk' ? 'from-orange-50 to-transparent' : 'from-purple-50 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className={`inline-flex w-14 h-14 rounded-xl ${colors.bg} ${colors.icon} items-center justify-center mb-4 group-hover:scale-125 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{feature.description}</p>
                  
                </div>
              </div>
            )
          })}
        </div>

        {/* Integration Section */}
        <div className="mt-32 pt-20 border-t-2 border-blue-200/50">
          <div className="text-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Zap className="w-4 h-4" />
              Integrasi Data Real-time
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ekosistem Data Terpadu
            </h3>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">Konsistensi data real-time di semua modul dengan sinkronisasi otomatis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            {[
              { icon: "📋", title: "Kehadiran Siswa", items: ["Portal: Input & tracking", "BK: Monitoring behavior", "Kesiswaan: Rekap & laporan"] },
              { icon: "⏰", title: "Keterlambatan", items: ["Portal: Notifikasi real-time", "BK: Tren & pembinaan", "Kesiswaan: SP otomatis"] },
              { icon: "⚠️", title: "Siswa Bermasalah", items: ["Portal: Status monitoring", "BK: Detail & konseling", "Kesiswaan: Tindak lanjut"] },
              { icon: "💬", title: "Layanan Konseling", items: ["Portal: Chat & reservasi", "BK: Dokumentasi case", "Kesiswaan: Referensi"] },
              { icon: "📰", title: "Berita & Pengumuman", items: ["Portal: Interactive content", "Kesiswaan: Publishing", "BK: Educational reference"] }
            ].map((item, index) => (
              <div key={index} className="group bg-gradient-to-br from-white/80 to-blue-50/60 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-default">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{item.title}</h4>
                </div>
                <div className="space-y-2">
                  {item.items.map((itemContent, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 text-sm text-gray-700 group-hover:translate-x-1 transition-transform" style={{ transitionDelay: `${itemIndex * 50}ms` }}>
                      <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 font-bold" />
                      <span>{itemContent}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

export default Features