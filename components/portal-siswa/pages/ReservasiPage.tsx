"use client"

import React, { useState, useEffect } from 'react'
import { Heart, X, Calendar, AlertCircle, Star, QrCode } from 'lucide-react'
import { apiRequest, submitFeedback, confirmAttendance } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import AppointmentScheduleModal from '../modals/AppointmentScheduleModal'
import { FeedbackModal } from '@/components/FeedbackModal'
import { QRScannerModal } from '@/components/QRScannerModal'
import { getStatusLabel, getStatusBadgeColor, statusBadgeColor, getTypeColor, getStatusColor, formatDate, typeLabel } from '@/lib/reservasi';

interface Reservasi {
  id: number
  counselorId: number
  counselor?: { id: number; username: string; fullName?: string }
  preferredDate: string
  preferredTime: string
  type: 'chat' | 'tatap-muka'
  topic?: { id: number; name: string; description?: string } | null
  topicId?: number | null
  status: 'pending' | 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled'
  qrCode?: string
  attendanceConfirmed?: boolean
  completedAt?: string
  room?: string
}

interface CancelConfirmState {
  show: boolean
  reservasiId: number | null
  reason: string
}

const ReservasiPage: React.FC = () => {
  const { user, token } = useAuth()
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([])
  const [cancelConfirm, setCancelConfirm] = useState<CancelConfirmState>({ show: false, reservasiId: null, reason: '' })
  const [rescheduleModal, setRescheduleModal] = useState<{ show: boolean; reservasiId: number | null }>({ show: false, reservasiId: null })
  const [feedbackModal, setFeedbackModal] = useState<{ show: boolean; reservasiId: number | null; counselorName: string }>({ show: false, reservasiId: null, counselorName: '' })
  const [loading, setLoading] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [qrScannerOpen, setQrScannerOpen] = useState(false)
  const [scanningForReservasi, setScanningForReservasi] = useState<number | null>(null)

  useEffect(() => {
    if (user && token) {
      fetchMyReservasi()
    }
  }, [user, token])

  const fetchMyReservasi = async () => {
    try {
      console.log('📥 Fetching user reservasi...')
      const response = await apiRequest('/reservasi/student/my-reservations', 'GET', undefined, token)
      console.log('✅ Reservasi loaded:', response)
      // Ensure response is array and all items have valid structure
      const validReservasi = Array.isArray(response) ? response.map(r => ({
        ...r,
        topic: r.topic && typeof r.topic === 'object' ? r.topic : null
      })) : []
      setReservasiList(validReservasi)
    } catch (error: any) {
      console.error('❌ Error fetching reservasi:', error)
      setErrorMessage('Gagal mengambil data reservasi')
      setReservasiList([])
    }
  }

  const handleCancelReservasi = async () => {
    if (!cancelConfirm.reservasiId || !token) return

    setLoading(true)
    try {
      await apiRequest(
        `/reservasi/${cancelConfirm.reservasiId}/cancel`,
        'PATCH',
        { reason: cancelConfirm.reason || 'Dibatalkan oleh siswa' },
        token
      )
      setSuccessMessage('Reservasi berhasil dibatalkan')
      setCancelConfirm({ show: false, reservasiId: null, reason: '' })
      fetchMyReservasi()
    } catch (error: any) {
      setErrorMessage(error.message || 'Gagal membatalkan reservasi')
    } finally {
      setLoading(false)
    }
  }

  const handleRescheduleSubmit = async (formData: any) => {
    if (!rescheduleModal.reservasiId || !token) return

    setLoading(true)
    try {
      const rescheduleData: any = {
        preferredDate: formData.date ? new Date(formData.date).toISOString() : undefined,
        preferredTime: formData.time,
        counselorId: formData.counselorId,
      }

      // Remove undefined fields
      Object.keys(rescheduleData).forEach((key: string) => {
        if (rescheduleData[key] === undefined) delete rescheduleData[key]
      })

      await apiRequest(
        `/reservasi/${rescheduleModal.reservasiId}/reschedule`,
        'PATCH',
        rescheduleData,
        token
      )
      setSuccessMessage('Reservasi berhasil dijadwalkan ulang')
      setRescheduleModal({ show: false, reservasiId: null })
      fetchMyReservasi()
    } catch (error: any) {
      setErrorMessage(error.message || 'Gagal menjadwalkan ulang reservasi')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!feedbackModal.reservasiId || !token) return

    setFeedbackLoading(true)
    try {
      await submitFeedback(feedbackModal.reservasiId, rating, comment, token)
      setSuccessMessage('Terima kasih! Penilaian Anda telah dikirim')
      setFeedbackModal({ show: false, reservasiId: null, counselorName: '' })
      fetchMyReservasi()
    } catch (error: any) {
      setErrorMessage(error.message || 'Gagal mengirim penilaian')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const canCancelOrReschedule = (status: string) => {
    return ['pending', 'approved'].includes(status)
  }

  // Helper function to calculate when QR/Chat will be generated (15 minutes before session)
  const getSessionInitializationTime = (preferredDate: string, preferredTime: string) => {
    const [hours, minutes] = preferredTime.split(':').map(Number)
    const sessionDate = new Date(preferredDate)
    sessionDate.setHours(hours, minutes, 0)
    
    // 15 minutes before
    const initTime = new Date(sessionDate.getTime() - 15 * 60 * 1000)
    
    return {
      date: initTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: `${String(initTime.getHours()).padStart(2, '0')}:${String(initTime.getMinutes()).padStart(2, '0')}`,
      fullDate: initTime
    }
  }

  const handleScanQR = (id: number) => {
    setScanningForReservasi(id)
    setQrScannerOpen(true)
  }

  const handleQRScanned = async (qrData: string) => {
    if (!scanningForReservasi || !token) return

    try {
      setLoading(true)
      console.log('✅ QR Scanned, confirming attendance...')
      await confirmAttendance(scanningForReservasi, qrData, token)
      await fetchMyReservasi()
      setSuccessMessage('Absensi berhasil dikonfirmasi!')
      setQrScannerOpen(false)
      setScanningForReservasi(null)
    } catch (error: any) {
      console.error('❌ Error confirming attendance:', error)
      setErrorMessage('Error: ' + (error?.message || 'Gagal mengkonfirmasi absensi'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">
            ❌ <strong>Error:</strong> {errorMessage}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700">
            ✅ <strong>Berhasil:</strong> {successMessage}
          </p>
        </div>
      )}

      {/* Reservasi Saya */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Reservasi Saya
          </h3>
          <p className="text-gray-600 mt-1">Daftar reservasi konseling Anda</p>
        </div>

        <div className="p-6">

        {reservasiList.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">Belum ada reservasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.isArray(reservasiList) && reservasiList.length > 0 && reservasiList.map((res: Reservasi) => {
              // Defensive checks to prevent rendering errors
              if (!res || !res.id) return null
              
              return (
              <div key={res.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{res.topic?.name || 'Konseling'}</h5>
                      <p className="text-sm text-gray-600">
                        {(typeLabel[res.type as keyof typeof typeLabel] || res.type)} • {res.counselor?.username || res.counselor?.fullName || 'Konselor'} • {formatDate(res.preferredDate)} • {res.preferredTime}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm sm:text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeColor(res.status)}`}>
                    {getStatusLabel(res.status)}
                  </span>
                </div>

                {/* Action Buttons - Only for pending/approved */}
                {canCancelOrReschedule(res.status) && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setRescheduleModal({ show: true, reservasiId: res.id })}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      <Calendar className="w-4 h-4" />
                      Jadwal Ulang
                    </button>
                    <button
                      onClick={() => setCancelConfirm({ show: true, reservasiId: res.id, reason: '' })}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                      Batalkan
                    </button>
                  </div>
                )}

                {/* QR Code Actions untuk approved sessions */}
                {res.status === 'approved' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    {/* QR Code Display */}
                    {res.qrCode ? (
                      <>
                        {!res.attendanceConfirmed && (
                          <button
                            onClick={() => handleScanQR(res.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                            disabled={loading}
                          >
                            <QrCode className="w-4 h-4" />
                            Scan QR
                          </button>
                        )}

                        {res.attendanceConfirmed && !res.completedAt && (
                          <div className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            ⏳ Sesi Berlangsung
                          </div>
                        )}

                        {res.completedAt && (
                          <div className="flex-1 flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                            ✅ Sesi Selesai
                          </div>
                        )}
                      </>
                    ) : (
                      (() => {
                        const initTime = getSessionInitializationTime(res.preferredDate, res.preferredTime)
                        const sessionType = res.type === 'chat' ? 'Chat' : 'QR'
                        return (
                          <div className="flex-1 flex flex-col items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                            <div className="text-center">
                              <p>{sessionType} Akan Generate pada</p>
                              <p className="font-semibold mt-1">{initTime.date}</p>
                              <p className="text-gray-600">Pukul {initTime.time}</p>
                              <p className="text-xs mt-1">Harap kembali lagi</p>
                            </div>
                          </div>
                        )
                      })()
                    )}
                  </div>
                )}

                {/* Feedback Button - Only for completed status */}
                {res.status === 'completed' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setFeedbackModal({ show: true, reservasiId: res.id, counselorName: res.counselor?.username || res.counselor?.fullName || 'Konselor' })}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                      disabled={feedbackLoading}
                    >
                      <Star className="w-4 h-4" />
                      Berikan Penilaian
                    </button>
                  </div>
                )}
              </div>
            )
            })}
          </div>
        )}        </div>      </div>

      {/* Cancel Confirmation Modal */}
      {cancelConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="font-bold text-gray-900 mb-4">Batalkan Reservasi?</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alasan (opsional)</label>
              <textarea
                value={cancelConfirm.reason}
                onChange={(e) => setCancelConfirm({ ...cancelConfirm, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Jelaskan alasan pembatalan..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm({ show: false, reservasiId: null, reason: '' })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={loading}
              >
                Tidak
              </button>
              <button
                onClick={handleCancelReservasi}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Membatalkan...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.show && rescheduleModal.reservasiId && (
        <AppointmentScheduleModal
          isOpen={rescheduleModal.show}
          onClose={() => setRescheduleModal({ show: false, reservasiId: null })}
          onConfirm={handleRescheduleSubmit}
          isRescheduling={true}
        />
      )}

      {/* Feedback Modal */}
      {feedbackModal.show && feedbackModal.reservasiId && (
        <FeedbackModal
          isOpen={feedbackModal.show}
          onClose={() => setFeedbackModal({ show: false, reservasiId: null, counselorName: '' })}
          onSubmit={handleFeedbackSubmit}
          isLoading={feedbackLoading}
          counselorName={feedbackModal.counselorName}
        />
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => {
          setQrScannerOpen(false)
          setScanningForReservasi(null)
        }}
        onSuccess={handleQRScanned}
        onError={(error) => {
          console.error('QR Scanner Error:', error)
          setErrorMessage('Error scanning QR: ' + error)
        }}
      />
    </div>
  )
}

export default ReservasiPage