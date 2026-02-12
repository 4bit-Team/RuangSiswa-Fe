'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiRequest } from '@/lib/api'
import { AlertCircle, X, Calendar, Clock, User, ChevronRight } from 'lucide-react'

interface PembinaanRecord {
  id: number
  siswas_id: number
  siswas_name: string
  kasus: string
  class_name: string
}

interface ModalProps {
  isOpen: boolean
  pembinaan: PembinaanRecord | null
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
}

interface BKCounselor {
  id: number
  fullName: string
  username: string
  specialty: string
  available: boolean
  booked?: boolean
}

interface BKUser {
  id: number
  fullName: string
  username: string
  role: string
}

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00']

export const BKActionModal = ({ isOpen, pembinaan, onClose, onSubmit }: ModalProps) => {
  const { token } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [loadingBK, setLoadingBK] = useState(false)
  const [availableBK, setAvailableBK] = useState<BKCounselor[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    hasil_pembinaan: '',
    catatan_bk: '',
    counselor_id: '',
    scheduled_date: '',
    scheduled_time: '',
    session_type: 'tatap-muka',
    counseling_type: 'khusus',
    pembinaan_type: 'ringan',
  })

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Fetch available BK counselors based on date and time
  const fetchAvailableBK = async (date: string, time: string) => {
    try {
      setLoadingBK(true)
      setError(null)
      
      // Call bk-schedule API to get available counselors
      // Format: /bk-schedule/available/:sessionType/:date/:time
      const data = await apiRequest(
        `/bk-schedule/available/${formData.session_type}/${date}/${time}`,
        'GET',
        undefined,
        token
      )
      
      // Extract counselor data from response and map bkId to id
      const bookingStatus = data.bookingStatus || []
      const counselors: BKCounselor[] = bookingStatus
        .filter((bk: any) => !bk.booked)
        .map((bk: any) => ({
          id: bk.bkId,
          fullName: bk.fullName,
          username: bk.username,
          specialty: bk.specialty,
          available: bk.available,
          booked: bk.booked,
        }))
      
      setAvailableBK(counselors)
      
      if (counselors.length === 0) {
        setError('Tidak ada Guru BK yang tersedia pada jam tersebut')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar BK')
      setAvailableBK([])
    } finally {
      setLoadingBK(false)
    }
  }

  const handleDateChange = async (date: string) => {
    setFormData({ ...formData, scheduled_date: date, counselor_id: '' })
    if (date && formData.scheduled_time) {
      await fetchAvailableBK(date, formData.scheduled_time)
    }
  }

  const handleTimeSelect = async (time: string) => {
    setFormData({ ...formData, scheduled_time: time, counselor_id: '' })
    if (formData.scheduled_date && time) {
      await fetchAvailableBK(formData.scheduled_date, time)
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.scheduled_date || !formData.scheduled_time) {
        setError('Silakan pilih tanggal dan waktu terlebih dahulu')
        return
      }
      if (!formData.counselor_id) {
        setError('Silakan pilih Guru BK')
        return
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.counselor_id || !formData.scheduled_date || !formData.scheduled_time) {
      setError('Semua field harus diisi')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit({
        ...formData,
        counselor_id: parseInt(formData.counselor_id),
        type: 'ringan',
      })
      // Reset form
      setFormData({
        hasil_pembinaan: '',
        catatan_bk: '',
        counselor_id: '',
        scheduled_date: '',
        scheduled_time: '',
        session_type: 'tatap-muka',
        counseling_type: 'khusus',
        pembinaan_type: 'ringan',
      })
      setStep(1)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat konseling')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Proses ke BK (Pembinaan Ringan)</h2>
              <p className="text-sm text-gray-600 mt-1">
                Kirimkan {pembinaan?.siswas_name} ke Guru BK untuk konseling
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step >= s
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-8 h-1 mx-1 transition-colors ${
                      step > s ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Schedule Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Pilih Jadwal Konseling</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Tanggal Jadwal
                  </label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={e => handleDateChange(e.target.value)}
                    min={getTodayDate()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Pilih Waktu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeSelect(time)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          formData.scheduled_time === time
                            ? 'bg-orange-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingBK && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Memuat Guru BK yang tersedia...</p>
                  </div>
                )}

                {!loadingBK && formData.scheduled_date && formData.scheduled_time && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Pilih Guru BK ({availableBK.length} tersedia)
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableBK.map(bk => (
                        <button
                          key={bk.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, counselor_id: bk.id.toString() })
                          }
                          className={`p-3 rounded-lg text-sm text-left font-semibold transition-colors ${
                            formData.counselor_id === bk.id.toString()
                              ? 'bg-orange-100 border-2 border-orange-600 text-orange-900'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold">{bk.fullName}</div>
                          <div className="text-xs text-gray-600 mt-1">{bk.specialty}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Session Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Detail Sesi</h3>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Guru BK:</span>{' '}
                    {availableBK.find(bk => bk.id.toString() === formData.counselor_id)?.fullName}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Jadwal:</span> {formData.scheduled_date}{' '}
                    {formData.scheduled_time}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipe Sesi
                    </label>
                    <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                      Tatap Muka
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenis Konseling
                    </label>
                    <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                      Khusus (Pembinaan Ringan)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Notes */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Catatan Pembinaan</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hasil Pembinaan Kesiswaan
                  </label>
                  <textarea
                    placeholder="Tulis hasil pembinaan dari kesiswaan..."
                    value={formData.hasil_pembinaan}
                    onChange={e => setFormData({ ...formData, hasil_pembinaan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catatan untuk Guru BK
                  </label>
                  <textarea
                    placeholder="Catatan/rekomendasi untuk Guru BK..."
                    value={formData.catatan_bk}
                    onChange={e => setFormData({ ...formData, catatan_bk: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={step === 1 ? onClose : handleBack}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                {step === 1 ? 'Batal' : 'Kembali'}
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loadingBK}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  Lanjut <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Memproses...' : 'Kirim ke BK'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export const OrtuActionModal = ({ isOpen, pembinaan, onClose, onSubmit }: ModalProps) => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    parent_name: '',
    parent_phone: '',
    violation_details: '',
    letter_content: '',
    scheduled_date: '',
    scheduled_time: '',
    location: '',
    communication_method: 'manual',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.parent_name || !formData.violation_details || !formData.letter_content || !formData.scheduled_date) {
      setError('Field yang wajib diisi: Nama Ortu, Detail Pelanggaran, Surat, dan Tanggal')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit({
        ...formData,
        communication_method: formData.communication_method || 'manual',
        type: 'ortu',
      })
      // Reset form
      setFormData({
        parent_name: '',
        parent_phone: '',
        violation_details: '',
        letter_content: '',
        scheduled_date: '',
        scheduled_time: '',
        location: '',
        communication_method: 'manual',
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pemanggilan ortu')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Proses ke Orang Tua</h2>
              <p className="text-sm text-gray-600 mt-1">Buat surat pemanggilan untuk orang tua {pembinaan?.siswas_name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Orang Tua <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap orang tua"
                  value={formData.parent_name}
                  onChange={e => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.parent_phone}
                  onChange={e => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detail Pelanggaran <span className="text-red-600">*</span>
              </label>
              <textarea
                placeholder="Jelaskan detail pelanggaran yang dilakukan siswa..."
                value={formData.violation_details}
                onChange={e => setFormData({ ...formData, violation_details: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Isi Surat Pemanggilan <span className="text-red-600">*</span>
              </label>
              <textarea
                placeholder="Tulis isi surat pemanggilan..."
                value={formData.letter_content}
                onChange={e => setFormData({ ...formData, letter_content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Pertemuan <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Waktu Pertemuan
                </label>
                <input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={e => setFormData({ ...formData, scheduled_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lokasi Pertemuan
              </label>
              <input
                type="text"
                placeholder="Ruang Kepala Sekolah, Ruang Kesiswaan, dll"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Metode Pengiriman Surat
              </label>
              <select
                value={formData.communication_method}
                onChange={e => setFormData({ ...formData, communication_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="manual">Manual (Diserahkan Langsung)</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Memproses...' : 'Buat Pemanggilan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export const WakaActionModal = ({ isOpen, pembinaan, onClose, onSubmit }: ModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    recommendation: '',
    preferredDate: '',
    preferredTime: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.preferredDate || !formData.preferredTime) {
      setError('Tanggal dan waktu harus diisi')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit({
        ...formData,
        type: 'berat',
      })
      // Reset form
      setFormData({
        recommendation: '',
        preferredDate: '',
        preferredTime: '',
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pembinaan berat')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Proses ke Waka (Pembinaan Berat)</h2>
              <p className="text-sm text-gray-600 mt-1">Kirimkan SP 3 ke Wakil Kepala Sekolah untuk {pembinaan?.siswas_name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                <strong>⚠️ Perhatian:</strong> Ini adalah proses pembinaan berat (SP 3). Pastikan semua tahap pembinaan ringan dan pemanggilan orang tua sudah dilakukan sebelum melanjutkan.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rekomendasi Pembinaan
              </label>
              <textarea
                placeholder="Rekomendasi untuk Wakil Kepala Sekolah..."
                value={formData.recommendation}
                onChange={e => setFormData({ ...formData, recommendation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Rapat Waka
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Waktu Rapat Waka
                </label>
                <input
                  type="time"
                  value={formData.preferredTime}
                  onChange={e => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? 'Memproses...' : 'Kirim ke Waka'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
