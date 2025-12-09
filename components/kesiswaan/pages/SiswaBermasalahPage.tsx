'use client'

import React, { useState } from 'react'
import { AlertTriangle, Download, Plus, Eye, Edit, Trash2, Search, Filter, X } from 'lucide-react'

interface ProblemStudent {
  id: number
  nis: string
  name: string
  class: string
  major: string
  category: 'Akademik' | 'Perilaku' | 'Kesehatan' | 'Sosial'
  problem: string
  letterWarning: number
  status: 'Dalam Pengawasan' | 'Butuh Bimbingan' | 'Mendapat SP'
  lastUpdate: string
  notes: string
}

const SiswaBermasalahPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<ProblemStudent | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  // Sample data
  const problemStudents: ProblemStudent[] = [
    {
      id: 1,
      nis: '2023001',
      name: 'Ahmad Fauzi',
      class: 'XII IPA 1',
      major: 'IPA',
      category: 'Perilaku',
      problem: 'Sering berkelahi dengan teman sejawat',
      letterWarning: 2,
      status: 'Mendapat SP',
      lastUpdate: '2024-12-01',
      notes: 'Sudah diberikan pengarahan dan dibina oleh BK',
    },
    {
      id: 2,
      nis: '2023045',
      name: 'Budi Santoso',
      class: 'X MIPA 3',
      major: 'MIPA',
      category: 'Akademik',
      problem: 'Nilai akademik menurun signifikan',
      letterWarning: 0,
      status: 'Butuh Bimbingan',
      lastUpdate: '2024-11-28',
      notes: 'Diarahkan mengikuti program remediasi',
    },
    {
      id: 3,
      nis: '2023102',
      name: 'Dewi Lestari',
      class: 'XII IPS 1',
      major: 'IPS',
      category: 'Kesehatan',
      problem: 'Gangguan kesehatan mental (depresi ringan)',
      letterWarning: 0,
      status: 'Dalam Pengawasan',
      lastUpdate: '2024-11-25',
      notes: 'Dirujuk ke psikolog sekolah untuk konsultasi',
    },
    {
      id: 4,
      nis: '2023067',
      name: 'Maya Putri',
      class: 'X IPS 2',
      major: 'IPS',
      category: 'Sosial',
      problem: 'Pergaulan dengan kelompok yang kurang sehat',
      letterWarning: 1,
      status: 'Dalam Pengawasan',
      lastUpdate: '2024-11-30',
      notes: 'Dimonitor ketat dan didampingi BK',
    },
    {
      id: 5,
      nis: '2023089',
      name: 'Rian Wijaya',
      class: 'XI MIPA 2',
      major: 'MIPA',
      category: 'Perilaku',
      problem: 'Sering merokok di lingkungan sekolah',
      letterWarning: 1,
      status: 'Mendapat SP',
      lastUpdate: '2024-12-01',
      notes: 'Orang tua telah dilibatkan dalam pembinaan',
    },
  ]

  const filteredData = problemStudents.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis.includes(searchQuery) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === '' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalProblems: problemStudents.length,
    monitoring: problemStudents.filter((s) => s.status === 'Dalam Pengawasan').length,
    needGuidance: problemStudents.filter((s) => s.status === 'Butuh Bimbingan').length,
    receiveLetter: problemStudents.filter((s) => s.status === 'Mendapat SP').length,
  }

  const handleOpenModal = (student: ProblemStudent) => {
    setSelectedStudent(student)
    setOpenModal('detail')
  }

  const handleCloseModal = () => {
    setOpenModal(null)
    setSelectedStudent(null)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Akademik':
        return 'bg-blue-100 text-blue-700'
      case 'Perilaku':
        return 'bg-red-100 text-red-700'
      case 'Kesehatan':
        return 'bg-yellow-100 text-yellow-700'
      case 'Sosial':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dalam Pengawasan':
        return 'bg-blue-100 text-blue-700'
      case 'Butuh Bimbingan':
        return 'bg-orange-100 text-orange-700'
      case 'Mendapat SP':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Data Siswa Bermasalah</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProblems} Siswa</p>
        </div>
        <button
          onClick={() => setOpenModal('create')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus className="w-5 h-5" />
          Tambah Siswa Bermasalah
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProblems}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Dalam Pengawasan</p>
              <p className="text-2xl font-bold text-blue-600">{stats.monitoring}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Butuh Bimbingan</p>
              <p className="text-2xl font-bold text-orange-600">{stats.needGuidance}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mendapat SP</p>
              <p className="text-2xl font-bold text-red-600">{stats.receiveLetter}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari siswa (nama, NIS, atau kelas)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Filter Status</option>
            <option value="Dalam Pengawasan">Dalam Pengawasan</option>
            <option value="Butuh Bimbingan">Butuh Bimbingan</option>
            <option value="Mendapat SP">Mendapat SP</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Masalah</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">SP</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nis}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.class}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.problem}>
                    {item.problem}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {item.letterWarning > 0 ? `SP-${item.letterWarning}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudent(item)
                          setOpenModal('edit')
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Modal: Create */}
      <div>
        {openModal === 'create' && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Tambah Siswa Bermasalah</h2>
                    <p className="text-red-100 text-sm mt-1">Catat siswa bermasalah baru</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6">
                  <form onSubmit={(e) => { e.preventDefault(); console.log('create student'); handleCloseModal(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                      <input name="name" type="text" placeholder="Masukkan nama siswa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NIS</label>
                      <input name="nis" type="text" placeholder="Masukkan NIS" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                        <input name="class" type="text" placeholder="Masukkan kelas" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                        <input name="major" type="text" placeholder="Masukkan jurusan" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <select name="category" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option>Akademik</option>
                        <option>Perilaku</option>
                        <option>Kesehatan</option>
                        <option>Sosial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Masalah</label>
                      <textarea name="problem" placeholder="Deskripsi masalah" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                      <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Problem Modal: Detail / Edit */}
      <div>
        {(openModal === 'detail' || openModal === 'edit') && selectedStudent && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${openModal === 'detail' ? 'max-w-2xl' : 'max-w-lg'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header shared structure */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {openModal === 'detail' ? 'Detail Siswa Bermasalah' : 'Edit Siswa Bermasalah'}
                    </h2>
                    <p className="text-red-100 text-sm mt-1">
                      {openModal === 'detail' ? `NIS: ${selectedStudent.nis}` : 'Ubah data siswa'}
                    </p>
                  </div>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {/* Detail view */}
                {openModal === 'detail' && (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Informasi Siswa</h3>
                      <p className="text-sm text-gray-600">Nama: <span className="font-medium text-gray-900">{selectedStudent.name}</span></p>
                      <p className="text-sm text-gray-600">Kelas: <span className="font-medium text-gray-900">{selectedStudent.class}</span></p>
                      <p className="text-sm text-gray-600">Jurusan: <span className="font-medium text-gray-900">{selectedStudent.major}</span></p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Detail Masalah</h3>
                      <p className="text-sm text-gray-600">Kategori: <span className="font-medium">{selectedStudent.category}</span></p>
                      <p className="text-sm text-gray-600 mt-2">Masalah: <span className="font-medium">{selectedStudent.problem}</span></p>
                      <p className="text-sm text-gray-600 mt-2">Catatan: <span className="font-medium">{selectedStudent.notes}</span></p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Status & Riwayat</h3>
                      <p className="text-sm text-gray-600">Status: <span className="font-medium">{selectedStudent.status}</span></p>
                      <p className="text-sm text-gray-600">SP: <span className="font-medium">{selectedStudent.letterWarning > 0 ? `SP-${selectedStudent.letterWarning}` : '-'}</span></p>
                      <p className="text-sm text-gray-600">Terakhir diupdate: <span className="font-medium">{selectedStudent.lastUpdate}</span></p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button onClick={() => { setSelectedStudent(selectedStudent); setOpenModal('edit'); }} className="px-6 py-2 bg-gray-100 rounded-lg">Edit</button>
                      <button onClick={handleCloseModal} className="px-6 py-2 bg-red-500 text-white rounded-lg">Tutup</button>
                    </div>
                  </div>
                )}

                {/* Edit form */}
                {openModal === 'edit' && (
                  <div className="p-6">
                    <form onSubmit={(e) => { e.preventDefault(); console.log('update student'); handleCloseModal(); }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                        <input name="name" defaultValue={selectedStudent.name} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">NIS</label>
                        <input name="nis" defaultValue={selectedStudent.nis} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                          <input name="class" defaultValue={selectedStudent.class} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                          <input name="major" defaultValue={selectedStudent.major} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                        <select name="category" defaultValue={selectedStudent.category} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                          <option>Akademik</option>
                          <option>Perilaku</option>
                          <option>Kesehatan</option>
                          <option>Sosial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Masalah</label>
                        <textarea name="problem" defaultValue={selectedStudent.problem} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                        <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition">Simpan</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SiswaBermasalahPage
