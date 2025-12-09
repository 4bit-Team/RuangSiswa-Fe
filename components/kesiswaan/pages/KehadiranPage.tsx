'use client'

import React, { useState } from 'react'
import { Calendar, Download, Plus, Eye, Edit, Trash2, Search, Filter, X } from 'lucide-react'

interface AttendanceMonth {
  id: number
  minggu: number
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpa: number
  persentase: number
  inputDate: string
}

const KehadiranPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceMonth | null>(null)
  const [filterMonth, setFilterMonth] = useState('')

  // Sample data
  const attendanceData: AttendanceMonth[] = [
    {
      id: 1,
      minggu: 1,
      totalSiswa: 32,
      hadir: 28,
      sakit: 2,
      izin: 1,
      alpa: 1,
      persentase: 87.5,
      inputDate: '2024-11-04',
    },
    {
      id: 2,
      minggu: 2,
      totalSiswa: 30,
      hadir: 29,
      sakit: 0,
      izin: 1,
      alpa: 0,
      persentase: 96.7,
      inputDate: '2024-11-11',
    },
    {
      id: 3,
      minggu: 3,
      totalSiswa: 28,
      hadir: 26,
      sakit: 1,
      izin: 0,
      alpa: 1,
      persentase: 92.9,
      inputDate: '2024-11-18',
    },
  ]

  const filteredData = attendanceData.filter((item) =>
    item.minggu.toString().includes(searchQuery.toLowerCase())
  )

  const handleOpenModal = (attendance: AttendanceMonth) => {
    setSelectedAttendance(attendance)
    setOpenModal('detail')
  }

  const handleCloseModal = () => {
    setOpenModal(null)
    setSelectedAttendance(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Total Data</h3>
          <p className="text-3xl font-bold text-gray-900">{attendanceData.length} Kelas</p>
        </div>
        <button 
          onClick={() => setOpenModal('create')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus className="w-5 h-5" />
          Input Kehadiran
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Kelas</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kehadiran Minggu Ini</p>
              <p className="text-2xl font-bold text-green-600">95.2%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Siswa Sakit</p>
              <p className="text-2xl font-bold text-orange-600">15</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🤒</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Alpa</p>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">❌</span>
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
              placeholder="Cari kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Filter Bulan</option>
            <option value="november">November 2024</option>
            <option value="december">December 2024</option>
            <option value="januari">Januari 2025</option>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Minggu</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Siswa</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hadir</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sakit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Izin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alpa</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Persentase</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal Input</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Minggu {item.minggu}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.totalSiswa}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                      {item.hadir}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm">
                      {item.sakit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                      {item.izin}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-lg font-semibold text-sm">
                      {item.alpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.persentase}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.inputDate}</td>
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
                          setSelectedAttendance(item)
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

      {/* Attendance Modal: Create */}
      <div>
        {openModal === 'create' && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Input Kehadiran Baru</h2>
                    <p className="text-blue-100 text-sm mt-1">Masukkan data kehadiran kelas</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minggu ke-</label>
                      <input type="number" placeholder="Masukkan minggu" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Siswa</label>
                      <input type="number" placeholder="Masukkan total siswa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                      <button type="submit" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Attendance Modal: Detail / Edit */}
      <div>
        {(openModal === 'detail' || openModal === 'edit') && selectedAttendance && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCloseModal} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${openModal === 'detail' ? 'max-w-2xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>
                {openModal === 'detail' && selectedAttendance && (
                  <>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold">Detail Kehadiran</h2>
                        <p className="text-blue-100 text-sm mt-1">Minggu {selectedAttendance.minggu}</p>
                      </div>
                      <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Attendance Summary */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Ringkasan Kehadiran</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Total Siswa</p>
                            <p className="text-2xl font-bold text-blue-600">{selectedAttendance.totalSiswa}</p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Hadir</p>
                            <p className="text-2xl font-bold text-green-600">{selectedAttendance.hadir}</p>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Sakit</p>
                            <p className="text-2xl font-bold text-orange-600">{selectedAttendance.sakit}</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Izin</p>
                            <p className="text-2xl font-bold text-purple-600">{selectedAttendance.izin}</p>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Alpa</p>
                            <p className="text-2xl font-bold text-red-600">{selectedAttendance.alpa}</p>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-1">Persentase</p>
                            <p className="text-2xl font-bold text-yellow-600">{selectedAttendance.persentase.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Details */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Detail Data</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Minggu ke-</span>
                            <span className="text-sm font-medium text-gray-900">{selectedAttendance.minggu}</span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Tanggal Input</span>
                            <span className="text-sm font-medium text-gray-900">{new Date(selectedAttendance.inputDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Tutup</button>
                        <button onClick={() => setOpenModal('edit')} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">Edit Data</button>
                      </div>
                    </div>
                  </>
                )}

                {openModal === 'edit' && selectedAttendance && (
                  <>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold">Edit Kehadiran</h2>
                        <p className="text-blue-100 text-sm mt-1">Ubah data kehadiran kelas</p>
                      </div>
                      <button onClick={handleCloseModal} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"><X size={24} /></button>
                    </div>

                    <div className="p-6">
                      <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Minggu ke-</label>
                          <input type="number" defaultValue={selectedAttendance.minggu} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                          <button type="button" onClick={handleCloseModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition">Batal</button>
                          <button type="submit" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition">Update</button>
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

export default KehadiranPage
