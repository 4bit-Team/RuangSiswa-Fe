'use client'

import React, { useState } from 'react'
import { Trophy, Download, Plus, Eye, Edit, Trash2, Search, X } from 'lucide-react'

interface Achievement {
  id: number
  nis: string
  name: string
  class: string
  major: string
  achievementName: string
  level: 'Nasional' | 'Provinsi' | 'Kabupaten/Kota' | 'Sekolah'
  date: string
  announcementMonth: string
  evidence: string
}

const SiswaBerprestiPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [filterLevel, setFilterLevel] = useState('')

  const achievements: Achievement[] = [
    { id: 1, nis: '2023001', name: 'Ahmad Fauzi', class: 'XII IPA 1', major: 'IPA', achievementName: 'Juara 1 Olimpiade Matematika', level: 'Nasional', date: '2024-11-15', announcementMonth: 'November 2024', evidence: 'sertifikat_olimpiade.pdf' },
    { id: 2, nis: '2023045', name: 'Budi Santoso', class: 'X MIPA 3', major: 'MIPA', achievementName: 'Juara 2 Kompetisi Robotika', level: 'Provinsi', date: '2024-10-20', announcementMonth: 'Oktober 2024', evidence: 'sertifikat_robotika.pdf' },
    { id: 3, nis: '2023102', name: 'Dewi Lestari', class: 'XII IPS 1', major: 'IPS', achievementName: 'Pemenang Lomba Debat Bahasa Inggris', level: 'Kabupaten/Kota', date: '2024-09-10', announcementMonth: 'September 2024', evidence: 'sertifikat_debat.pdf' },
    { id: 4, nis: '2023067', name: 'Maya Putri', class: 'X IPS 2', major: 'IPS', achievementName: 'Juara Lomba Karya Tulis Ilmiah', level: 'Sekolah', date: '2024-08-05', announcementMonth: 'Agustus 2024', evidence: 'sertifikat_kti.pdf' },
    { id: 5, nis: '2023089', name: 'Rian Wijaya', class: 'XI MIPA 2', major: 'MIPA', achievementName: 'Medali Emas Kompetisi Sains', level: 'Nasional', date: '2024-07-12', announcementMonth: 'Juli 2024', evidence: 'sertifikat_sains.pdf' },
    { id: 6, nis: '2023120', name: 'Sinta Rahmawati', class: 'XI IPS 1', major: 'IPS', achievementName: 'Juara 1 Lomba Fotografi', level: 'Provinsi', date: '2024-06-28', announcementMonth: 'Juni 2024', evidence: 'sertifikat_foto.pdf' },
  ]

  const filteredData = achievements.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis.includes(searchQuery) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.achievementName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = filterLevel === '' || item.level === filterLevel
    return matchesSearch && matchesLevel
  })

  const stats = {
    totalAchievements: achievements.length,
    thisMonth: achievements.filter((a) => a.announcementMonth.includes('Desember 2024')).length,
    national: achievements.filter((a) => a.level === 'Nasional').length,
    achievementStudents: new Set(achievements.map((a) => a.nis)).size,
  }

  const handleOpenModal = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setOpenModal('detail')
  }
  const handleCloseModal = () => {
    setOpenModal(null)
    setSelectedAchievement(null)
  }
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Nasional':
        return 'bg-yellow-100 text-yellow-700'
      case 'Provinsi':
        return 'bg-blue-100 text-blue-700'
      case 'Kabupaten/Kota':
        return 'bg-purple-100 text-purple-700'
      case 'Sekolah':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section (mirip struktur Kehadiran) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Data Siswa Berprestasi</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalAchievements} Prestasi</p>
        </div>
        <button onClick={() => setOpenModal('create')} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus className="w-5 h-5" /> Tambah Prestasi
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Prestasi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAchievements}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bulan Ini</p>
              <p className="text-2xl font-bold text-orange-600">{stats.thisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tingkat Nasional</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.national}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Siswa Berprestasi</p>
              <p className="text-2xl font-bold text-green-600">{stats.achievementStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section (mirip struktur Kehadiran) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Cari siswa atau prestasi (nama, NIS, judul prestasi)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option value="">Filter Tingkat</option>
            <option value="Nasional">Nasional</option>
            <option value="Provinsi">Provinsi</option>
            <option value="Kabupaten/Kota">Kabupaten/Kota</option>
            <option value="Sekolah">Sekolah</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"><Download className="w-5 h-5" /> Export</button>
        </div>
      </div>

      {/* Data Table (sama fungsional) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prestasi</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tingkat</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bulan Pengumuman</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nis}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.achievementName}>{item.achievementName}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(item.level)}`}>{item.level}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.date).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.announcementMonth}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedAchievement(item); setOpenModal('edit') }} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal (dikelompokkan mirip Kehadiran) */}
      <div>
        {openModal === 'create' && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Tambah Prestasi Siswa</h2>
                    <p className="text-yellow-100 text-sm mt-1">Catat prestasi siswa terbaru</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                </div>
                <div className="p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleCloseModal() }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                      <input type="text" placeholder="Masukkan nama siswa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">NIS</label>
                        <input type="text" placeholder="Masukkan NIS" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                        <input type="text" placeholder="XII IPA 1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Judul Prestasi</label>
                      <input type="text" placeholder="Juara 1 Olimpiade Matematika" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Prestasi</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option value="">Pilih Tingkat</option>
                        <option value="Nasional">Nasional</option>
                        <option value="Provinsi">Provinsi</option>
                        <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                        <option value="Sekolah">Sekolah</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Prestasi</label>
                        <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bulan Pengumuman</label>
                        <input type="text" placeholder="Desember 2024" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                      <button type="submit" className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail & Edit Modal (digabung mirip Kehadiran) */}
      <div>
        {(openModal === 'detail' || openModal === 'edit') && selectedAchievement && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${openModal === 'detail' ? 'max-w-2xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>
                {openModal === 'detail' && selectedAchievement && (
                  <>
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold">Detail Prestasi</h2>
                        <p className="text-yellow-100 text-sm mt-1">{selectedAchievement.name}</p>
                      </div>
                      <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Siswa</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">NIS</label>
                            <p className="text-sm font-medium text-gray-900">{selectedAchievement.nis}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Nama</label>
                            <p className="text-sm font-medium text-gray-900">{selectedAchievement.name}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Kelas</label>
                            <p className="text-sm font-medium text-gray-900">{selectedAchievement.class}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Jurusan</label>
                            <p className="text-sm font-medium text-gray-900">{selectedAchievement.major}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Detail Prestasi</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Judul Prestasi</label>
                            <p className="text-sm font-medium text-gray-900">{selectedAchievement.achievementName}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Tingkat</label>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(selectedAchievement.level)}`}>{selectedAchievement.level}</span>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Tanggal Prestasi</label>
                              <p className="text-sm font-medium text-gray-900">{new Date(selectedAchievement.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Pengumuman</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900">{selectedAchievement.announcementMonth}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">File Bukti</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center"><span className="text-lg">📄</span></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedAchievement.evidence}</p>
                              <p className="text-xs text-gray-500">Sertifikat/Bukti Prestasi</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Tutup</button>
                        <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition">Download Bukti</button>
                      </div>
                    </div>
                  </>
                )}

                {openModal === 'edit' && selectedAchievement && (
                  <>
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold">Edit Data Prestasi</h2>
                        <p className="text-yellow-100 text-sm mt-1">Ubah data prestasi siswa</p>
                      </div>
                      <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                    </div>
                    <div className="p-6">
                      <form onSubmit={(e) => { e.preventDefault(); handleCloseModal() }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                          <input type="text" defaultValue={selectedAchievement.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">NIS</label>
                            <input type="text" defaultValue={selectedAchievement.nis} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                            <input type="text" defaultValue={selectedAchievement.class} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Judul Prestasi</label>
                          <input type="text" defaultValue={selectedAchievement.achievementName} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Prestasi</label>
                          <select defaultValue={selectedAchievement.level} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            <option value="Nasional">Nasional</option>
                            <option value="Provinsi">Provinsi</option>
                            <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                            <option value="Sekolah">Sekolah</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Prestasi</label>
                            <input type="date" defaultValue={selectedAchievement.date} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan Pengumuman</label>
                            <input type="text" defaultValue={selectedAchievement.announcementMonth} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                          <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                          <button type="submit" className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition">Update</button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SiswaBerprestiPage
