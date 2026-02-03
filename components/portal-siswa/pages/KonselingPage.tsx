"use client"

import React, { useState, useEffect } from 'react'
import { Heart, MessageSquare, Shield, Clock, Calendar, Users, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { CounselingCardProps } from '@types'
import AppointmentScheduleModal from '../modals/AppointmentScheduleModal'
import { useAuth } from '@hooks/useAuth'
import { apiRequest } from '@lib/api'
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
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
}

const CounselingCard: React.FC<CounselingCardProps & { onBooking?: (type: string) => void; handleSubmitReservasi: (data: any) => void }> = ({
  icon: Icon,
  title,
  description,
  duration,
  color,
  badge,
  onBooking,
  handleSubmitReservasi,
}) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <span className="absolute top-0 right-0 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">{badge}</span>
          )}
        </div>
        <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 hover:shadow-lg"
        >
          Buat Janji
        </button>
      </div>

      <AppointmentScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        counselingType={title}
        onConfirm={(data) => {
          console.log('Booking confirmed:', data)
          handleSubmitReservasi(data)
          setModalOpen(false)
        }}
      />
    </>
  )
}

const KonselingPage: React.FC = () => {
  const { user, token } = useAuth()
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([])
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)

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
      setReservasiList(response || [])
    } catch (error: any) {
      console.error('❌ Error fetching reservasi:', error)
    }
  }

  const handleSubmitReservasi = async (formData: any) => {
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const payload = {
        studentId: user?.id,
        counselorId: formData.counselorId,
        preferredDate: new Date(formData.date).toISOString(),
        preferredTime: formData.time,
        type: formData.sessionType === 'tatap-muka' ? 'tatap-muka' : 'chat',
        topicId: formData.topicId, // Send topicId for Konseling Lainnya, null for others
        notes: formData.notes,
      }

      console.log('📤 Submitting reservasi:', payload)
      const response = await apiRequest('/reservasi', 'POST', payload, token)
      console.log('✅ Reservasi created:', response)

      setSuccessMessage('Reservasi berhasil dibuat! Menunggu konfirmasi dari konselor.')

      // Refresh list
      await fetchMyReservasi()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('❌ Error creating reservasi:', error)
      setErrorMessage(error?.message || 'Gagal membuat reservasi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 px-8 space-y-6">
      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Layanan Konseling</h3>
        <p className="text-gray-600 mb-6">Pilih jenis konseling yang sesuai dengan kebutuhan Anda</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CounselingCard
            icon={Heart}
            title="Konseling Umum"
            description="Sesi one-on-one dengan konselor untuk membahas berbagai topik konseling, emosional, sosial, atau masalah khusus lainnya"
            duration="45-60 menit"
            color="bg-pink-500"
            handleSubmitReservasi={handleSubmitReservasi}
          />
          {/* <CounselingCard
            icon={MessageCircle}
            title="Konseling Akademik"
            description="Bantuan untuk mengatasi kesulitan belajar, motivasi akademik, dan perencanaan studi"
            duration="30-45 menit"
            color="bg-blue-500"
            handleSubmitReservasi={handleSubmitReservasi}
          />
          <CounselingCard
            icon={Calendar}
            title="Konseling Karir"
            description="Bimbingan untuk eksplorasi minat, bakat, dan perencanaan karir masa depan"
            duration="60 menit"
            color="bg-purple-500"
            handleSubmitReservasi={handleSubmitReservasi}
          /> */}
          <CounselingCard
            icon={Users}
            title="Konseling Kelompok"
            description="Sesi bersama siswa lain untuk membahas topik tertentu dan saling mendukung"
            duration="90 menit"
            color="bg-green-500"
            badge="Terbatas"
            handleSubmitReservasi={handleSubmitReservasi}
          />
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 mb-1">Kerahasiaan Terjamin</p>
              <p className="text-sm text-green-700">
                Semua informasi dan percakapan Anda dengan konselor BK bersifat rahasia dan dilindungi sesuai dengan kebijakan privasi sekolah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reservasi Saya */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Reservasi Saya</h3>
        <p className="text-gray-600 mb-6">Daftar reservasi konseling Anda</p>

        {reservasiList.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">Belum ada reservasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservasiList.map((res) => (
              <div key={res.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{res.topic?.name || 'Konseling'}</h5>
                    <p className="text-sm text-gray-600">{typeLabel[res.type]} • {res.counselor?.username || res.counselor?.fullName || 'Konselor'} • {formatDate(res.preferredDate)} • {res.preferredTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeColor(res.status)}`}>
                    {getStatusLabel(res.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default KonselingPage
