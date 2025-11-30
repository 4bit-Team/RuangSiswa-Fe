"use client"

import React, { useState, useEffect } from 'react'
import { Users, Video, Calendar, Clock, Check, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import CounselorCardWithModal from './CounselorCardWithModal'

interface Reservasi {
  id: number
  counselorId: number
  counselorName: string
  preferredDate: string
  preferredTime: string
  type: 'chat' | 'tatap-muka'
  topic: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
}

interface Counselor {
  id: number
  fullName: string
  specialty: string
  available: boolean
}

const ReservasiPage: React.FC = () => {
  const { user, token } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'tatap-muka' | 'sesi-chat'>('tatap-muka')
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([])
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [availableCounselorIds, setAvailableCounselorIds] = useState<number[]>([])

  // Form state
  const [selectedCounselorId, setSelectedCounselorId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingCounselors, setLoadingCounselors] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (user && token) {
      fetchMyReservasi()
      fetchCounselors()
    }
  }, [user, token])

  // Filter counselors when date/time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      filterAvailableCounselors()
    } else {
      setAvailableCounselorIds([])
    }
  }, [selectedDate, selectedTime])

  // Re-filter counselors when session type changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      filterAvailableCounselors()
    }
  }, [selectedTab])

  const fetchCounselors = async () => {
    try {
      setLoadingCounselors(true)
      console.log('📥 Fetching BK counselors...')
      const response = await apiRequest('/users', 'GET', undefined, token)
      console.log('✅ All users response:', response)
      
      // Filter untuk role=bk
      const allUsers = Array.isArray(response) ? response : [];
      const bkUsers = allUsers.filter((user: any) => user.role === 'bk');
      
      console.log('🔍 BK users found:', bkUsers)
      
      const bkList = bkUsers.map((bk: any) => ({
        id: bk.id,
        fullName: bk.fullName || bk.name || bk.username || `BK ${bk.id}`,
        specialty: bk.specialty || 'Konseling Umum',
        available: true,
      }))
      
      console.log('📋 Processed BK list:', bkList)
      setCounselors(bkList)
    } catch (error: any) {
      console.error('❌ Error fetching counselors:', error)
      setCounselors([])
    } finally {
      setLoadingCounselors(false)
    }
  }

  const filterAvailableCounselors = async () => {
    if (!selectedDate || !selectedTime || !token) return

    try {
      console.log('🔍 Filtering available counselors for', selectedDate, selectedTime, 'Type:', selectedTab)
      
      // Format date to YYYY-MM-DD
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0]
      // Map tab to session type
      const sessionType = selectedTab === 'tatap-muka' ? 'tatap-muka' : 'chat'
      
      console.log('📅 Formatted date:', formattedDate, '⏰ Time:', selectedTime, '🎯 Session Type:', sessionType)
      
      const response = await apiRequest(
        `/bk-schedule/available/${sessionType}/${formattedDate}/${selectedTime}`,
        'GET',
        undefined,
        token
      )
      
      console.log('✅ Available BKs response:', response)
      
      // Handle different response formats
      let availableIds = []
      if (Array.isArray(response)) {
        availableIds = response
      } else if (response && response.availableBKIds && Array.isArray(response.availableBKIds)) {
        availableIds = response.availableBKIds
      } else if (response && Array.isArray(response)) {
        availableIds = response
      }
      
      console.log('✅ Available BK IDs:', availableIds)
      setAvailableCounselorIds(availableIds)
    } catch (error: any) {
      console.error('❌ Error filtering counselors:', error)
      setAvailableCounselorIds([])
    }
  }

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

  const handleSubmitReservasi = async () => {
    // Validation
    if (!selectedCounselorId) {
      setErrorMessage('Pilih konselor terlebih dahulu')
      return
    }
    if (!selectedDate) {
      setErrorMessage('Pilih tanggal terlebih dahulu')
      return
    }
    if (!selectedTime) {
      setErrorMessage('Pilih waktu terlebih dahulu')
      return
    }
    if (!topic) {
      setErrorMessage('Masukkan topik konseling')
      return
    }

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const payload = {
        studentId: user?.id,
        counselorId: selectedCounselorId,
        preferredDate: new Date(selectedDate).toISOString(),
        preferredTime: selectedTime,
        type: selectedTab === 'tatap-muka' ? 'tatap-muka' : 'chat',
        topic,
        notes,
      }

      console.log('📤 Submitting reservasi:', payload)
      const response = await apiRequest('/reservasi', 'POST', payload, token)
      console.log('✅ Reservasi created:', response)

      setSuccessMessage('Reservasi berhasil dibuat! Menunggu konfirmasi dari konselor.')
      
      // Reset form
      setSelectedCounselorId(null)
      setSelectedDate('')
      setSelectedTime('')
      setTopic('')
      setNotes('')

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

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      approved: 'Diterima',
      rejected: 'Ditolak',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    }
    return labels[status] || status
  }

  const getAvailableTimes = () => {
    return ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
  }

  return (
    <div className="pt-6 px-6 space-y-6">
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
                    {res.type === 'chat' ? <Video className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{res.counselorName}</h5>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${res.type === 'chat' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {res.type === 'chat' ? 'Chat' : 'Tatap Muka'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{res.topic} • {new Date(res.preferredDate).toLocaleDateString('id-ID')} • {res.preferredTime}</p>
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

      {/* Form Buat Reservasi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Buat Reservasi Baru</h3>
        <p className="text-gray-600 mb-6">Buat reservasi untuk chat atau bertemu langsung dengan konselor</p>

        {/* Alert Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Tipe Sesi */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Pilih Tipe Sesi</h4>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedTab('tatap-muka')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedTab === 'tatap-muka' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tatap Muka
            </button>
            <button
              onClick={() => setSelectedTab('sesi-chat')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedTab === 'sesi-chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sesi Chat
            </button>
          </div>
        </div>

        {/* Pilih Konselor */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Pilih Konselor</h4>
          
          {loadingCounselors ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Memuat daftar konselor...</span>
            </div>
          ) : counselors.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">Belum ada konselor yang tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {counselors.map((counselor) => {
                const isAvailable = availableCounselorIds.includes(counselor.id)
                const isSelected = selectedCounselorId === counselor.id
                
                return (
                  <button
                    key={counselor.id}
                    onClick={() => {
                      if (isAvailable || !selectedDate || !selectedTime) {
                        setSelectedCounselorId(counselor.id)
                      }
                    }}
                    disabled={!!(selectedDate && selectedTime && !isAvailable)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    } ${selectedDate && selectedTime && !isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${isAvailable || !selectedDate || !selectedTime ? 'bg-blue-500' : 'bg-gray-400'}`}>
                        {counselor.fullName.charAt(0)}
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{counselor.fullName}</p>
                    <p className="text-xs text-gray-600 mb-2">{counselor.specialty}</p>
                    {selectedDate && selectedTime ? (
                      <span className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {isAvailable ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Pilih tanggal & waktu</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
          
          {selectedDate && selectedTime && availableCounselorIds.length === 0 && counselors.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Info:</strong> Tidak ada konselor yang tersedia pada tanggal dan waktu ini. Silakan pilih tanggal atau waktu lain.
              </p>
            </div>
          )}
        </div>

        {/* Pilih Tanggal */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Pilih Tanggal</h4>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Pilih Waktu */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Pilih Waktu</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {getAvailableTimes().map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2 rounded-lg border-2 transition-all font-medium ${
                  selectedTime === time ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Topik */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-900 mb-2">Topik Konseling</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Topik --</option>
            <option value="akademik">Akademik</option>
            <option value="karir">Karir</option>
            <option value="sosial">Sosial & Pertemanan</option>
            <option value="keluarga">Keluarga</option>
            <option value="emosional">Emosional & Mental</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        {/* Catatan */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-900 mb-2">Catatan Tambahan (Opsional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jelaskan hal yang ingin Anda konsultasikan..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Summary */}
        {(selectedCounselorId || selectedDate || selectedTime || topic) && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Reservasi</h4>
            <div className="space-y-2 text-sm">
              {selectedCounselorId && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Konselor: {counselors.find(c => c.id === selectedCounselorId)?.fullName}</span>
                </div>
              )}
              {selectedDate && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID')}</span>
                </div>
              )}
              {selectedTime && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Waktu: {selectedTime}</span>
                </div>
              )}
              {topic && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Topik: {topic}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmitReservasi}
          disabled={loading || !selectedCounselorId || !selectedDate || !selectedTime || !topic}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Buat Reservasi
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ReservasiPage