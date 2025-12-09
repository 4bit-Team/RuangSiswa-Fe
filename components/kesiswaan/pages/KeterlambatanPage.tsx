'use client'

import React, { useState } from 'react'
import { Clock, Download, Plus, Eye, Edit, Trash2, Search, Filter, X } from 'lucide-react'

interface TardinessRecord {
  id: number
  nis: string
  name: string
  class: string
  major: string
  date: string
  time: string
  minutesLate: number
  reason: string
  frequency: number
  status: 'Tercatat' | 'Termaafkan'
}

const KeterlambatanPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [selectedTardiness, setSelectedTardiness] = useState<TardinessRecord | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  // Sample data
  const tardinessData: TardinessRecord[] = [
    {
      id: 1,
      nis: '2023001',
      name: 'Ahmad Fauzi',
      class: 'XII IPA 1',
      major: 'IPA',
      date: '2024-12-01',
      time: '07:45',
      minutesLate: 5,
      reason: 'Terjebak macet',
      frequency: 3,
      status: 'Tercatat',
    },
    {
      id: 2,
      nis: '2023045',
      name: 'Budi Santoso',
      class: 'X MIPA 3',
      major: 'MIPA',
      date: '2024-12-01',
      time: '07:30',
      minutesLate: 10,
      reason: 'Bangun kesiangan',
      frequency: 5,
      status: 'Tercatat',
    },
    {
      id: 3,
      nis: '2023102',
      name: 'Dewi Lestari',
      class: 'XII IPS 1',
      major: 'IPS',
      date: '2024-12-01',
      time: '07:20',
      minutesLate: 2,
      reason: 'Motor mogok',
      frequency: 2,
      status: 'Termaafkan',
    },
    {
      id: 4,
      nis: '2023067',
      name: 'Maya Putri',
      class: 'X IPS 2',
      major: 'IPS',
      date: '2024-12-01',
      time: '07:35',
      minutesLate: 7,
      reason: 'Antar adik ke sekolah',
      frequency: 7,
      status: 'Tercatat',
    },
  ]

  const filteredData = tardinessData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis.includes(searchQuery) ||
      item.class.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === '' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    tardiToday: filteredData.length,
    totalMonth: 42,
    moreThan5x: 12,
    avgMinutes: 8.4,
  }

  const handleOpenModal = (tardiness: TardinessRecord) => {
    setSelectedTardiness(tardiness)
    setOpenModal('detail')
  }

  const handleCloseModal = () => {
    setOpenModal(null)
    setSelectedTardiness(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Data Keterlambatan</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.tardiToday} Siswa</p>
        </div>
        <button 
          onClick={() => setOpenModal('create')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus className="w-5 h-5" />
          Input Keterlambatan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Terlambat Hari Ini</p>
              <p className="text-2xl font-bold text-orange-600">{stats.tardiToday}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Minggu Ini</p>
              <p className="text-2xl font-bold text-blue-600">42</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sering Terlambat ({'>'}5x)</p>
              <p className="text-2xl font-bold text-red-600">12</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rata-rata per Hari</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgMinutes}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Filter Tanggal</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jurusan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Waktu Datang</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alasan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Frekuensi</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nis}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.major}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.time}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${
                        item.frequency > 5 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {item.frequency}x
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
                          setSelectedTardiness(item)
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

      {/* Tardiness Modal: Create */}
      <div>
        {openModal === 'create' && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Input Keterlambatan</h2>
                    <p className="text-orange-100 text-sm mt-1">Tambah data keterlambatan siswa</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                      <input type="text" placeholder="Masukkan nama siswa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NIS</label>
                      <input type="text" placeholder="Masukkan NIS" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                        <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Waktu</label>
                        <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                      <button type="submit" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tardiness Modal: Detail / Edit */}
      <div>
        {(openModal === 'detail' || openModal === 'edit') && selectedTardiness && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${openModal === 'detail' ? 'max-w-2xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>
                {openModal === 'detail' && selectedTardiness && (
                  <>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold">Detail Keterlambatan</h2>
                        <p className="text-orange-100 text-sm mt-1">{selectedTardiness.name}</p>
                      </div>
                      <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                        <X size={24} />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Student Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Siswa</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">NIS</label>
                            <p className="text-sm font-medium text-gray-900">{selectedTardiness.nis}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Nama</label>
                            <p className="text-sm font-medium text-gray-900">{selectedTardiness.name}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Kelas</label>
                            <p className="text-sm font-medium text-gray-900">{selectedTardiness.class}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Jurusan</label>
                            <p className="text-sm font-medium text-gray-900">{selectedTardiness.major}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tardiness Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Detail Keterlambatan</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Tanggal</label>
                            <p className="text-sm font-medium text-gray-900">{new Date(selectedTardiness.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Waktu Datang</label>
                            <p className="text-sm font-medium text-gray-900">{selectedTardiness.time}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Menit Terlambat</label>
                            <p className="text-sm font-medium text-orange-600 font-bold">{selectedTardiness.minutesLate} menit</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Frekuensi</label>
                            <p className="text-sm font-medium text-gray-900">{selectedTardiness.frequency}x</p>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Alasan</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{selectedTardiness.reason}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Status</h3>
                        <div className="flex gap-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${selectedTardiness.status === 'Tercatat' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{selectedTardiness.status}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Tutup</button>
                        <button onClick={() => setOpenModal('edit')} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition">Ubah Status</button>
                      </div>
                    </div>
                  </>
                )}

                {openModal === 'edit' && selectedTardiness && (
                  <>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold">Edit Keterlambatan</h2>
                        <p className="text-orange-100 text-sm mt-1">Ubah data keterlambatan siswa</p>
                      </div>
                      <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                    </div>

                    <div className="p-6">
                      <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                          <input type="text" defaultValue={selectedTardiness.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">NIS</label>
                          <input type="text" defaultValue={selectedTardiness.nis} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                          <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                          <button type="submit" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition">Update</button>
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

export default KeterlambatanPage
