import React from 'react'
import { 
  BarChart3, User, MessageCircle, Calendar, FileText, TrendingUp, Users, Settings,
  Clock, AlertCircle, Trophy, Zap, CheckCircle, Shield
} from 'lucide-react'
import type { Feature } from '@/types'

const Features = () => {
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
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Informasi Prestasi",
      description: "Lihat daftar pengumuman prestasi mingguan siswa"
    }
  ]

  // Dashboard BK
  const bkFeatures: Feature[] = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard BK",
      description: "Statistik konseling, kehadiran, keterlambatan, prestasi, dan catatan siswa"
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
      description: "Statistik kehadiran, keterlambatan, prestasi, dan catatan siswa bermasalah"
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
      icon: <Trophy className="w-6 h-6" />,
      title: "Manajemen Prestasi",
      description: "Input prestasi mingguan, kategori akademik/non-akademik dengan publikasi otomatis"
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

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Portal Siswa */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Portal Siswa
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ✨ Modul Portal Siswa
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Akses mudah ke layanan BK dan informasi kesiswaan dengan 7 fitur utama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {siswaFeatures.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard BK */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Dashboard BK
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🧑‍💼 Dashboard Guru Bimbingan Konseling
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Manajemen layanan BK, kasus siswa, dan dokumentasi konseling dengan 6 fitur utama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bkFeatures.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Kesiswaan */}
        <div>
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Dashboard Kesiswaan
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📊 Dashboard Bidang Kesiswaan
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pengelolaan data kesiswaan, monitoring siswa, dan pelaporan dengan 8 fitur utama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {kesiswaanFeatures.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Keterhubungan Data */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🔗 Keterhubungan Data Antar Modul</h3>
            <p className="text-gray-600">Integrasi seamless untuk pengalaman pengguna yang holistik</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">📋 Kehadiran Mingguan</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Portal Siswa: Input dan lihat status</li>
                <li>✅ Dashboard BK: Monitoring dan analitik</li>
                <li>✅ Dashboard Kesiswaan: Rekap per kelas</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <h4 className="font-semibold text-gray-900 mb-3">⏰ Keterlambatan</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Portal Siswa: Info keterlambatan</li>
                <li>✅ Dashboard BK: Monitoring</li>
                <li>✅ Dashboard Kesiswaan: Input & SP otomatis</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <h4 className="font-semibold text-gray-900 mb-3">⚠️ Siswa Bermasalah</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Portal Siswa: Status monitoring</li>
                <li>✅ Dashboard BK: Detail kasus & konseling</li>
                <li>✅ Dashboard Kesiswaan: Monitoring & tindak lanjut</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-3">🏆 Prestasi Siswa</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Portal Siswa: Lihat pengumuman</li>
                <li>✅ Dashboard BK: Motivasi & pembinaan</li>
                <li>✅ Dashboard Kesiswaan: Input & publikasi</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3">💬 Konseling</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Portal Siswa: Reservasi & chat</li>
                <li>✅ Dashboard BK: Kelola & dokumentasi</li>
                <li>⏸️ Dashboard Kesiswaan: -</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
              <h4 className="font-semibold text-gray-900 mb-3">📰 Berita & Pengumuman</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Portal Siswa: Lihat & interaksi</li>
                <li>✅ Dashboard Kesiswaan: Publikasi konten</li>
                <li>✅ Dashboard BK: Referensi pembinaan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features