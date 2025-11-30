'use client'

import React, { useState } from 'react'
import { Trophy, Award, Star, Target, Medal, Download } from 'lucide-react'

interface Achievement {
  id: number
  title: string
  category: string
  date: string
  level: 'Tingkat Nasional' | 'Tingkat Provinsi' | 'Tingkat Kota' | 'Tingkat Sekolah'
  description: string
  certificate?: boolean
}

interface AchievementStats {
  totalAchievements: number
  nationalLevel: number
  provinceLevel: number
  cityLevel: number
  schoolLevel: number
}

const LevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const levelConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'Tingkat Nasional': { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <Star className="w-4 h-4" /> },
    'Tingkat Provinsi': { bg: 'bg-purple-50', text: 'text-purple-700', icon: <Trophy className="w-4 h-4" /> },
    'Tingkat Kota': { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Award className="w-4 h-4" /> },
    'Tingkat Sekolah': { bg: 'bg-green-50', text: 'text-green-700', icon: <Medal className="w-4 h-4" /> },
  }

  const config = levelConfig[level] || levelConfig['Tingkat Sekolah']

  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {level}
    </span>
  )
}

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const categoryConfig: Record<string, string> = {
    'Akademik': 'bg-blue-100 text-blue-700',
    'Olahraga': 'bg-green-100 text-green-700',
    'Seni': 'bg-pink-100 text-pink-700',
    'Teknologi': 'bg-orange-100 text-orange-700',
    'Kepemimpinan': 'bg-purple-100 text-purple-700',
  }

  const colorClass = categoryConfig[category] || 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
      {category}
    </span>
  )
}

const AchievementCard: React.FC<Achievement> = ({ title, category, date, level, description, certificate }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={category} />
          <LevelBadge level={level} />
        </div>
      </div>
      {certificate && (
        <button className="ml-2 p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors" title="Download Sertifikat">
          <Download className="w-5 h-5" />
        </button>
      )}
    </div>

    <p className="text-sm text-gray-600 mb-4">{description}</p>

    <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
      <span>📅</span>
      <span>{new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
  </div>
)

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({
  icon,
  label,
  value,
  color,
}) => (
  <div className={`${color} rounded-xl p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-white/40">{icon}</div>
    </div>
  </div>
)

const PrestasiPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Sample data
  const stats: AchievementStats = {
    totalAchievements: 8,
    nationalLevel: 1,
    provinceLevel: 2,
    cityLevel: 3,
    schoolLevel: 2,
  }

  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'Juara 1 Kompetisi Robotik Nasional',
      category: 'Teknologi',
      date: '2025-02-03',
      level: 'Tingkat Nasional',
      description:
        'Memenangkan kompetisi robotik nasional bersama tim. Berhasil merancang dan memprogram robot yang dapat menyelesaikan semua challenge yang diberikan.',
      certificate: true,
    },
    {
      id: 2,
      title: 'Finalis Olimpiade Sains Nasional',
      category: 'Akademik',
      date: '2025-01-15',
      level: 'Tingkat Nasional',
      description: 'Lolos menjadi finalis dalam Olimpiade Sains Nasional untuk kategori Biologi dengan score 92.',
      certificate: true,
    },
    {
      id: 3,
      title: 'Juara 2 Lomba Debat Bahasa Inggris Provinsi',
      category: 'Akademik',
      date: '2024-12-20',
      level: 'Tingkat Provinsi',
      description: 'Menjadi juara 2 dalam lomba debat bahasa Inggris tingkat provinsi bersama 3 rekan sekolah.',
      certificate: true,
    },
    {
      id: 4,
      title: 'Peserta Aktif Kompetisi Matematika Provinsi',
      category: 'Akademik',
      date: '2024-11-10',
      level: 'Tingkat Provinsi',
      description: 'Berpartisipasi dalam kompetisi matematika tingkat provinsi dengan ratusan peserta dari seluruh Jawa Barat.',
      certificate: true,
    },
    {
      id: 5,
      title: 'Juara 3 Lomba Cerdas Cermat Kota',
      category: 'Akademik',
      date: '2024-10-15',
      level: 'Tingkat Kota',
      description: 'Memenangkan juara 3 dalam kompetisi cerdas cermat tingkat kota Bogor dengan tim dari SMKN 1 Cibinong.',
      certificate: true,
    },
    {
      id: 6,
      title: 'Pemenang Lomba Esai Lingkungan Kota',
      category: 'Akademik',
      date: '2024-09-20',
      level: 'Tingkat Kota',
      description: 'Karya esai tentang "Konservasi Lingkungan di Era Digital" dipilih sebagai pemenang pada lomba esai tingkat kota.',
      certificate: false,
    },
    {
      id: 7,
      title: 'Juara 1 Festival Seni Sekolah',
      category: 'Seni',
      date: '2024-08-25',
      level: 'Tingkat Sekolah',
      description: 'Memenangkan juara 1 pada festival seni sekolah dalam kategori fotografi dengan karya "Keindahan Alam Bogor".',
      certificate: false,
    },
    {
      id: 8,
      title: 'Atlet Berprestasi Olahraga Sekolah',
      category: 'Olahraga',
      date: '2024-07-10',
      level: 'Tingkat Sekolah',
      description: 'Dipilih sebagai atlet berprestasi sekolah dalam cabang olahraga voli dan mewakili sekolah di berbagai kompetisi.',
      certificate: false,
    },
  ]

  const filteredAchievements = selectedCategory ? achievements.filter((a) => a.category === selectedCategory) : achievements

  const categories = ['Akademik', 'Teknologi', 'Olahraga', 'Seni', 'Kepemimpinan']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Prestasi Anda</h2>
            <p className="text-orange-50">Kumpulan penghargaan dan prestasi yang telah Anda raih</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Trophy className="w-12 h-12" />}
          label="Total Prestasi"
          value={stats.totalAchievements}
          color="bg-gradient-to-br from-yellow-400 to-yellow-600"
        />
        <StatCard
          icon={<Star className="w-12 h-12" />}
          label="Nasional"
          value={stats.nationalLevel}
          color="bg-gradient-to-br from-orange-400 to-orange-600"
        />
        <StatCard
          icon={<Award className="w-12 h-12" />}
          label="Provinsi"
          value={stats.provinceLevel}
          color="bg-gradient-to-br from-purple-400 to-purple-600"
        />
        <StatCard
          icon={<Medal className="w-12 h-12" />}
          label="Kota"
          value={stats.cityLevel}
          color="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          icon={<Target className="w-12 h-12" />}
          label="Sekolah"
          value={stats.schoolLevel}
          color="bg-gradient-to-br from-green-400 to-green-600"
        />
      </div>

      {/* Filter by Category */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Filter berdasarkan Kategori</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === null ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg">
          {selectedCategory ? `Prestasi ${selectedCategory}` : 'Semua Prestasi'} ({filteredAchievements.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} {...achievement} />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada prestasi di kategori ini</p>
          </div>
        )}
      </div>

      {/* Certificates Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">📜 Sertifikat Tersedia</h4>
        <p className="text-sm text-blue-800 mb-4">
          Anda memiliki 5 sertifikat dari prestasi yang telah dicapai. Anda dapat mengunduh sertifikat digital melalui tombol download di setiap
          kartu prestasi.
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          Unduh Semua Sertifikat
        </button>
      </div>

      {/* Motivation Box */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-semibold text-green-900 mb-3">🌟 Terus Raih Prestasi Lebih Baik</h4>
        <p className="text-sm text-green-800 mb-3">
          Prestasi yang Anda raih menunjukkan komitmen dan kerja keras Anda. Jangan berhenti di sini! Teruslah berusaha dan tingkatkan
          pencapaian Anda ke level yang lebih tinggi.
        </p>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ Target semester depan: raih prestasi tingkat nasional lainnya</li>
          <li>✓ Tingkatkan partisipasi dalam kompetisi akademik dan non-akademik</li>
          <li>✓ Manfaatkan waktu untuk mengembangkan bakat dan minat Anda</li>
        </ul>
      </div>
    </div>
  )
}

export default PrestasiPage
