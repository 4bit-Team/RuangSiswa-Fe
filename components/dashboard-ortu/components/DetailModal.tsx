'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { recordParentResponse } from '@/lib/api'
import { AlertCircle, Calendar, MapPin, CheckCircle, X } from 'lucide-react'

interface PembinaanOrtu {
  id: number
  student_name: string
  student_class: string
  violation_details: string
  letter_content: string
  scheduled_date: Date | string
  scheduled_time?: string
  location?: string
  status: 'pending' | 'sent' | 'read' | 'responded' | 'closed'
  createdAt: Date | string
}

interface Props {
  pembinaan: PembinaanOrtu
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

const DetailModal = ({ pembinaan, isOpen, onClose, onRefresh }: Props) => {
  const { token } = useAuth()
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const scheduledDate = new Date(pembinaan.scheduled_date)
  const formattedDate = scheduledDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      setMessage({ type: 'error', text: 'Silakan isi respons terlebih dahulu' })
      return
    }

    try {
      setIsSubmitting(true)
      await recordParentResponse(pembinaan.id, { parent_response: responseText }, token)
      setMessage({ type: 'success', text: 'Respons berhasil dikirim' })
      setTimeout(() => {
        setShowResponseForm(false)
        setResponseText('')
        onRefresh()
        onClose()
      }, 1500)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Gagal mengirim respons',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusInfo = {
      pending: {
        text: 'Menunggu Dikirim',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
      },
      sent: {
        text: 'Sudah Dikirim',
        color: 'bg-blue-100 text-blue-800',
        icon: '✉️',
      },
      read: {
        text: 'Sudah Dibaca',
        color: 'bg-cyan-100 text-cyan-800',
        icon: '👁️',
      },
      responded: {
        text: 'Sudah Direspons',
        color: 'bg-purple-100 text-purple-800',
        icon: '💬',
      },
      closed: {
        text: 'Selesai',
        color: 'bg-green-100 text-green-800',
        icon: '✅',
      },
    }
    return statusInfo[status as keyof typeof statusInfo] || statusInfo.pending
  }

  const statusInfo = getStatusInfo(pembinaan.status)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{pembinaan.student_name}</h2>
              <p className="text-sm text-slate-600">Kelas {pembinaan.student_class}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.icon} {statusInfo.text}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Error/Success Messages */}
            {message && (
              <div
                className={`p-3 rounded-lg flex items-start gap-2 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {/* Violation Details Card */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Detail Pelanggaran</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{pembinaan.violation_details}</p>
            </div>

            {/* Surat Pemanggilan Card */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Surat Pemanggilan</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {pembinaan.letter_content}
              </p>
            </div>

            {/* Schedule Information Card */}
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-slate-900 mb-3">Jadwal Pertemuan</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{formattedDate}</p>
                    {pembinaan.scheduled_time && (
                      <p className="text-xs text-slate-600">Pukul {pembinaan.scheduled_time}</p>
                    )}
                  </div>
                </div>

                {pembinaan.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Lokasi Pertemuan</p>
                      <p className="text-xs text-slate-600">{pembinaan.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Response Form Card */}
            {(pembinaan.status === 'sent' || pembinaan.status === 'read' || pembinaan.status === 'responded') && (
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-base font-semibold text-slate-900 mb-1">Respons Orang Tua</h3>
                <p className="text-sm text-slate-600 mb-3">Berikan respons Anda terhadap surat pemanggilan ini</p>

                {!showResponseForm ? (
                  <button
                    onClick={() => setShowResponseForm(true)}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                      pembinaan.status === 'responded'
                        ? 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {pembinaan.status === 'responded' ? 'Edit Respons' : 'Berikan Respons'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Silakan tulis respons Anda di sini..."
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSubmitResponse}
                        disabled={isSubmitting || !responseText.trim()}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Respons'}
                      </button>
                      <button
                        onClick={() => {
                          setShowResponseForm(false)
                          setResponseText('')
                        }}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending Status Alert */}
            {pembinaan.status === 'pending' && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900 text-sm">Surat Belum Dikirim</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Surat pemanggilan ini masih dalam proses persiapan. Anda akan menerima notifikasi saat surat dikirim.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DetailModal
