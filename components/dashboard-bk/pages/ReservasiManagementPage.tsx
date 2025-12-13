'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Users, MapPin, CheckCircle, XCircle, ChevronDown, MessageCircle, Loader } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Reservasi {
  id: number
  studentId: number
  counselorId: number
  preferredDate: string
  preferredTime: string
  type: 'chat' | 'tatap-muka'
  topic: string
  notes: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  conversationId?: number
  room?: string
  qrCode?: string
  attendanceConfirmed?: boolean
  completedAt?: string
  student?: { fullName: string; email: string }
  counselor?: { fullName: string }
  createdAt: string
}

interface DetailReservasiModalProps {
  reservasi: Reservasi | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: number) => void
  onReject: (id: number, reason: string) => void
  loading: boolean
}

const DetailReservasiModal: React.FC<DetailReservasiModalProps> = ({
  reservasi,
  isOpen,
  onClose,
  onApprove,
  onReject,
  loading,
}) => {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  if (!isOpen || !reservasi) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const statusBadgeColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  const typeLabel = {
    chat: 'Sesi Chat',
    'tatap-muka': 'Tatap Muka',
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Detail Reservasi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Siswa</span>
            </div>
            <p className="text-gray-900 font-semibold">{reservasi.student?.fullName || 'N/A'}</p>
            <p className="text-sm text-gray-600">{reservasi.student?.email || 'N/A'}</p>
          </div>

          {/* Type & Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">Tipe Sesi</p>
              <p className="text-gray-900 font-semibold">{typeLabel[reservasi.type]}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-1">Topik</p>
              <p className="text-gray-900 font-semibold capitalize">{reservasi.topic || '-'}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-gray-600 font-medium">Tanggal</p>
              </div>
              <p className="text-gray-900 font-semibold text-sm">{formatDate(reservasi.preferredDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-gray-600 font-medium">Jam</p>
              </div>
              <p className="text-gray-900 font-semibold">{reservasi.preferredTime}</p>
            </div>
          </div>

          {/* Room (jika tatap muka) */}
          {reservasi.type === 'tatap-muka' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <p className="text-xs text-gray-600 font-medium">Ruangan</p>
              </div>
              <p className="text-gray-900 font-semibold">{reservasi.room || '-'}</p>
            </div>
          )}

          {/* Notes */}
          {reservasi.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-medium mb-2">Catatan Siswa</p>
              <p className="text-gray-900 text-sm">{reservasi.notes}</p>
            </div>
          )}

          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeColor[reservasi.status]}`}>
              {reservasi.status.charAt(0).toUpperCase() + reservasi.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {reservasi.status === 'pending' && (
          <div className="space-y-3">
            {!showRejectForm ? (
              <>
                <button
                  onClick={() => onApprove(reservasi.id)}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Terima Reservasi
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak Reservasi
                </button>
              </>
            ) : (
              <>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Alasan penolakan..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
                <button
                  onClick={() => onReject(reservasi.id, rejectReason)}
                  disabled={loading || !rejectReason.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Konfirmasi Penolakan'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectReason('')
                  }}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-lg font-medium"
                >
                  Batal
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg font-medium"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}

const ReservasiManagementPage: React.FC = () => {
  const { user, token } = useAuth()
  const [reservasi, setReservasi] = useState<Reservasi[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedReservasi, setSelectedReservasi] = useState<Reservasi | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    if (user && token) {
      fetchReservasi()
    }
  }, [user, token])

  const fetchReservasi = async () => {
    try {
      setLoading(true)
      console.log('📥 Fetching pending reservasi for counselor...')
      const response = await apiRequest('/reservasi/counselor/pending', 'GET', undefined, token)
      console.log('✅ Reservasi loaded:', response)
      setReservasi(response)
    } catch (error: any) {
      console.error('❌ Error fetching reservasi:', error)
      alert('Error loading reservasi: ' + (error?.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(true)
      console.log('✅ Approving reservasi:', id)
      await apiRequest(`/reservasi/${id}/status`, 'PUT', { status: 'approved' }, token)
      setDetailModalOpen(false)
      await fetchReservasi()
      alert('Reservasi berhasil diterima!')
    } catch (error: any) {
      console.error('❌ Error approving reservasi:', error)
      alert('Error: ' + (error?.message || 'Failed to approve'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: number, reason: string) => {
    try {
      setActionLoading(true)
      console.log('❌ Rejecting reservasi:', id)
      await apiRequest(`/reservasi/${id}/status`, 'PUT', { status: 'rejected', rejectionReason: reason }, token)
      setDetailModalOpen(false)
      await fetchReservasi()
      alert('Reservasi berhasil ditolak!')
    } catch (error: any) {
      console.error('❌ Error rejecting reservasi:', error)
      alert('Error: ' + (error?.message || 'Failed to reject'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleViewDetail = (res: Reservasi) => {
    setSelectedReservasi(res)
    setDetailModalOpen(true)
  }

  if (!user || !token) {
    return <div className="text-center py-8 text-gray-600">Silahkan login terlebih dahulu</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Reservasi</h1>
        <p className="text-gray-600">Kelola reservasi konseling dari siswa</p>
      </div>

      {reservasi.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">Tidak ada reservasi yang menunggu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservasi.map((res) => (
            <div key={res.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}
                className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{res.student?.fullName || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600">{res.preferredTime} • {res.topic}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                      {res.type === 'chat' ? 'Chat' : 'Tatap Muka'}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === res.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </button>

              {expandedId === res.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Email Siswa</p>
                    <p className="text-gray-900">{res.student?.email}</p>
                  </div>
                  <button
                    onClick={() => handleViewDetail(res)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                  >
                    Lihat Detail & Terima/Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DetailReservasiModal
        reservasi={selectedReservasi}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />
    </div>
  )
}

export default ReservasiManagementPage