'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, FileText, X, Loader } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { apiRequest } from '@lib/api'

  interface Counselor {
    id: number
    fullName: string
    username?: string
    specialty: string
    available: boolean
    booked?: boolean 
  }

interface TimeSlot {
  time: string
  availableCounselors: Counselor[]
  isBooked: boolean
}

interface AppointmentScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  counselingType?: string
  onConfirm?: (data: any) => void
  isRescheduling?: boolean
}

const AppointmentScheduleModal: React.FC<AppointmentScheduleModalProps> = ({
  isOpen,
  onClose,
  counselingType = 'Konseling Pribadi',
  onConfirm,
  isRescheduling = false,
}) => {
  const { user, token } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loadingCounselors, setLoadingCounselors] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [availableCounselors, setAvailableCounselors] = useState<Counselor[]>([])
  const [counselingCategories, setCounselingCategories] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState<{ id: number; name: string } | null>(null)
  const [formData, setFormData] = useState({
    sessionType: '',
    counselorId: null as number | null,
    date: '',
    time: '',
    notes: '',
    topicId: null as number | null,
  })

  // Note Bugar: Hardcoded time slots (8 Pagi Sampai 3 Siang)
  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    // '12:00',
    '13:00',
    '14:00',
    // '15:00',
  ]

  // Fetch counseling categories on modal open
  useEffect(() => {
    if (isOpen && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && token) {
      fetchCounselingCategories()
    }
  }, [isOpen, token, counselingType])

  const fetchCounselingCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await apiRequest(
        '/counseling-category',
        'GET',
        undefined,
        token
      )
      console.log('✅ Counseling categories response:', response)
      
      if (Array.isArray(response)) {
        setCounselingCategories(response)
      } else if (response?.data && Array.isArray(response.data)) {
        setCounselingCategories(response.data)
      }
    } catch (error) {
      console.error('❌ Error fetching counseling categories:', error)
      setCounselingCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setSelectedTopic(null)
      setFormData({ sessionType: '', counselorId: null, date: '', time: '', notes: '', topicId: null })
      setAvailableCounselors([])
    }
  }, [isOpen])

  const fetchAvailableCounselors = async (date: string, time: string, sessionType: string) => {
    if (!date || !time || !sessionType || !token) return

    setLoadingCounselors(true)
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0]
      const type = sessionType === 'tatap-muka' ? 'tatap-muka' : 'chat'

      console.log(`📞 Fetching available counselors for ${formattedDate} at ${time}`)
      const response = await apiRequest(
        `/bk-schedule/available/${type}/${formattedDate}/${time}`,
        'GET',
        undefined,
        token
      )

      console.log('✅ Available counselors response:', response)

      let counselors: Counselor[] = []
      if (response?.bookingStatus && Array.isArray(response.bookingStatus)) {
        // Response format: { bookingStatus: [{ bkId, fullName, username, specialty, available, booked }, ...], ... }
        counselors = response.bookingStatus.map((item: any) => ({
          id: item.bkId,
          fullName: item.fullName || item.username || `Konselor ${item.bkId}`,
          username: item.username,
          specialty: item.specialty || 'Konseling',
          available: item.available,
          booked: item.booked, 
        }))
      }

      setAvailableCounselors(counselors)
    } catch (error: any) {
      console.error('❌ Error fetching counselors:', error)
      setAvailableCounselors([])
    } finally {
      setLoadingCounselors(false)
    }
  }

  const handleSessionTypeSelect = (type: string) => {
    setFormData({ ...formData, sessionType: type })
  }

  const handleDateChange = (value: string) => {
    setFormData({ ...formData, date: value, time: '', counselorId: null })
    setAvailableCounselors([])
  }

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, time, counselorId: null })
    setAvailableCounselors([])
    if (formData.date && formData.sessionType) {
      fetchAvailableCounselors(formData.date, time, formData.sessionType)
    }
  }

  const handleCounselorSelect = (counselorId: number) => {
    setFormData({ ...formData, counselorId })
  }

  const handleNext = () => {
    // Logic untuk konfirmasi di step terakhir
    if ((counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && step === 4) {
      handleConfirm()
      return
    }
    if (!(counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && step === 3) {
      handleConfirm()
      return
    }
    
    // Increment step
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleConfirm = () => {
    const selectedCounselor = availableCounselors.find((c) => c.id === formData.counselorId)
    const topicName = selectedTopic?.name || counselingType

    onConfirm?.({
      ...formData,
      counselorName: selectedCounselor?.fullName || 'Unknown',
      counselingType,
      topic: topicName,
      topicId: formData.topicId, // Ensure topicId is passed to parent
    })
    setStep(1)
    setSelectedTopic(null)
    setFormData({ sessionType: '', counselorId: null, date: '', time: '', notes: '', topicId: null })
    setAvailableCounselors([])
    onClose()
  }

  const handleClose = () => {
    setStep(1)
    setSelectedTopic(null)
    setFormData({ sessionType: '', counselorId: null, date: '', time: '', notes: '', topicId: null })
    setAvailableCounselors([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e: any) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {step === 1
                  ? 'Pilih Tipe Sesi'
                  : step === 2 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum')
                  ? 'Pilih Topik Konseling'
                  : step === 2
                  ? 'Pilih Tanggal, Waktu & Konselor'
                  : step === 3 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum')
                  ? 'Pilih Tanggal, Waktu & Konselor'
                  : step === 3
                  ? 'Konfirmasi Reservasi'
                  : 'Konfirmasi Reservasi'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {step === 1
                  ? 'Pilih jenis sesi konseling'
                  : step === 2 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum')
                  ? 'Pilih topik spesifik yang ingin Anda konsultasikan'
                  : step === 2
                  ? 'Atur jadwal konseling Anda'
                  : step === 3 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum')
                  ? 'Atur jadwal konseling Anda'
                  : 'Tinjau detail reservasi Anda'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${1 <= step ? 'bg-indigo-500' : 'bg-gray-200'}`}
                />
                <p className="text-xs text-gray-600 mt-1 text-center">Step 1</p>
              </div>
              <div className="flex-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${2 <= step ? 'bg-indigo-500' : 'bg-gray-200'}`}
                />
                <p className="text-xs text-gray-600 mt-1 text-center">Step 2</p>
              </div>
              <div className="flex-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${3 <= step ? 'bg-indigo-500' : 'bg-gray-200'}`}
                />
                <p className="text-xs text-gray-600 mt-1 text-center">Step 3</p>
              </div>
              <div className="flex-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${4 <= step ? 'bg-indigo-500' : 'bg-gray-200'}`}
                />
                <p className="text-xs text-gray-600 mt-1 text-center">Step 4</p>
              </div>
            </div>

            <div className="min-h-64">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Pilih Tipe Sesi</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSessionTypeSelect('tatap-muka')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.sessionType === 'tatap-muka'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Tatap Muka</p>
                      <p className="text-sm text-gray-600">Konsultasi langsung dengan konselor</p>
                    </button>
                    <button
                      onClick={() => handleSessionTypeSelect('chat')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.sessionType === 'chat'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Sesi Chat</p>
                      <p className="text-sm text-gray-600">Konsultasi melalui chat dengan konselor</p>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Pilih Topik Konseling</h3>
                  {loadingCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                      <span className="text-gray-600">Memuat topik konseling...</span>
                    </div>
                  ) : counselingCategories.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">Tidak ada topik konseling tersedia</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {counselingCategories.map((category: any) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedTopic({ id: category.id, name: category.name })
                            setFormData({ ...formData, topicId: category.id })
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            selectedTopic?.id === category.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && counselingType !== 'Konseling Lainnya' && counselingType !== 'Konseling Umum' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Pilih Tanggal</h3>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {formData.date && (
                    <>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Pilih Waktu untuk {new Date(formData.date).toLocaleDateString('id-ID')}
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              disabled={!formData.date}
                              className={`p-2 rounded-lg transition-all duration-300 font-medium flex flex-col items-center gap-1 text-sm ${
                                formData.time === time
                                  ? 'bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300'
                                  : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-200'
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.time && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Pilih Konselor</h3>
                          {loadingCounselors ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                              <span className="text-gray-600">Memuat konselor tersedia...</span>
                            </div>
                          ) : availableCounselors.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800">Tidak ada konselor tersedia untuk waktu ini</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-3">
                              {availableCounselors.map((counselor: any) => (
                                <button
                                  key={counselor.id}
                                  onClick={() => !counselor.booked && handleCounselorSelect(counselor.id)}
                                  disabled={counselor.booked}
                                  className={`p-4 rounded-lg transition-all duration-300 border-2 relative ${
                                    counselor.booked
                                      ? 'bg-gray-300 border-gray-400 opacity-75 cursor-not-allowed'
                                      : formData.counselorId === counselor.id
                                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300'
                                      : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                                      counselor.booked ? 'bg-gray-500' : 'bg-indigo-500'
                                    }`}>
                                      <User className="w-4 h-4" />
                                    </div>
                                    <span className={`font-medium text-sm ${
                                      counselor.booked ? 'text-gray-600' : 'text-gray-900'
                                    }`}>
                                      {counselor.fullName}
                                    </span>
                                  </div>
                                  {counselor.specialty && (
                                    <p className={`text-xs ${
                                      counselor.booked ? 'text-gray-500' : 'text-gray-600'
                                    }`}>{counselor.specialty}</p>
                                  )}
                                  {counselor.booked && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                      Penuh
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {step === 3 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Pilih Tanggal</h3>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {formData.date && (
                    <>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Pilih Waktu untuk {new Date(formData.date).toLocaleDateString('id-ID')}
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              disabled={!formData.date}
                              className={`p-2 rounded-lg transition-all duration-300 font-medium flex flex-col items-center gap-1 text-sm ${
                                formData.time === time
                                  ? 'bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300'
                                  : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-200'
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.time && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Pilih Konselor</h3>
                          {loadingCounselors ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                              <span className="text-gray-600">Memuat konselor tersedia...</span>
                            </div>
                          ) : availableCounselors.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800">Tidak ada konselor tersedia untuk waktu ini</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-3">
                              {availableCounselors.map((counselor: any) => (
                                <button
                                  key={counselor.id}
                                  onClick={() => !counselor.booked && handleCounselorSelect(counselor.id)}
                                  disabled={counselor.booked}
                                  className={`p-4 rounded-lg transition-all duration-300 border-2 relative ${
                                    counselor.booked
                                      ? 'bg-gray-300 border-gray-400 opacity-75 cursor-not-allowed'
                                      : formData.counselorId === counselor.id
                                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300'
                                      : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                                      counselor.booked ? 'bg-gray-500' : 'bg-indigo-500'
                                    }`}>
                                      <User className="w-4 h-4" />
                                    </div>
                                    <span className={`font-medium text-sm ${
                                      counselor.booked ? 'text-gray-600' : 'text-gray-900'
                                    }`}>
                                      {counselor.fullName}
                                    </span>
                                  </div>
                                  {counselor.specialty && (
                                    <p className={`text-xs ${
                                      counselor.booked ? 'text-gray-500' : 'text-gray-600'
                                    }`}>{counselor.specialty}</p>
                                  )}
                                  {counselor.booked && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                      Penuh
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {step === 4 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Ringkasan Reservasi</h3>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Jenis Konseling</p>
                          <p className="font-semibold text-gray-900">{counselingType}</p>
                        </div>
                      </div>

                      {selectedTopic && (
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5 font-semibold">🎯</div>
                          <div>
                            <p className="text-sm text-gray-600">Topik</p>
                            <p className="font-semibold text-gray-900">{selectedTopic.name}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5 font-semibold">📋</div>
                        <div>
                          <p className="text-sm text-gray-600">Tipe Sesi</p>
                          <p className="font-semibold text-gray-900">
                            {formData.sessionType === 'tatap-muka' ? 'Tatap Muka' : 'Sesi Chat'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Konselor</p>
                          <p className="font-semibold text-gray-900">
                            {availableCounselors.find((c: any) => c.id === formData.counselorId)?.fullName || 'Belum dipilih'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {availableCounselors.find((c: any) => c.id === formData.counselorId)?.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Tanggal</p>
                          <p className="font-semibold text-gray-900">
                            {formData.date
                              ? new Date(formData.date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Belum dipilih'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Waktu</p>
                          <p className="font-semibold text-gray-900">{formData.time || 'Belum dipilih'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Sampaikan informasi atau pertanyaan tambahan kepada konselor..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {step === 3 && counselingType !== 'Konseling Lainnya' && counselingType !== 'Konseling Umum' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Jenis Konseling</p>
                          <p className="font-semibold text-gray-900">{counselingType}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5 font-semibold">📋</div>
                        <div>
                          <p className="text-sm text-gray-600">Tipe Sesi</p>
                          <p className="font-semibold text-gray-900">
                            {formData.sessionType === 'tatap-muka' ? 'Tatap Muka' : 'Sesi Chat'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Konselor</p>
                          <p className="font-semibold text-gray-900">
                            {availableCounselors.find((c: any) => c.id === formData.counselorId)?.fullName || 'Belum dipilih'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {availableCounselors.find((c: any) => c.id === formData.counselorId)?.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Tanggal</p>
                          <p className="font-semibold text-gray-900">
                            {formData.date
                              ? new Date(formData.date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Belum dipilih'}
                          </p>
                        </div>
                      </div>

                      {counselingType === 'Konseling Lainnya' && selectedTopic && (
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5 font-semibold">🎯</div>
                          <div>
                            <p className="text-sm text-gray-600">Topik</p>
                            <p className="font-semibold text-gray-900">{selectedTopic.name}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5 font-semibold">📋</div>
                        <div>
                          <p className="text-sm text-gray-600">Tipe Sesi</p>
                          <p className="font-semibold text-gray-900">
                            {formData.sessionType === 'tatap-muka' ? 'Tatap Muka' : 'Sesi Chat'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Konselor</p>
                          <p className="font-semibold text-gray-900">
                            {availableCounselors.find((c: any) => c.id === formData.counselorId)?.fullName || 'Belum dipilih'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {availableCounselors.find((c: any) => c.id === formData.counselorId)?.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Tanggal</p>
                          <p className="font-semibold text-gray-900">
                            {formData.date
                              ? new Date(formData.date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Belum dipilih'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Waktu</p>
                          <p className="font-semibold text-gray-900">{formData.time || 'Belum dipilih'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Sampaikan informasi atau pertanyaan tambahan kepada konselor..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 sticky bottom-0">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !formData.sessionType) ||
              (step === 2 && (counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && !selectedTopic) ||
              (step === 2 && !(counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum') && (!formData.date || !formData.time || !formData.counselorId)) ||
              (step === 3 && (!formData.date || !formData.time || !formData.counselorId))
            }
            className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {step === 4 || (step === 3 && !(counselingType === 'Konseling Lainnya' || counselingType === 'Konseling Umum'))
              ? 'Konfirmasi Reservasi'
              : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentScheduleModal