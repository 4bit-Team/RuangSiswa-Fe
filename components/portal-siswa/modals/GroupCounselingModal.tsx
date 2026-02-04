'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, FileText, X, Loader, Users } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'
import { apiRequest } from '@lib/api'

interface Student {
  id: number
  fullName: string
  username?: string
  kelas?: string
}

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

interface GroupCounselingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: (data: any) => void
}

const GroupCounselingModal: React.FC<GroupCounselingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { user, token } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingCounselors, setLoadingCounselors] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [availableCounselors, setAvailableCounselors] = useState<Counselor[]>([])
  const [counselingCategories, setCounselingCategories] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [selectedTopic, setSelectedTopic] = useState<{ id: number; name: string } | null>(null)
  const [searchStudent, setSearchStudent] = useState('')

  const [formData, setFormData] = useState({
    groupName: '',
    sessionType: '' as 'chat' | 'tatap-muka' | '',
    counselorId: null as number | null,
    date: '',
    time: '',
    notes: '',
    topicId: null as number | null,
  })

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00']

  // Fetch all students when modal opens
  useEffect(() => {
    if (isOpen && token) {
      fetchAllStudents()
      fetchCounselingCategories()
    }
  }, [isOpen, token])

  const fetchAllStudents = async () => {
    setLoadingStudents(true)
    try {
      const response = await apiRequest('/users?role=siswa', 'GET', undefined, token)
      if (Array.isArray(response)) {
        setAllStudents(response.filter((s: any) => s.id !== user?.id))
      } else if (response?.data && Array.isArray(response.data)) {
        setAllStudents(response.data.filter((s: any) => s.id !== user?.id))
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error)
      setAllStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const fetchCounselingCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await apiRequest('/counseling-category', 'GET', undefined, token)
      if (Array.isArray(response)) {
        setCounselingCategories(response)
      } else if (response?.data && Array.isArray(response.data)) {
        setCounselingCategories(response.data)
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      setCounselingCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchAvailableCounselors = async (date: string, time: string, sessionType: string) => {
    if (!date || !time || !sessionType || !token) return

    setLoadingCounselors(true)
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0]
      const type = sessionType === 'tatap-muka' ? 'tatap-muka' : 'chat'

      const response = await apiRequest(
        `/bk-schedule/available/${type}/${formattedDate}/${time}`,
        'GET',
        undefined,
        token
      )

      let counselors: Counselor[] = []
      if (response?.bookingStatus && Array.isArray(response.bookingStatus)) {
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

  const handleSessionTypeSelect = (type: 'chat' | 'tatap-muka') => {
    setFormData({ ...formData, sessionType: type })
  }

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
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
    if (step < 5) {
      setStep((step + 1) as 1 | 2 | 3 | 4 | 5)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4 | 5)
    }
  }

  const handleConfirm = () => {
    const selectedCounselor = availableCounselors.find((c) => c.id === formData.counselorId)

    onConfirm?.({
      ...formData,
      selectedStudentIds: selectedStudents,
      counselorName: selectedCounselor?.fullName || 'Unknown',
    })
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setSelectedStudents([])
    setSelectedTopic(null)
    setFormData({
      groupName: '',
      sessionType: '',
      counselorId: null,
      date: '',
      time: '',
      notes: '',
      topicId: null,
    })
    setSearchStudent('')
    setAvailableCounselors([])
    onClose()
  }

  const filteredStudents = allStudents.filter((student) => {
    if (!student.fullName) return false
    return (
      student.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (student.username && student.username.toLowerCase().includes(searchStudent.toLowerCase()))
    )
  })

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
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {step === 1
                  ? 'Pilih Tipe Sesi'
                  : step === 2
                  ? 'Pilih Siswa'
                  : step === 3
                  ? 'Pilih Topik & Nama Grup'
                  : step === 4
                  ? 'Pilih Jadwal & Konselor'
                  : 'Konfirmasi Reservasi'}
              </h2>
              <p className="text-green-100 text-sm">
                {step === 1
                  ? 'Pilih jenis sesi konseling kelompok'
                  : step === 2
                  ? 'Pilih minimal 2 siswa untuk bergabung dalam grup'
                  : step === 3
                  ? 'Tentukan topik dan beri nama untuk grup konseling'
                  : step === 4
                  ? 'Atur jadwal dan pilih konselor BK'
                  : 'Tinjau detail reservasi grup Anda'}
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
            {/* Progress bar */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div key={stepNum} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      stepNum <= step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                  <p className="text-xs text-gray-600 mt-1 text-center">Step {stepNum}</p>
                </div>
              ))}
            </div>

            <div className="min-h-64">
              {/* Step 1: Session Type */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Pilih Tipe Sesi</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSessionTypeSelect('tatap-muka')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.sessionType === 'tatap-muka'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Tatap Muka</p>
                      <p className="text-sm text-gray-600">Konseling kelompok langsung dengan konselor</p>
                    </button>
                    <button
                      onClick={() => handleSessionTypeSelect('chat')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        formData.sessionType === 'chat'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">Sesi Chat Grup</p>
                      <p className="text-sm text-gray-600">Konseling kelompok melalui chat dengan konselor</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Students */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Pilih Siswa ({selectedStudents.length}/Unlimited)
                  </h3>
                  <p className="text-sm text-gray-600">Pilih minimal 2 siswa untuk membentuk grup konseling</p>

                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-5 h-5 animate-spin text-green-500 mr-2" />
                      <span className="text-gray-600">Memuat daftar siswa...</span>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">Tidak ada siswa ditemukan</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentSelect(student.id)}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                            selectedStudents.includes(student.id)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedStudents.includes(student.id)
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedStudents.includes(student.id) && (
                              <span className="text-white text-sm">✓</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.fullName}</p>
                            <p className="text-xs text-gray-500">
                              {student.username} {student.kelas && `• ${student.kelas}`}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Topic & Group Name */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Pilih Topik Konseling</h3>
                    {loadingCategories ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-5 h-5 animate-spin text-green-500 mr-2" />
                        <span className="text-gray-600">Memuat topik...</span>
                      </div>
                    ) : counselingCategories.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">Tidak ada topik tersedia</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {counselingCategories.map((category: any) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedTopic({ id: category.id, name: category.name })
                              setFormData({ ...formData, topicId: category.id })
                            }}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              selectedTopic?.id === category.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <p className="font-semibold text-gray-900">{category.name}</p>
                            {category.description && (
                              <p className="text-xs text-gray-600">{category.description}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Nama Grup Konseling
                    </label>
                    <input
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                      placeholder="Contoh: Grup Konseling Semester 2"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Schedule & Counselor */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Pilih Tanggal</h3>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                  ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-300'
                                  : 'bg-gray-50 text-gray-700 hover:bg-green-50 border border-gray-200'
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
                          <h3 className="font-semibold text-gray-900 mb-3">Pilih Konselor BK</h3>
                          {loadingCounselors ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader className="w-5 h-5 animate-spin text-green-500 mr-2" />
                              <span className="text-gray-600">Memuat konselor tersedia...</span>
                            </div>
                          ) : availableCounselors.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800">Tidak ada konselor tersedia</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-3">
                              {availableCounselors.map((counselor: any) => (
                                <button
                                  key={counselor.id}
                                  onClick={() =>
                                    !counselor.booked && handleCounselorSelect(counselor.id)
                                  }
                                  disabled={counselor.booked}
                                  className={`p-4 rounded-lg transition-all duration-300 border-2 relative ${
                                    counselor.booked
                                      ? 'bg-gray-300 border-gray-400 opacity-75 cursor-not-allowed'
                                      : formData.counselorId === counselor.id
                                      ? 'bg-green-50 border-green-500 ring-2 ring-green-300'
                                      : 'bg-gray-50 border-gray-200 hover:border-green-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                                        counselor.booked ? 'bg-gray-500' : 'bg-green-500'
                                      }`}
                                    >
                                      <User className="w-4 h-4" />
                                    </div>
                                    <span
                                      className={`font-medium text-sm ${
                                        counselor.booked ? 'text-gray-600' : 'text-gray-900'
                                      }`}
                                    >
                                      {counselor.fullName}
                                    </span>
                                  </div>
                                  {counselor.specialty && (
                                    <p
                                      className={`text-xs ${
                                        counselor.booked ? 'text-gray-500' : 'text-gray-600'
                                      }`}
                                    >
                                      {counselor.specialty}
                                    </p>
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

              {/* Step 5: Confirmation */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Nama Grup</p>
                          <p className="font-semibold text-gray-900">{formData.groupName || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Anggota Grup ({selectedStudents.length + 1})
                          </p>
                          <p className="font-semibold text-gray-900">Anda + {selectedStudents.length} siswa</p>
                          <div className="mt-2 space-y-1">
                            {selectedStudents.map((id) => {
                              const student = allStudents.find((s) => s.id === id)
                              return (
                                <p key={id} className="text-xs text-gray-600">
                                  • {student?.fullName}
                                </p>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {selectedTopic && (
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5 font-semibold">
                            🎯
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Topik</p>
                            <p className="font-semibold text-gray-900">{selectedTopic.name}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 font-semibold">
                          📋
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tipe Sesi</p>
                          <p className="font-semibold text-gray-900">
                            {formData.sessionType === 'tatap-muka' ? 'Tatap Muka' : 'Sesi Chat'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Konselor BK</p>
                          <p className="font-semibold text-gray-900">
                            {availableCounselors.find((c: any) => c.id === formData.counselorId)
                              ?.fullName || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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
                              : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Waktu</p>
                          <p className="font-semibold text-gray-900">{formData.time || '-'}</p>
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
                      placeholder="Sampaikan informasi tambahan untuk konselor..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      rows={3}
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
            onClick={step === 5 ? handleConfirm : handleNext}
            disabled={
              (step === 1 && !formData.sessionType) ||
              (step === 2 && selectedStudents.length < 2) ||
              (step === 3 && (!selectedTopic || !formData.groupName)) ||
              (step === 4 && (!formData.date || !formData.time || !formData.counselorId))
            }
            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {step === 5 ? 'Konfirmasi Reservasi' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupCounselingModal
