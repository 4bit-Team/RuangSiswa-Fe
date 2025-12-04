'use client'

import React, { useState } from 'react'
import { X, Trophy, Download, Share2, Heart } from 'lucide-react'

interface Achievement {
  id: number
  nis: string
  name: string
  class: string
  major: string
  achievementName: string
  level: 'Nasional' | 'Provinsi' | 'Kabupaten/Kota' | 'Sekolah'
  date: string
  announcementMonth: string
  evidence: string
}

interface AchievementStudentModalProps {
  isOpen: boolean
  onClose: () => void
  achievement: Achievement
}

const AchievementStudentModal: React.FC<AchievementStudentModalProps> = ({
  isOpen,
  onClose,
  achievement,
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  if (!isOpen) return null

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Nasional':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Provinsi':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Kabupaten/Kota':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'Sekolah':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Prestasi Siswa</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Siswa</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">NIS</label>
                <p className="text-sm font-medium text-gray-900">{achievement.nis}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nama</label>
                <p className="text-sm font-medium text-gray-900">{achievement.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kelas</label>
                <p className="text-sm font-medium text-gray-900">{achievement.class}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Jurusan</label>
                <p className="text-sm font-medium text-gray-900">{achievement.major}</p>
              </div>
            </div>
          </div>

          {/* Achievement Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Detail Prestasi</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Judul Prestasi</label>
                <p className="text-sm font-medium text-gray-900">{achievement.achievementName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tingkat</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getLevelColor(achievement.level)}`}>
                    {achievement.level}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tanggal Prestasi</label>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(achievement.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bulan Pengumuman</label>
                <p className="text-sm text-gray-600">{achievement.announcementMonth}</p>
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Dokumen Sertifikat</h3>
            <div className="p-4 border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{achievement.evidence}</p>
                    <p className="text-xs text-gray-500 mt-1">PDF Document • Terverifikasi</p>
                  </div>
                </div>
                <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Admin Verification */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Verifikasi Admin</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Status Verifikasi</label>
                <select className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50">
                  <option>✓ Terverifikasi</option>
                  <option>⏳ Menunggu Verifikasi</option>
                  <option>✗ Ditolak</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Poin yang Diberikan</label>
                <input
                  type="number"
                  defaultValue="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Catatan Verifikasi</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Catatan atau feedback untuk verifikasi prestasi ini..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
            />
          </div>

          {/* Sharing Options */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">Bagikan Prestasi</p>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                Bagikan ke Portal
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                📧 Email Notifikasi
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                🔗 Copy Link
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
              Simpan Verifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementStudentModal
