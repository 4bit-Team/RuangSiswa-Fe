'use client'

import React, { useState } from 'react'
import { X, Plus, TrendingUp, AlertCircle, CheckCircle, Phone, MapPin, Users } from 'lucide-react'
import BaseModal from './BaseModal'

interface DashboardItem {
  id: number
  studentName: string
  nisn: string
  className: string
}

interface FollowUpAction {
  id: number
  type: 'Pangilan Orang Tua' | 'Home Visit' | 'Konferensi Kasus'
  date: string
  description: string
  result: string
  status: 'Terjadwal' | 'Selesai' | 'Ditunda'
}

interface ProblemRecord {
  id: number
  category: 'Presensi' | 'Disiplin' | 'Akademik'
  description: string
  referenceFrom: string
  problemType: 'Attendance' | 'Discipline' | 'Academic'
  dateReported: string
  resolutionStatus: 'Tuntas' | 'Tidak Tuntas'
  guidanceHistory: Array<{
    id: number
    date: string
    counselor: string
    notes: string
  }>
  followUpActions: FollowUpAction[]
  referralStatus?: 'Belum' | 'Dirujuk' | 'Ditangani Ahli'
}

interface ProblemTrackerModalProps {
  isOpen: boolean
  onClose: () => void
  student: DashboardItem
  onSubmit: (studentId: number, problem: ProblemRecord) => void
}

const CategoryIcon: React.FC<{ category: 'Presensi' | 'Disiplin' | 'Akademik' }> = ({ category }) => {
  const icons: Record<string, React.ReactNode> = {
    'Presensi': <AlertCircle className="w-5 h-5" />,
    'Disiplin': <AlertCircle className="w-5 h-5" />,
    'Akademik': <TrendingUp className="w-5 h-5" />,
  }
  return <>{icons[category]}</>
}

const ProblemTrackerModal: React.FC<ProblemTrackerModalProps> = ({
  isOpen,
  onClose,
  student,
  onSubmit,
}) => {
  const [step, setStep] = useState<'problem' | 'guidance' | 'followup' | 'resolution'>('problem')
  const [problemData, setProblemData] = useState<Omit<ProblemRecord, 'id'>>({
    category: 'Presensi',
    description: '',
    referenceFrom: '',
    problemType: 'Attendance',
    dateReported: new Date().toISOString().split('T')[0],
    resolutionStatus: 'Tidak Tuntas',
    guidanceHistory: [],
    followUpActions: [],
    referralStatus: 'Belum',
  })

  const [currentGuidance, setCurrentGuidance] = useState({
    counselor: '',
    notes: '',
  })

  const [currentFollowUp, setCurrentFollowUp] = useState({
    type: 'Pangilan Orang Tua' as 'Pangilan Orang Tua' | 'Home Visit' | 'Konferensi Kasus',
    date: '',
    description: '',
    result: '',
    status: 'Terjadwal' as 'Terjadwal' | 'Selesai' | 'Ditunda',
  })

  const handleProblemChange = (field: string, value: any) => {
    setProblemData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddGuidance = () => {
    if (currentGuidance.counselor && currentGuidance.notes) {
      const newGuidance = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        counselor: currentGuidance.counselor,
        notes: currentGuidance.notes,
      }
      setProblemData((prev) => ({
        ...prev,
        guidanceHistory: [...(prev.guidanceHistory || []), newGuidance],
      }))
      setCurrentGuidance({ counselor: '', notes: '' })
    }
  }

  const handleAddFollowUp = () => {
    if (currentFollowUp.date && currentFollowUp.description && currentFollowUp.result) {
      const newAction = {
        id: Date.now(),
        ...currentFollowUp,
      }
      setProblemData((prev) => ({
        ...prev,
        followUpActions: [...(prev.followUpActions || []), newAction],
      }))
      setCurrentFollowUp({
        type: 'Pangilan Orang Tua',
        date: '',
        description: '',
        result: '',
        status: 'Terjadwal',
      })
    }
  }

  const handleSubmit = () => {
    if (problemData.description && problemData.referenceFrom) {
      onSubmit(student.id, {
        id: Date.now(),
        ...problemData,
      })
      onClose()
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Presensi': 'from-orange-400 to-orange-600',
      'Disiplin': 'from-red-400 to-red-600',
      'Akademik': 'from-blue-400 to-blue-600',
    }
    return colors[category] || 'from-gray-400 to-gray-600'
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tracking Masalah - ${student.studentName}`}
      subtitle={`NISN: ${student.nisn} | Kelas: ${student.className}`}
      width="max-w-4xl"
      headerGradient={`bg-gradient-to-r ${getCategoryColor(problemData.category)}`}
      icon={<AlertCircle className="w-6 h-6" />}
    >
      <div className="space-y-6">
        {/* Flowchart Reference */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-2">📊 Alur Penyelesaian Masalah Murid</h4>
          <p className="text-sm text-gray-700">
            Identifikasi → Bimbingan → Evaluasi Status (Tuntas/Tidak Tuntas) → Tindak Lanjut (jika diperlukan) → Referral (jika belum tuntas)
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setStep('problem')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              step === 'problem'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1️⃣ Identifikasi Masalah
          </button>
          <button
            onClick={() => setStep('guidance')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              step === 'guidance'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2️⃣ Bimbingan
          </button>
          <button
            onClick={() => setStep('resolution')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              step === 'resolution'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3️⃣ Status Penyelesaian
          </button>
          <button
            onClick={() => setStep('followup')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              step === 'followup'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            4️⃣ Tindak Lanjut
          </button>
        </div>

        {/* Step 1: Problem Identification */}
        {step === 'problem' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Masalah <span className="text-red-500">*</span>
                </label>
                <select
                  value={problemData.category}
                  onChange={(e) => {
                    handleProblemChange('category', e.target.value)
                    // Auto-set problemType based on category
                    const typeMap: Record<string, 'Attendance' | 'Discipline' | 'Academic'> = {
                      'Presensi': 'Attendance',
                      'Disiplin': 'Discipline',
                      'Akademik': 'Academic',
                    }
                    handleProblemChange('problemType', typeMap[e.target.value])
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="Presensi">📍 Presensi/Kehadiran</option>
                  <option value="Disiplin">⚠️ Ketidakdisiplinan</option>
                  <option value="Akademik">📚 Akademik/Hasil Belajar</option>
                </select>
              </div>

              {/* Reference From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dilaporkan Oleh <span className="text-red-500">*</span>
                </label>
                <select
                  value={problemData.referenceFrom}
                  onChange={(e) => handleProblemChange('referenceFrom', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">Pilih Pelapor</option>
                  {problemData.category === 'Presensi' && (
                    <>
                      <option value="Wali Kelas">👨‍🏫 Wali Kelas</option>
                      <option value="Guru">👨‍🏫 Guru Mapel</option>
                    </>
                  )}
                  {problemData.category === 'Disiplin' && (
                    <>
                      <option value="Guru BK">🎓 Guru BK</option>
                      <option value="Wali Kelas">👨‍🏫 Wali Kelas</option>
                      <option value="Kepala Sekolah">👔 Kepala Sekolah</option>
                      <option value="Satpam">👮 Satpam</option>
                    </>
                  )}
                  {problemData.category === 'Akademik' && (
                    <>
                      <option value="Guru Mapel">👨‍🏫 Guru Mapel</option>
                      <option value="Wali Kelas">👨‍🏫 Wali Kelas</option>
                      <option value="Orang Tua">👨‍👩‍👧 Orang Tua</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Masalah <span className="text-red-500">*</span>
              </label>
              <textarea
                value={problemData.description}
                onChange={(e) => handleProblemChange('description', e.target.value)}
                placeholder="Jelaskan masalah yang dihadapi siswa secara detail..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Pelaporan
              </label>
              <input
                type="date"
                value={problemData.dateReported}
                onChange={(e) => handleProblemChange('dateReported', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Catatan:</strong> Identifikasi masalah dengan jelas berdasarkan kategori:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                <li>• <strong>Presensi:</strong> Keterlambatan, bolos, izin tanpa keterangan</li>
                <li>• <strong>Disiplin:</strong> Pelanggaran tata tertib, perilaku tidak terpuji</li>
                <li>• <strong>Akademik:</strong> Nilai rendah, tidak fokus belajar, prestasi menurun</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Guidance History */}
        {step === 'guidance' && (
          <div className="space-y-4">
            {/* Existing Guidance Sessions */}
            {problemData.guidanceHistory && problemData.guidanceHistory.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">💬 Riwayat Bimbingan</h4>
                <div className="space-y-2 mb-4">
                  {problemData.guidanceHistory.map((session) => (
                    <div key={session.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{session.counselor}</p>
                          <p className="text-xs text-gray-500">{session.date}</p>
                        </div>
                        <button
                          onClick={() => {
                            setProblemData((prev) => ({
                              ...prev,
                              guidanceHistory: prev.guidanceHistory.filter((g) => g.id !== session.id),
                            }))
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700">{session.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Guidance Session */}
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">➕ Tambah Sesi Bimbingan Baru</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Konselor/Pembimbing <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentGuidance.counselor}
                  onChange={(e) => setCurrentGuidance({ ...currentGuidance, counselor: e.target.value })}
                  placeholder="Masukkan nama konselor/guru BK"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Sesi Bimbingan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={currentGuidance.notes}
                  onChange={(e) => setCurrentGuidance({ ...currentGuidance, notes: e.target.value })}
                  placeholder="Catatan hasil bimbingan, saran, rencana tindakan..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <button
                onClick={handleAddGuidance}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambah Sesi Bimbingan
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ <strong>Catatan:</strong> Rekam setiap sesi bimbingan yang dilakukan dengan detail untuk tracking progress penyelesaian masalah.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Resolution Status */}
        {step === 'resolution' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                🎯 Status Penyelesaian Masalah
              </h4>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition-all"
                  style={{
                    borderColor: problemData.resolutionStatus === 'Tuntas' ? '#16a34a' : '#e5e7eb',
                    backgroundColor: problemData.resolutionStatus === 'Tuntas' ? '#f0fdf4' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="Tuntas"
                    checked={problemData.resolutionStatus === 'Tuntas'}
                    onChange={(e) => handleProblemChange('resolutionStatus', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Masalah Murid Tuntas
                    </p>
                    <p className="text-sm text-gray-600">
                      Masalah telah berhasil diselesaikan melalui bimbingan dan tindakan yang tepat
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-red-300 rounded-lg cursor-pointer hover:bg-red-50 transition-all"
                  style={{
                    borderColor: problemData.resolutionStatus === 'Tidak Tuntas' ? '#dc2626' : '#e5e7eb',
                    backgroundColor: problemData.resolutionStatus === 'Tidak Tuntas' ? '#fef2f2' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="Tidak Tuntas"
                    checked={problemData.resolutionStatus === 'Tidak Tuntas'}
                    onChange={(e) => handleProblemChange('resolutionStatus', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Masalah Murid Tidak Tuntas
                    </p>
                    <p className="text-sm text-gray-600">
                      Masalah belum selesai dan memerlukan tindak lanjut lebih lanjut
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {problemData.resolutionStatus === 'Tidak Tuntas' && (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={problemData.referralStatus === 'Dirujuk'}
                    onChange={(e) =>
                      handleProblemChange('referralStatus', e.target.checked ? 'Dirujuk' : 'Belum')
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ⚕️ Dirujuk ke Ahli Terkait (Psikolog, Dokter, dll)
                  </span>
                </label>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    🔄 <strong>Jika Tidak Tuntas:</strong> Lanjutkan ke langkah "Tindak Lanjut" untuk merencanakan pelaksanaan home visit, konferensi kasus, atau pangilan orang tua.
                  </p>
                </div>
              </>
            )}

            {problemData.resolutionStatus === 'Tuntas' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ <strong>Masalah Tuntas:</strong> Dokumentasikan kesimpulan dan rekomendasi untuk mencegah masalah serupa di masa depan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Follow-up Actions */}
        {step === 'followup' && (
          <div className="space-y-4">
            {/* Show follow-up actions only if problem is not resolved */}
            {problemData.resolutionStatus === 'Tidak Tuntas' ? (
              <>
                {/* Existing Follow-up Actions */}
                {problemData.followUpActions && problemData.followUpActions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      📋 Rencana Tindak Lanjut Terencana
                    </h4>
                    <div className="space-y-2 mb-4">
                      {problemData.followUpActions.map((action) => (
                        <div key={action.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {action.type === 'Pangilan Orang Tua' && <Phone className="w-4 h-4 text-blue-600" />}
                              {action.type === 'Home Visit' && <MapPin className="w-4 h-4 text-blue-600" />}
                              {action.type === 'Konferensi Kasus' && <Users className="w-4 h-4 text-blue-600" />}
                              <p className="font-medium text-gray-900">{action.type}</p>
                            </div>
                            <button
                              onClick={() => {
                                setProblemData((prev) => ({
                                  ...prev,
                                  followUpActions: prev.followUpActions.filter((a) => a.id !== action.id),
                                }))
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{action.date}</p>
                          <p className="text-sm text-gray-700 mb-2"><strong>Rencana:</strong> {action.description}</p>
                          <p className="text-sm text-gray-700"><strong>Hasil:</strong> {action.result}</p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                              action.status === 'Selesai'
                                ? 'bg-green-100 text-green-700'
                                : action.status === 'Ditunda'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {action.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Follow-up Action */}
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">➕ Tambah Tindak Lanjut Baru</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Tindak Lanjut <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentFollowUp.type}
                      onChange={(e) =>
                        setCurrentFollowUp({
                          ...currentFollowUp,
                          type: e.target.value as 'Pangilan Orang Tua' | 'Home Visit' | 'Konferensi Kasus',
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="Pangilan Orang Tua">☎️ Pangilan Orang Tua</option>
                      <option value="Home Visit">🏠 Home Visit</option>
                      <option value="Konferensi Kasus">👥 Konferensi Kasus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Pelaksanaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={currentFollowUp.date}
                      onChange={(e) => setCurrentFollowUp({ ...currentFollowUp, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rencana/Tujuan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={currentFollowUp.description}
                      onChange={(e) =>
                        setCurrentFollowUp({ ...currentFollowUp, description: e.target.value })
                      }
                      placeholder="Jelaskan rencana/tujuan tindak lanjut ini..."
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasil/Kesimpulan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={currentFollowUp.result}
                      onChange={(e) => setCurrentFollowUp({ ...currentFollowUp, result: e.target.value })}
                      placeholder="Hasil dari tindak lanjut ini..."
                      rows={2}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={currentFollowUp.status}
                      onChange={(e) =>
                        setCurrentFollowUp({
                          ...currentFollowUp,
                          status: e.target.value as 'Terjadwal' | 'Selesai' | 'Ditunda',
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="Terjadwal">📅 Terjadwal</option>
                      <option value="Selesai">✅ Selesai</option>
                      <option value="Ditunda">⏸️ Ditunda</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddFollowUp}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Tindak Lanjut
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Tindak Lanjut yang Disarankan:</strong>
                  </p>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1 ml-4">
                    <li>• <strong>Pangilan Orang Tua:</strong> Diskusi intensif untuk melibatkan dukungan keluarga</li>
                    <li>• <strong>Home Visit:</strong> Kunjungan rumah oleh wali kelas/guru BK untuk pemahaman konteks</li>
                    <li>• <strong>Konferensi Kasus:</strong> Pertemuan dengan berbagai pihak untuk solusi komprehensif</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-800 mb-1">Masalah Telah Tuntas</p>
                <p className="text-sm text-green-700">
                  Tidak diperlukan tindak lanjut lanjutan. Lanjutkan monitoring rutin siswa.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:shadow-lg transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            Simpan Tracking Masalah
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

export default ProblemTrackerModal
