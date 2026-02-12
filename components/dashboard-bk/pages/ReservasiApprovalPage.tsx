'use client'

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, User, Calendar, MessageCircle, MapPin, Loader, AlertCircle, Eye, QrCode } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { getPembinaanRingan, approvePembinaanRingan, completePembinaanRingan } from '@/lib/api';
import { createLaporanBk } from '@/lib/laporanBkAPI';
import { getStatusLabel, getStatusBadgeColor, statusBadgeColor, getTypeColor, getStatusColor, formatDate, typeLabel } from '@/lib/reservasi';

interface Reservasi {
  id: number;
  studentId: number;
  counselorId: number;
  preferredDate: string;
  preferredTime: string;
  type: 'chat' | 'tatap-muka';
  topic?: { id: number; name: string } | null;
  topicId?: number | null;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled';
  conversationId?: number;
  rejectionReason?: string;
  room?: string;
  qrCode?: string;
  attendanceConfirmed?: boolean;
  completedAt?: string;
  student?: { id: number; fullName: string; email: string; username: string };
  counselor?: { fullName: string };
  createdAt?: string;
  updatedAt?: string;
  counselingType?: 'umum' | 'kelompok' | 'khusus';
  pembinaanType?: 'ringan' | 'berat';
  pembinaan_id?: number;
}

interface PembinaanRingan {
  id: number;
  pembinaan_id: number;
  student_id: number;
  student_name: string;
  counselor_id: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  hasil_pembinaan: string;
  catatan_bk: string;
  sp_level?: 'SP1' | 'SP2' | null;
  pembinaan?: {
    id: number;
    siswas_id: number;
    siswas_name: string;
    class_id: number;
    class_name: string;
    kasus: string;
    walas_id?: number;
    point_pelanggaran?: {
      id: number;
      nama_pelanggaran: string;
    };
  };
}

interface ReservasiCardProps {
  reservasi: Reservasi;
  onViewDetail: (reservasi: Reservasi) => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason?: string) => void;
  loading: boolean;
}

// Reservasi Card Component
const ReservasiCard: React.FC<ReservasiCardProps> = ({ reservasi, onViewDetail, onApprove, onReject, loading }) => {

  const getInitial = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {getInitial(reservasi.student?.fullName || 'S')}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-1">
            <p className="font-semibold text-gray-900">{reservasi.student?.fullName || reservasi.student?.username || 'Siswa'}</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(reservasi.status)}`}>
              {reservasi.status === 'pending' ? 'Menunggu' : reservasi.status === 'approved' ? 'Diterima' : reservasi.status === 'rejected' ? 'Ditolak' : reservasi.status === 'in_counseling' ? 'Sedang Berlangsung' : 'Selesai'}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className={`px-2 py-1 rounded ${getTypeColor(reservasi.type)}`}>
              {reservasi.type === 'chat' ? 'Chat' : 'Tatap Muka'}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />
              {typeof reservasi.topic === 'object' ? reservasi.topic?.name : (reservasi.topicId ? `Topic #${reservasi.topicId}` : '-')}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(reservasi.preferredDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {reservasi.preferredTime}
            </span>
            {reservasi.type === 'tatap-muka' && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {reservasi.room || '-'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewDetail(reservasi)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Lihat Detail"
        >
          <Eye size={18} className="text-gray-600" />
        </button>

        {reservasi.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(reservasi.id)}
              disabled={loading}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
              title="Setujui"
            >
              {loading ? <Loader size={18} className="animate-spin text-gray-600" /> : <CheckCircle size={18} className="text-green-600" />}
            </button>
            <button
              onClick={() => onReject(reservasi.id)}
              disabled={loading}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              title="Tolak"
            >
              {loading ? <Loader size={18} className="animate-spin text-gray-600" /> : <XCircle size={18} className="text-red-600" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Detail Modal Component
interface DetailModalProps {
  reservasi: Reservasi | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason?: string) => void;
  onMarkComplete: (id: number) => void;
  loading: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({ reservasi, isOpen, onClose, onApprove, onReject, onMarkComplete, loading }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  if (!isOpen || !reservasi) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Detail Reservasi</h2>
              <p className="text-blue-100 text-sm mt-1">Informasi lengkap reservasi siswa</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg">
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4 mb-6">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Siswa</span>
                </div>
                <p className="text-gray-900 font-semibold">{reservasi.student?.fullName || reservasi.student?.username || 'N/A'}</p>
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
                  <p className="text-gray-900 font-semibold capitalize">{typeof reservasi.topic === 'object' ? reservasi.topic?.name : (reservasi.topicId ? `Topic #${reservasi.topicId}` : '-')}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
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
                  {getStatusLabel(reservasi.status)}
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
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                    >
                      {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      {loading ? 'Memproses...' : 'Setujui Reservasi'}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={loading}
                      className="w-full border border-red-300 text-red-600 hover:bg-red-50 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Tolak Reservasi
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Penolakan</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Jelaskan alasan penolakan..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason('');
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => {
                          onReject(reservasi.id, rejectReason);
                          setShowRejectForm(false);
                          setRejectReason('');
                        }}
                        disabled={loading || !rejectReason.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition"
                      >
                        {loading ? 'Memproses...' : 'Konfirmasi Penolakan'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QR Code Display */}
            {reservasi.status === 'approved' && reservasi.qrCode && (
              <div className="space-y-3 border-t pt-4">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <QrCode size={18} />
                  {showQRCode ? 'Sembunyikan QR' : 'Tampilkan QR untuk Siswa'}
                </button>

                {showQRCode && (
                  <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-3">Tunjukkan QR Code ini ke siswa untuk check-in</p>
                    <div className="bg-white p-3 rounded inline-block">
                      <img
                        src={reservasi.qrCode}
                        alt="QR Code"
                        className="w-40 h-40"
                      />
                    </div>
                    <p className="text-sm text-blue-700 mt-3 font-medium">Ruangan: {reservasi.room}</p>
                    <p className="text-xs text-blue-600 mt-3">Siswa akan scan QR code ini menggunakan ponselnya</p>
                  </div>
                )}

                {/* Attendance Status */}
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-2">Status Absensi</p>
                  {reservasi.attendanceConfirmed ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-semibold">Siswa Sudah Check-in</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-yellow-600">
                      <Clock size={20} />
                      <span className="font-semibold">Menunggu Check-in Siswa</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mark Complete Button - Outside QR Display */}
            {(() => {
              // Untuk chat session: bisa complete langsung jika status approved/in_counseling
              if (reservasi.type === 'chat' && (reservasi.status === 'approved' || reservasi.status === 'in_counseling') && !reservasi.completedAt) {
                return (
                  <button
                    onClick={() => onMarkComplete(reservasi.id)}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {loading ? 'Memproses...' : 'Selesaikan Sesi'}
                  </button>
                );
              }
              // Untuk tatap-muka: perlu attendance confirmation
              if (reservasi.type === 'tatap-muka' && (reservasi.status === 'approved' || reservasi.status === 'in_counseling') && reservasi.attendanceConfirmed && !reservasi.completedAt) {
                return (
                  <button
                    onClick={() => onMarkComplete(reservasi.id)}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {loading ? 'Memproses...' : 'Selesaikan Sesi'}
                  </button>
                );
              }
              return null;
            })()}

            {reservasi.completedAt && (
              <div className="w-full bg-green-100 text-green-700 py-2.5 rounded-lg font-semibold text-center">
                Sesi Telah Selesai pada {formatDate(reservasi.completedAt)}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Page Component
const ReservasiApprovalPage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'umum' | 'khusus'>('umum');
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([]);
  const [filteredReservasi, setFilteredReservasi] = useState<Reservasi[]>([]);
  const [pembinaanRinganList, setPembinaanRinganList] = useState<PembinaanRingan[]>([]);
  const [filteredPembinaanRingan, setFilteredPembinaanRingan] = useState<PembinaanRingan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Reservasi | null>(null);
  const [selectedPembinaanDetail, setSelectedPembinaanDetail] = useState<PembinaanRingan | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [pembinaanDetailOpen, setPembinaanDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Load reservasi
  useEffect(() => {
    if (token) {
      loadReservasi();
      loadPembinaanRingan();
    }
  }, [token]);

  // Filter reservasi saat search/filter berubah
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterStatus, filterType, reservasiList, pembinaanRinganList]);

  const loadReservasi = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching reservasi...');
      const response = await apiRequest('/reservasi', 'GET', undefined, token);
      console.log('✅ Reservasi loaded:', response);
      setReservasiList(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('❌ Error loading reservasi:', error);
      setReservasiList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPembinaanRingan = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching pembinaan ringan...');
      const response = await getPembinaanRingan(token);
      console.log('✅ Pembinaan ringan loaded:', response);
      setPembinaanRinganList(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('❌ Error loading pembinaan ringan:', error);
      setPembinaanRinganList([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservasiList];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((r) => r.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.student?.fullName?.toLowerCase().includes(query) ||
          r.student?.username?.toLowerCase().includes(query) ||
          r.student?.email?.toLowerCase().includes(query) ||
          (typeof r.topic === 'object' ? r.topic?.name?.toLowerCase().includes(query) : false)
      );
    }

    setFilteredReservasi(filtered);

    // Filter Pembinaan Ringan
    let filteredPembinaan = [...pembinaanRinganList];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPembinaan = filteredPembinaan.filter(
        (p) =>
          p.student_name?.toLowerCase().includes(query) ||
          p.pembinaan?.siswas_name?.toLowerCase().includes(query)
      );
    }
    setFilteredPembinaanRingan(filteredPembinaan);
  };

  const handleApprove = async (reservasiId: number) => {
    try {
      setSearching(true);
      console.log('✅ Approving reservasi:', reservasiId);
      await apiRequest(`/reservasi/${reservasiId}/status`, 'PUT', { status: 'approved' }, token);

      // Reload & close modal
      await loadReservasi();
      setDetailModalOpen(false);
      setSelectedDetail(null);
    } catch (error: any) {
      console.error('❌ Error approving:', error);
      alert('Gagal menyetujui reservasi');
    } finally {
      setSearching(false);
    }
  };

  const handleReject = async (reservasiId: number, reason: string = '') => {
    try {
      setSearching(true);
      console.log('❌ Rejecting reservasi:', reservasiId);
      await apiRequest(`/reservasi/${reservasiId}/status`, 'PUT', { status: 'rejected', rejectionReason: reason }, token);

      // Reload & close modal
      await loadReservasi();
      setDetailModalOpen(false);
      setSelectedDetail(null);
    } catch (error: any) {
      console.error('❌ Error rejecting:', error);
      alert('Gagal menolak reservasi');
    } finally {
      setSearching(false);
    }
  };

  const handleMarkComplete = async (id: number) => {
    try {
      setSearching(true);
      console.log('✅ Marking session as completed:', id);
      const response = await apiRequest(`/reservasi/${id}/complete`, 'PATCH', undefined, token);
      console.log('✅ Session marked complete:', response);
      await loadReservasi();
      setDetailModalOpen(false);
      setSelectedDetail(null);
      alert('Sesi berhasil ditandai sebagai selesai!');
    } catch (error: any) {
      console.error('❌ Error marking complete:', error);
      alert('Error: ' + (error?.message || 'Gagal menyelesaikan sesi'));
    } finally {
      setSearching(false);
    }
  };

  const handleMarkCompletePembinaanRingan = async (pembinaanRinganId: number) => {
    try {
      setSearching(true);
      console.log('🔍 Checking laporan BK for pembinaan ringan:', pembinaanRinganId);

      // Get laporan BK data for this pembinaan ringan
      const { getAllLaporanBk } = await import('@/lib/laporanBkAPI');
      const laporanList = await getAllLaporanBk(token);
      
      // Find laporan related to this pembinaan
      const relatedLaporan = laporanList?.find((l: any) => l.id === pembinaanRinganId);

      if (!relatedLaporan) {
        alert('❌ Laporan Bimbingan belum dibuat. Silakan buat laporan BK terlebih dahulu di halaman Laporan.');
        return;
      }

      // Check if laporan has been filled properly
      const requiredFields = [
        'bentukPenanganganSebelumnya',
        'riwayatSpDanKasus',
        'layananBk',
        'followUpTindakanBk',
        'hasilPemantauanKeterangan',
      ];

      const incompleteFields = requiredFields.filter(field => !relatedLaporan[field]);

      if (incompleteFields.length > 0) {
        alert(`❌ Laporan Bimbingan belum lengkap. Field yang harus diisi:\n${incompleteFields.join('\n')}\n\nSilakan lengkapi di halaman Laporan terlebih dahulu.`);
        return;
      }

      // If all validations pass, complete the session
      console.log('✅ Laporan BK valid. Completing pembinaan ringan...');
      const result = await completePembinaanRingan(
        pembinaanRinganId,
        {
          status: 'completed',
          bk_feedback: 'Konseling selesai dan laporan BK telah dikompilasi',
        },
        token
      );

      console.log('✅ Pembinaan ringan completed:', result);
      alert('Sesi pembinaan ringan berhasil diselesaikan!');

      // Update pembinaan status to completed
      await apiRequest(
        `/v1/pembinaan/${result.pembinaan_id}/`,
        'PATCH',
        { status: 'completed' },
        token
      );

      // Reload data
      await loadPembinaanRingan();
      setPembinaanDetailOpen(false);
      setSelectedPembinaanDetail(null);
    } catch (error: any) {
      console.error('❌ Error completing pembinaan ringan:', error);
      alert('Gagal menyelesaikan sesi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSearching(false);
    }
  };

  const handleApprovePembinaanRingan = async (pembinaanRingan: PembinaanRingan) => {
    try {
      setSearching(true);
      console.log('🔄 Approving pembinaan ringan:', pembinaanRingan.id);

      // Import helper function
      const { approvePembinaanRinganAndCreateLaporan } = await import('@/lib/pembinaanBkHelper');

      // Get BK user info from context if available
      const result = await approvePembinaanRinganAndCreateLaporan(
        pembinaanRingan,
        { id: pembinaanRingan.counselor_id }, // Simple BK user object
        token
      );

      console.log('✅ Pembinaan ringan approved with laporan:', result);
      alert('Pembinaan ringan berhasil disetujui dan laporan BK dibuat!');

      // Reload data
      await loadPembinaanRingan();
      setPembinaanDetailOpen(false);
      setSelectedPembinaanDetail(null);
    } catch (error: any) {
      console.error('❌ Error approving pembinaan ringan:', error);
      alert('Gagal menyetujui pembinaan ringan: ' + (error?.message || 'Unknown error'));
    } finally {
      setSearching(false);
    }
  };

  const pendingCount = reservasiList.filter((r) => r.status === 'pending').length;
  const approvedCount = reservasiList.filter((r) => r.status === 'approved').length;
  const rejectedCount = reservasiList.filter((r) => r.status === 'rejected').length;
  const completedCount = reservasiList.filter((r) => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Persetujuan Reservasi</h2>
          <p className="text-sm text-gray-600">Kelola dan setujui reservasi siswa</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Menunggu</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Disetujui</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <XCircle className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Ditolak</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{rejectedCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Selesai</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('umum')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'umum'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Konseling Umum & Kelompok
        </button>
        <button
          onClick={() => setActiveTab('khusus')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'khusus'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Konseling Khusus
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari siswa, email, atau topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="in_counseling">Sedang Berlangsung</option>
            <option value="completed">Selesai</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="tatap-muka">Tatap Muka</option>
            <option value="chat">Chat</option>
          </select>
        </div>

        {/* Reservasi List */}
        {activeTab === 'umum' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Memuat reservasi...</p>
                </div>
              </div>
            ) : filteredReservasi.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600">Tidak ada reservasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservasi.map((reservasi) => (
                  <ReservasiCard
                    key={reservasi.id}
                    reservasi={reservasi}
                    onViewDetail={(res) => {
                      setSelectedDetail(res);
                      setDetailModalOpen(true);
                    }}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={searching}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pembinaan Khusus List */}
        {activeTab === 'khusus' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Memuat pembinaan khusus...</p>
                </div>
              </div>
            ) : filteredPembinaanRingan.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600">Tidak ada pembinaan khusus</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPembinaanRingan.map((pembinaanRingan) => (
                  <div
                    key={pembinaanRingan.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                            <User className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {pembinaanRingan.pembinaan?.siswas_name || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {pembinaanRingan.pembinaan?.class_name || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Kasus</p>
                            <p className="text-sm font-medium text-gray-900">
                              {pembinaanRingan.pembinaan?.kasus || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">SP Level</p>
                            <p className="text-sm font-medium">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  pembinaanRingan.sp_level === 'SP1'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : pembinaanRingan.sp_level === 'SP2'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {pembinaanRingan.sp_level || 'Pembinaan Langsung'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Tanggal</p>
                            <p className="text-sm font-medium text-gray-900">
                              {pembinaanRingan.scheduled_date
                                ? new Date(pembinaanRingan.scheduled_date).toLocaleDateString('id-ID')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Status</p>
                            <p className="text-sm font-medium">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  pembinaanRingan.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : pembinaanRingan.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : pembinaanRingan.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {pembinaanRingan.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedPembinaanDetail(pembinaanRingan);
                            setPembinaanDetailOpen(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye size={18} />
                          Detail
                        </button>
                        {pembinaanRingan.status === 'pending' && (
                          <button
                            onClick={() => handleApprovePembinaanRingan(pembinaanRingan)}
                            disabled={searching}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle size={18} />
                            {searching ? 'Memproses...' : 'Setujui'}
                          </button>
                        )}
                        {pembinaanRingan.status === 'approved' && (
                          <button
                            onClick={() => handleMarkCompletePembinaanRingan(pembinaanRingan.id)}
                            disabled={searching}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle size={18} />
                            {searching ? 'Memproses...' : 'Selesai'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pembinaan Detail Modal */}
      {pembinaanDetailOpen && selectedPembinaanDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Detail Pembinaan Khusus</h3>
              <button
                onClick={() => {
                  setPembinaanDetailOpen(false);
                  setSelectedPembinaanDetail(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Nama Siswa</p>
                <p className="font-semibold text-gray-900">
                  {selectedPembinaanDetail.pembinaan?.siswas_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Kelas</p>
                <p className="font-semibold text-gray-900">
                  {selectedPembinaanDetail.pembinaan?.class_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Kasus/Masalah</p>
                <p className="font-semibold text-gray-900">
                  {selectedPembinaanDetail.pembinaan?.kasus}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">SP Level</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedPembinaanDetail.sp_level === 'SP1'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedPembinaanDetail.sp_level === 'SP2'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedPembinaanDetail.sp_level || 'Pembinaan Langsung'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Tanggal Terjadwal</p>
                <p className="font-semibold text-gray-900">
                  {selectedPembinaanDetail.scheduled_date
                    ? new Date(selectedPembinaanDetail.scheduled_date).toLocaleDateString('id-ID')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedPembinaanDetail.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedPembinaanDetail.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : selectedPembinaanDetail.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedPembinaanDetail.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {selectedPembinaanDetail.status === 'pending' && (
                <button
                  onClick={() => {
                    handleApprovePembinaanRingan(selectedPembinaanDetail);
                    setTimeout(() => {
                      setPembinaanDetailOpen(false);
                      setSelectedPembinaanDetail(null);
                    }, 1000);
                  }}
                  disabled={searching}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {searching ? 'Memproses...' : 'Setujui'}
                </button>
              )}
              {selectedPembinaanDetail.status === 'approved' && (
                <button
                  onClick={() => {
                    handleMarkCompletePembinaanRingan(selectedPembinaanDetail.id);
                    setTimeout(() => {
                      setPembinaanDetailOpen(false);
                      setSelectedPembinaanDetail(null);
                    }, 1000);
                  }}
                  disabled={searching}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {searching ? 'Memproses...' : 'Selesai'}
                </button>
              )}
              <button
                onClick={() => {
                  setPembinaanDetailOpen(false);
                  setSelectedPembinaanDetail(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Original Reservasi List (kept for backward compatibility) */}
      {activeTab === 'umum' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Memuat reservasi...</p>
                </div>
              </div>
            ) : filteredReservasi.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600">Tidak ada reservasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservasi.map((reservasi) => (
                  <ReservasiCard
                    key={reservasi.id}
                    reservasi={reservasi}
                    onViewDetail={(res) => {
                      setSelectedDetail(res);
                      setDetailModalOpen(true);
                    }}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={searching}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        reservasi={selectedDetail}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDetail(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkComplete={handleMarkComplete}
        loading={searching}
      />
    </div>
  );
};

export default ReservasiApprovalPage; 