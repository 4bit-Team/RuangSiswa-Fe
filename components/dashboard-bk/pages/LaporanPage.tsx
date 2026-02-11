'use client'

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  FileDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LaporanBk, LaporanBkFormData } from '@/types';
import {
  getAllLaporanBk,
  getLaporanBkById,
  createLaporanBk,
  updateLaporanBk,
  deleteLaporanBk,
  exportLaporanBkExcel,
  downloadLaporanBkTemplate,
  importLaporanBkExcel,
} from '@/lib/laporanBkAPI';

type Option = {
  id: number;
  nama: string;
};

const initialFormData: LaporanBkFormData = {
  namaKonseling: '',
  tanggalDiprosesAiBk: new Date().toISOString().split('T')[0],
  deskripsiKasusMasalah: '',
};

const LaporanPage: React.FC = () => {
  const { token } = useAuth();
  const [laporan, setLaporan] = useState<LaporanBk[]>([]);
  const [filteredLaporan, setFilteredLaporan] = useState<LaporanBk[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<LaporanBkFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [kelasList, setKelasList] = useState<Option[]>([]);
  const [jurusanList, setJurusanList] = useState<Option[]>([]);

  // useEffect ambil kelas & jurusan
  useEffect(() => {
    const fetchKelasJurusan = async () => {
      try {
        const [kelasRes, jurusanRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/kelas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/jurusan`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setKelasList(await kelasRes.json());
        setJurusanList(await jurusanRes.json());
      } catch (err) {
        console.error('Gagal mengambil kelas & jurusan');
      }
    };

      if (token) fetchKelasJurusan();
  }, [token]);

  //useEffect ambil laporan
  useEffect(() => {
    const fetchLaporan = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllLaporanBk(token);
        setLaporan(data);
        setFilteredLaporan(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

      if (token) fetchLaporan();
  }, [token]);

  // Search filter
  useEffect(() => {
    const filtered = laporan.filter((item) =>
      item.namaKonseling.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsiKasusMasalah.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLaporan(filtered);
  }, [searchTerm, laporan]);

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  // Handle submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await updateLaporanBk(editingId, formData, token);
        setSuccess('Laporan berhasil diperbarui');
      } else {
        await createLaporanBk(formData, token);
        setSuccess('Laporan berhasil dibuat');
      }

      // Refresh data
      const data = await getAllLaporanBk(token);
      setLaporan(data);
      setFilteredLaporan(data);

      // Reset form
      setFormData(initialFormData);
      setEditingId(null);
      setOpenModal(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle edit
  const handleEdit = async (id: number) => {
    try {
      const data = await getLaporanBkById(id, token);
      setFormData({
        namaKonseling: data.namaKonseling,
        jurusanId: data.jurusanId,
        kelasId: data.kelasId,
        tanggalDiprosesAiBk: data.tanggalDiprosesAiBk,
        deskripsiKasusMasalah: data.deskripsiKasusMasalah,
        bentukPenanganganSebelumnya: data.bentukPenanganganSebelumnya,
        riwayatSpDanKasus: data.riwayatSpDanKasus,
        layananBk: data.layananBk,
        followUpTindakanBk: data.followUpTindakanBk,
        penahanganGuruBkKonselingProsesPembinaan:
          data.penahanganGuruBkKonselingProsesPembinaan,
        pertemuanKe1: data.pertemuanKe1,
        pertemuanKe2: data.pertemuanKe2,
        pertemuanKe3: data.pertemuanKe3,
        hasilPemantauanKeterangan: data.hasilPemantauanKeterangan,
        guruBkYangMenanganiId: data.guruBkYangMenanganiId,
        statusPerkembanganPesertaDidik: data.statusPerkembanganPesertaDidik,
        keteranganKetersedianDokumen: data.keteranganKetersedianDokumen,
      });
      setEditingId(id);
      setOpenModal('form');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;

    setError(null);
    try {
      await deleteLaporanBk(id, token);
      setSuccess('Laporan berhasil dihapus');
      const data = await getAllLaporanBk(token);
      setLaporan(data);
      setFilteredLaporan(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle export
  const handleExport = async () => {
    setError(null);
    try {
      const blob = await exportLaporanBkExcel(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-bk-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Laporan berhasil di-export');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle download template
  const handleDownloadTemplate = async () => {
    setError(null);
    try {
      const blob = await downloadLaporanBkTemplate(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-laporan-bk.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Template berhasil diunduh');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const result = await importLaporanBkExcel(file, token);
      setSuccess(`${result.success} laporan berhasil diimport`);
      if (result.errors.length > 0) {
        setError(`Terdapat ${result.errors.length} baris yang gagal`);
      }

      // Refresh data
      const data = await getAllLaporanBk(token);
      setLaporan(data);
      setFilteredLaporan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form and close modal
  const closeModal = () => {
    setOpenModal(null);
    setFormData(initialFormData);
    setEditingId(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Konseling BK</h2>
          <p className="text-sm text-gray-600">Kelola laporan bimbingan konseling siswa</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 font-medium transition-colors"
            title="Download template Excel"
          >
            <FileDown size={18} />
            <span>Template</span>
          </button>
          <label className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 font-medium cursor-pointer transition-colors">
            <Upload size={18} />
            <span>Import</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
              disabled={loading}
            />
          </label>
          <button
            onClick={handleExport}
            disabled={laporan.length === 0}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setFormData(initialFormData);
              setEditingId(null);
              setOpenModal('form');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors"
          >
            <Plus size={20} />
            <span>Buat Laporan</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 ml-auto"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-green-900">Sukses</h3>
            <p className="text-sm text-green-700">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-400 hover:text-green-600 ml-auto"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Total Laporan</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{laporan.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Membaik</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {laporan.filter((l) => l.statusPerkembanganPesertaDidik === 'Membaik').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Stabil</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {laporan.filter((l) => l.statusPerkembanganPesertaDidik === 'Stabil').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-white" size={20} />
            </div>
            <h3 className="text-sm text-gray-600">Menurun</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {laporan.filter((l) => l.statusPerkembanganPesertaDidik === 'Menurun').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama konseling atau deskripsi kasus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Laporan List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : filteredLaporan.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada laporan ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLaporan.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.namaKonseling}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.deskripsiKasusMasalah}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    {item.kelas && <span>Kelas: {item.kelas.nama}</span>}
                    {item.jurusan && <span>Jurusan: {item.jurusan.nama}</span>}
                    <span>
                      {new Date(item.tanggalDiprosesAiBk).toLocaleDateString('id-ID')}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        item.statusPerkembanganPesertaDidik === 'Membaik'
                          ? 'bg-green-100 text-green-700'
                          : item.statusPerkembanganPesertaDidik === 'Stabil'
                          ? 'bg-blue-100 text-blue-700'
                          : item.statusPerkembanganPesertaDidik === 'Menurun'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.statusPerkembanganPesertaDidik || 'Belum ada status'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Form Create/Edit */}
      {openModal === 'form' && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={closeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl sticky top-0">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingId ? 'Edit Laporan Konseling' : 'Buat Laporan Konseling'}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Isi semua detail laporan konseling siswa
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nama Konseling & Tanggal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Konseling *
                      </label>
                      <input
                        type="text"
                        name="namaKonseling"
                        value={formData.namaKonseling}
                        onChange={handleFormChange}
                        placeholder="Nama siswa yang dikonseling"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Diproses BK *
                      </label>
                      <input
                        type="date"
                        name="tanggalDiprosesAiBk"
                        value={formData.tanggalDiprosesAiBk}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Kelas & Jurusan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kelas ID
                      </label>
                      <select
                        name="kelasId"
                        value={formData.kelasId || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Kelas</option>
                        {kelasList.map((kelas) => (
                          <option key={kelas.id} value={kelas.id}>
                            {kelas.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jurusan ID
                      </label>
                      <select
                        name="jurusanId"
                        value={formData.jurusanId || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Jurusan</option>
                        {jurusanList.map((jurusan) => (
                          <option key={jurusan.id} value={jurusan.id}>
                            {jurusan.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Deskripsi Kasus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Kasus / Masalah *
                    </label>
                    <textarea
                      name="deskripsiKasusMasalah"
                      value={formData.deskripsiKasusMasalah}
                      onChange={handleFormChange}
                      placeholder="Jelaskan kasus atau masalah yang dihadapi siswa"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Bentuk Penanganan & Riwayat */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bentuk Penanganan Sebelumnya (Oleh Walas)
                      </label>
                      <textarea
                        name="bentukPenanganganSebelumnya"
                        value={formData.bentukPenanganganSebelumnya || ''}
                        onChange={handleFormChange}
                        placeholder="Penanganan yang telah dilakukan oleh wali kelas"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Riwayat SP + Kasus (Setelah Follow Up)
                      </label>
                      <textarea
                        name="riwayatSpDanKasus"
                        value={formData.riwayatSpDanKasus || ''}
                        onChange={handleFormChange}
                        placeholder="Riwayat sangat penting dan kasus setelah tindak lanjut"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Layanan & Follow Up */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layanan BK
                      </label>
                      <textarea
                        name="layananBk"
                        value={formData.layananBk || ''}
                        onChange={handleFormChange}
                        placeholder="Jenis layanan BK yang diberikan"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow Up / Tindakan BK
                      </label>
                      <textarea
                        name="followUpTindakanBk"
                        value={formData.followUpTindakanBk || ''}
                        onChange={handleFormChange}
                        placeholder="Tindak lanjut atau follow up yang akan dilakukan"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Penanganan Guru BK */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penanganan Guru BK / Konseling / Proses Pembinaan
                    </label>
                    <textarea
                      name="penahanganGuruBkKonselingProsesPembinaan"
                      value={formData.penahanganGuruBkKonselingProsesPembinaan || ''}
                      onChange={handleFormChange}
                      placeholder="Detail proses pembinaan oleh guru BK"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Pertemuan 1, 2, 3 */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Riwayat Pertemuan</h3>

                    <div className="space-y-4">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700">
                              Pertemuan Ke-{num}
                            </label>
                            {formData[`pertemuanKe${num}` as keyof LaporanBkFormData] && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Sudah Diisi
                              </span>
                            )}
                          </div>

                          <textarea
                            name={`pertemuanKe${num}`}
                            value={
                              (formData[`pertemuanKe${num}` as keyof LaporanBkFormData] as string) || ''
                            }
                            onChange={handleFormChange}
                            placeholder={`Hasil dan catatan pertemuan ke-${num}`}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                    </div>

                  {/* Hasil Pemantauan & Guru BK */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hasil Pemantauan / Keterangan
                      </label>
                      <textarea
                        name="hasilPemantauanKeterangan"
                        value={formData.hasilPemantauanKeterangan || ''}
                        onChange={handleFormChange}
                        placeholder="Hasil pemantauan perkembangan siswa"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guru BK yang Menangani ID
                      </label>
                      <input
                        type="number"
                        name="guruBkYangMenanganiId"
                        value={formData.guruBkYangMenanganiId || ''}
                        onChange={handleFormChange}
                        placeholder="ID Guru BK yang menangani"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Status Perkembangan & Keterangan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status / Perkembangan Peserta Didik
                      </label>
                      <select
                        name="statusPerkembanganPesertaDidik"
                        value={formData.statusPerkembanganPesertaDidik || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Status</option>
                        <option value="Membaik">Membaik</option>
                        <option value="Stabil">Stabil</option>
                        <option value="Menurun">Menurun</option>
                        <option value="Belum Terlihat Perubahan">Belum Terlihat Perubahan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keterangan / Ketersediaan Dokumen
                      </label>
                      <textarea
                        name="keteranganKetersedianDokumen"
                        value={formData.keteranganKetersedianDokumen || ''}
                        onChange={handleFormChange}
                        placeholder="Keterangan tentang ketersediaan dokumen pendukung"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                    >
                      {editingId ? 'Perbarui' : 'Simpan'} Laporan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LaporanPage;