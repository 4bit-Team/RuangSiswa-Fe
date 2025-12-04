'use client'

import React, { useState } from 'react'
import { Trophy, Download, Share2, Award, Heart, MessageCircle } from 'lucide-react'
import BaseModal from './BaseModal'

interface AchievementDetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  category: string
  date: string
  level: 'Tingkat Nasional' | 'Tingkat Provinsi' | 'Tingkat Kota' | 'Tingkat Sekolah'
  description: string
  certificate?: boolean
}

const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  date,
  level,
  description,
  certificate,
}) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [likes, setLikes] = useState(42)
  const [isLiked, setIsLiked] = useState(false)

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const levelConfig: Record<string, { bg: string; text: string; color: string }> = {
    'Tingkat Nasional': { bg: 'bg-yellow-50', text: 'text-yellow-700', color: 'from-yellow-400 to-yellow-600' },
    'Tingkat Provinsi': { bg: 'bg-purple-50', text: 'text-purple-700', color: 'from-purple-400 to-purple-600' },
    'Tingkat Kota': { bg: 'bg-blue-50', text: 'text-blue-700', color: 'from-blue-400 to-blue-600' },
    'Tingkat Sekolah': { bg: 'bg-green-50', text: 'text-green-700', color: 'from-green-400 to-green-600' },
  }

  const config = levelConfig[level] || levelConfig['Tingkat Sekolah']

  const categoryColors: Record<string, string> = {
    'Akademik': 'bg-blue-100 text-blue-700',
    'Olahraga': 'bg-green-100 text-green-700',
    'Seni': 'bg-pink-100 text-pink-700',
    'Teknologi': 'bg-orange-100 text-orange-700',
    'Kepemimpinan': 'bg-purple-100 text-purple-700',
  }

  const handleDownloadCertificate = async () => {
    setIsDownloading(true)
    // Simulate download
    setTimeout(() => {
      console.log('Downloading certificate...')
      alert('Sertifikat berhasil diunduh!')
      setIsDownloading(false)
    }, 1500)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`Prestasi ${level}`}
      width="max-w-3xl"
      headerGradient={`bg-gradient-to-r ${config.color}`}
      icon={<Trophy className="w-6 h-6" />}
    >
      <div className="p-6 space-y-6">
        {/* Level and Category Badge */}
        <div className={`${config.bg} rounded-xl p-6 border-2 border-gray-200`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                  {level}
                </span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${categoryColors[category]}`}>
                  {category}
                </span>
              </div>
              <p className="text-xs text-gray-600">📅 {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-bold text-gray-900 mb-3">Deskripsi Prestasi</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>

        {/* Certificate Section */}
        {certificate && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">📜 Sertifikat Tersedia</p>
                  <p className="text-sm text-blue-800">Anda memiliki sertifikat resmi dari prestasi ini. Unduh untuk menyimpan sebagai arsip pribadi.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Mengunduh...' : 'Unduh Sertifikat Digital'}
            </button>
          </div>
        )}

        {/* Share and Engagement Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-bold text-gray-900 mb-4">Bagikan Prestasi Anda</h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isLiked
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likes} Suka
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-3">
            💡 Bagikan prestasi Anda kepada teman dan keluarga untuk menginspirasi mereka!
          </p>
        </div>

        {/* Related Achievements - Suggestion */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-purple-900 mb-3">🎯 Langkah Selanjutnya</h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>✓ Pertahankan prestasi yang sudah dicapai</li>
            <li>✓ Cari tantangan baru untuk meningkatkan kompetensi</li>
            <li>✓ Bantu teman Anda meraih prestasi serupa</li>
            <li>✓ Diskusikan pengalaman dengan konselor Anda</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all">
            <MessageCircle className="w-4 h-4" />
            Chat Konselor
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export default AchievementDetailModal
