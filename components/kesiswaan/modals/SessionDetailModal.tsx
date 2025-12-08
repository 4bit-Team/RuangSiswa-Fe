'use client'

import React, { useState } from 'react'
import { BookOpen, Download, MessageCircle, Calendar, FileText } from 'lucide-react'
import BaseModal from './BaseModal'

interface SessionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  sessionNumber: string
  counselor: string
  date: string
  title: string
  topic: string
  notes: string
  status: 'Selesai' | 'Terjadwal' | 'Dalam Proses'
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  isOpen,
  onClose,
  sessionNumber,
  counselor,
  date,
  title,
  topic,
  notes,
  status,
}) => {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statusConfig = {
    'Selesai': { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
    'Terjadwal': { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
    'Dalam Proses': { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100' },
  }

  const config = statusConfig[status] || statusConfig['Selesai']

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      console.log({ feedback })
      alert('Feedback telah terkirim. Terima kasih atas masukan Anda!')
      setFeedback('')
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionNumber}
      subtitle={title}
      width="max-w-3xl"
      headerGradient="bg-gradient-to-r from-purple-500 to-pink-500"
      icon={<BookOpen className="w-6 h-6" />}
    >
      <div className="p-6 space-y-6">
        {/* Status and Basic Info */}
        <div className={`${config.bg} rounded-xl p-6 border-2 border-gray-200`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.badge}`}>
                {status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Konselor</p>
              <p className="text-sm font-semibold text-gray-900">{counselor}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Tanggal</p>
              <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Topic */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Topik Utama</p>
          <p className="text-sm font-semibold text-gray-900">{topic}</p>
        </div>

        {/* Detailed Notes */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Catatan Sesi Lengkap
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{notes}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {status === 'Selesai' && (
            <>
              <button className="flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Download Catatan
              </button>
              <button className="flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:shadow-lg transition-all">
                <MessageCircle className="w-4 h-4" />
                Chat Konselor
              </button>
            </>
          )}

          {status === 'Terjadwal' && (
            <>
              <button className="flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg transition-all">
                <Calendar className="w-4 h-4" />
                Lihat Jadwal
              </button>
              <button className="flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-lg transition-all">
                <MessageCircle className="w-4 h-4" />
                Tanya Konselor
              </button>
            </>
          )}
        </div>

        {/* Feedback Section - Only for Selesai sessions */}
        {status === 'Selesai' && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-4">📝 Berikan Feedback</h3>
            <p className="text-sm text-gray-600 mb-4">
              Feedback Anda membantu kami meningkatkan kualitas layanan bimbingan. Terima kasih!
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Masukan Anda</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Bagaimana pengalaman Anda dengan sesi ini? Apa yang dapat ditingkatkan?"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Lewati
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            💡 Jika Anda memiliki pertanyaan atau membutuhkan bantuan lebih lanjut, jangan ragu untuk menghubungi konselor melalui chat.
          </p>
        </div>
      </div>
    </BaseModal>
  )
}

export default SessionDetailModal
