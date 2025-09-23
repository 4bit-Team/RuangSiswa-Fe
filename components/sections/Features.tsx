import React from 'react'
import { 
  Users, BookOpen, Building2, Award, MessageSquare, CreditCard, 
  Calendar, Trophy, DollarSign, Globe, Brain, TrendingUp, Star 
} from 'lucide-react'
import type { Feature } from '@/types'

const Features = () => {
  const features: Feature[] = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Pemetaan Kompetensi Siswa",
      description: "Evaluasi mendalam terhadap nilai akademik, keterampilan, dan soft skill melalui tes praktikal dan simulasi nyata"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Monitoring Kemajuan",
      description: "Grafik pertumbuhan nilai, skill, keaktifan dengan tampilan perkembangan real-time"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Sistem Rekomendasi AI",
      description: "Rekomendasi sumber belajar berbasis AI yang disesuaikan per jurusan dan kebutuhan siswa"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Matching PKL",
      description: "Pencocokan siswa dengan perusahaan berdasarkan profil skill dan kebutuhan industri"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Sertifikasi Digital",
      description: "Badge kompetensi dan sertifikat digital yang dapat diverifikasi dengan QR code"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Kartu Pelajar Digital",
      description: "Kartu digital dengan QR code untuk presensi, perpustakaan, dan akses lab"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Forum & Feedback",
      description: "Platform diskusi per jurusan dan sistem feedback terkontrol antara siswa dan guru"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Pengingat Otomatis",
      description: "Notifikasi tugas, ujian, dan kegiatan untuk siswa, guru, dan orang tua"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Tracking Ekstrakurikuler",
      description: "Pencatatan dan penilaian aktivitas ekstrakurikuler untuk pengembangan diri terukur"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Manajemen Beasiswa",
      description: "Platform pengajuan beasiswa dan bantuan keuangan dengan proses transparan"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Integrasi E-learning",
      description: "Terintegrasi dengan platform pembelajaran SMK Negeri 1 Cibinong dan sumber eksternal"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Tes Minat & Bakat",
      description: "Tes psikologi online untuk mengukur minat dan potensi bakat siswa SMK"
    }
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            Fitur Unggulan
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Solusi Komprehensif untuk SMK Modern
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            14 modul terintegrasi yang dirancang khusus untuk mendukung ekosistem pendidikan SMK yang holistik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-blue-100 card-hover">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features