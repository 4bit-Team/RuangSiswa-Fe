'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar, Download, Plus, Eye, Edit, Trash2, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface AttendanceMonth {
  id: number
  kelas: string
  minggu: number
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alpa: number
  persentase: number
  inputDate: string
  siswaNotHadir?: Array<{ nama: string; status: 'sakit' | 'izin' | 'alpa' }>
  keterangan?: string
}

const KehadiranPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceMonth | null>(null)
  const [filterMonth, setFilterMonth] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const calendarRef = useRef<HTMLDivElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  // Get week number from date
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Get week range from week number
  const getWeekRange = (date: Date): string => {
    const curr = new Date(date)
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1)
    const firstDate = new Date(curr.setDate(first))
    const lastDate = new Date(firstDate)
    lastDate.setDate(lastDate.getDate() + 6)
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${firstDate.toLocaleDateString('id-ID', options)} - ${lastDate.toLocaleDateString('id-ID', options)}`
  }

  // Get days in month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Get first day of month
  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Handle month navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  // Sample data
  const attendanceData: AttendanceMonth[] = [
    {
      id: 1,
      kelas: 'X-SIJA-1',
      minggu: 1,
      totalSiswa: 32,
      hadir: 28,
      sakit: 2,
      izin: 1,
      alpa: 1,
      persentase: 87.5,
      inputDate: '2024-11-04',
      siswaNotHadir: [
        { nama: 'Budi Santoso', status: 'sakit' },
        { nama: 'Ahmad Rizki', status: 'sakit' }
      ],
      keterangan: 'Kehadiran normal, 2 siswa sakit (demam)',
    },
    {
      id: 2,
      kelas: 'X-SIJA-2',
      minggu: 2,
      totalSiswa: 30,
      hadir: 29,
      sakit: 0,
      izin: 1,
      alpa: 0,
      persentase: 96.7,
      inputDate: '2024-11-11',
      siswaNotHadir: [
        { nama: 'Siti Nurhaliza', status: 'izin' }
      ],
      keterangan: 'Sangat baik, hanya 1 siswa izin',
    },
    {
      id: 3,
      kelas: 'XI-SIJA-1',
      minggu: 3,
      totalSiswa: 28,
      hadir: 26,
      sakit: 1,
      izin: 0,
      alpa: 1,
      persentase: 92.9,
      inputDate: '2024-11-18',
      siswaNotHadir: [
        { nama: 'Rinto Harahap', status: 'sakit' },
        { nama: 'Doni Hermawan', status: 'alpa' }
      ],
      keterangan: '1 siswa sakit, 1 siswa alpa',
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

          {/* Week Picker Calendar */}
          <div className="relative" ref={calendarRef}>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all text-gray-700 hover:text-blue-600 font-medium"
            >
              <Calendar className="w-5 h-5" />
              <span className="hidden sm:inline">
                Minggu ke-{getWeekNumber(selectedDate)}
              </span>
            </button>

            {/* Week Calendar Dropdown */}
            {showCalendar && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4 w-80">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={previousMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h3 className="text-center font-semibold text-gray-900 text-lg">
                    {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 p-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days with Week Selection */}
                <div className="space-y-2 mb-4">
                  {Array.from({ length: Math.ceil((generateCalendarDays().length) / 7) }).map((_, weekIndex) => {
                    const weekDays = generateCalendarDays().slice(weekIndex * 7, (weekIndex + 1) * 7)
                    const firstDayOfWeek = weekDays.find(day => day !== null)
                    
                    if (!firstDayOfWeek) return null

                    const weekDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), firstDayOfWeek)
                    const isCurrentMonth = weekDate.getMonth() === currentMonth.getMonth()
                    
                    // Only show weeks that belong to current month
                    if (!isCurrentMonth) return null
                    
                    const isSelectedWeek = getWeekNumber(selectedDate) === getWeekNumber(weekDate)

                    return (
                      <button
                        key={weekIndex}
                        onClick={() => {
                          setSelectedDate(weekDate)
                          setShowCalendar(false)
                        }}
                        className={`
                          w-full p-3 rounded-lg transition-all border-2 text-left
                          ${isSelectedWeek
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                          }
                        `}
                      >
                        <div className="text-sm font-semibold">
                          Minggu ke-{getWeekNumber(weekDate)}
                        </div>
                        <div className={`text-xs mt-1 ${isSelectedWeek ? 'text-blue-100' : 'text-gray-600'}`}>
                          {getWeekRange(weekDate)}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Selected Week Info */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Minggu Terpilih:</strong>
                  </p>
                  <p className="text-sm font-semibold text-blue-600">
                    Minggu ke-{getWeekNumber(selectedDate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getWeekRange(selectedDate)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kelas</th>
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
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.kelas}</td>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                        <input type="text" placeholder="Masukkan kelas" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minggu ke-</label>
                        <input type="number" placeholder="Masukkan minggu" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Siswa</label>
                      <input type="number" placeholder="Masukkan total siswa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hadir</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sakit</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Izin</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alpa</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa yang Tidak Hadir</label>
                      <textarea placeholder="Masukkan nama siswa yang tidak hadir (dipisahkan dengan koma)" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                            <span className="text-sm text-gray-600">Kelas</span>
                            <span className="text-sm font-medium text-gray-900">{selectedAttendance.kelas}</span>
                          </div>
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

                      {/* Siswa Tidak Hadir Section */}
                      {selectedAttendance.siswaNotHadir && selectedAttendance.siswaNotHadir.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-4">Siswa Tidak Hadir</h3>
                          <div className="space-y-2">
                            {selectedAttendance.siswaNotHadir.map((siswa, index) => {
                              const statusColor = {
                                sakit: 'bg-orange-50 border-orange-200 text-orange-700',
                                izin: 'bg-blue-50 border-blue-200 text-blue-700',
                                alpa: 'bg-red-50 border-red-200 text-red-700'
                              }[siswa.status]
                              
                              const statusLabel = {
                                sakit: '🤒 Sakit',
                                izin: '📋 Izin',
                                alpa: '❌ Alpa'
                              }[siswa.status]

                              return (
                                <div key={index} className={`border rounded-lg p-3 flex items-center justify-between ${statusColor}`}>
                                  <span className="text-sm font-medium">{siswa.nama}</span>
                                  <span className="text-xs font-semibold px-2 py-1 bg-white bg-opacity-70 rounded">
                                    {statusLabel}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Keterangan Section */}
                      {selectedAttendance.keterangan && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-4">Keterangan</h3>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-900">{selectedAttendance.keterangan}</p>
                          </div>
                        </div>
                      )}

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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                            <input type="text" placeholder="Masukkan kelas" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Minggu ke-</label>
                            <input type="number" defaultValue={selectedAttendance.minggu} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total Siswa</label>
                          <input type="number" defaultValue={selectedAttendance.totalSiswa} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hadir</label>
                            <input type="number" defaultValue={selectedAttendance.hadir} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sakit</label>
                            <input type="number" defaultValue={selectedAttendance.sakit} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Izin</label>
                            <input type="number" defaultValue={selectedAttendance.izin} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alpa</label>
                            <input type="number" defaultValue={selectedAttendance.alpa} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa yang Tidak Hadir</label>
                          <textarea placeholder="Masukkan nama siswa yang tidak hadir (dipisahkan dengan koma)" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
