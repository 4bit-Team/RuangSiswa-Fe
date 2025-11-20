'use client'

import React, { useState } from 'react'
import { Calendar, Clock, User, FileText, X } from 'lucide-react'

interface AppointmentScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  counselingType?: string
  counselorName?: string
  onConfirm?: (data: any) => void
}

const AppointmentScheduleModal: React.FC<AppointmentScheduleModalProps> = ({
  isOpen,
  onClose,
  counselingType = 'Konseling Pribadi',
  counselorName = 'Bu Sarah Wijaya',
  onConfirm,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: '',
  })

  const availableTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
  const bookedTimes = ['10:00', '15:00']

  const handleDateChange = (value: string) => {
    setFormData({ ...formData, date: value })
  }

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, time })
  }

  const handleNotesChange = (value: string) => {
    setFormData({ ...formData, notes: value })
  }

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3)
    }
  }

  const handleConfirm = () => {
    onConfirm?.(formData)
    setStep(1)
    setFormData({ date: '', time: '', notes: '' })
    onClose()
  }

  const handleClose = () => {
    setStep(1)
    setFormData({ date: '', time: '', notes: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
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
                {step === 1 ? 'Pilih Tanggal' : step === 2 ? 'Pilih Waktu' : 'Konfirmasi'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {step === 1
                  ? 'Kapan Anda ingin berkonsultasi?'
                  : step === 2
                  ? 'Jam berapa yang sesuai?'
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
                <div className={`h-1 rounded-full transition-all duration-300 ${1 <= step ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                <p className="text-xs text-gray-600 mt-1 text-center">Step 1</p>
              </div>
              <div className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-300 ${2 <= step ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                <p className="text-xs text-gray-600 mt-1 text-center">Step 2</p>
              </div>
              <div className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-300 ${3 <= step ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                <p className="text-xs text-gray-600 mt-1 text-center">Step 3</p>
              </div>
            </div>

            <div className="min-h-64">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Tanggal</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      💡 Pilih tanggal minimal 1 hari sebelumnya untuk memastikan konselor tersedia
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Waktu Tersedia untuk {formData.date || 'tanggal yang dipilih'}
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {availableTimes.map((time) => {
                        const isBooked = bookedTimes.includes(time)
                        const isSelected = formData.time === time
                        return (
                          <button
                            key={time}
                            onClick={() => !isBooked && handleTimeSelect(time)}
                            disabled={isBooked}
                            className={`p-3 rounded-lg transition-all duration-300 font-medium flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'bg-indigo-500 text-white shadow-lg ring-2 ring-indigo-300'
                                : isBooked
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-200'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            {time}
                            {isBooked && <span className="text-xs">Penuh</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Konselor</p>
                        <p className="font-semibold text-gray-900">{counselorName}</p>
                      </div>
                    </div>

                    <div className="border-t border-indigo-200 pt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Jenis Konseling</p>
                          <p className="font-medium text-gray-900">{counselingType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Tanggal</p>
                          <p className="font-medium text-gray-900">
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

                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Waktu</p>
                          <p className="font-medium text-gray-900">{formData.time || 'Belum dipilih'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Ada yang ingin dibicarakan dengan konselor? Ceritakan di sini..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
            onClick={step === 3 ? handleConfirm : handleNext}
            disabled={(step === 1 && !formData.date) || (step === 2 && !formData.time)}
            className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {step === 3 ? 'Konfirmasi Reservasi' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentScheduleModal
