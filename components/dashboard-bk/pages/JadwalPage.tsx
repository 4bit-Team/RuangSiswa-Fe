'use client'

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Trash2, MoreVertical } from 'lucide-react';
import ReservasiModal from '@/components/dashboard-bk/modals/ReservasiModal';

interface ScheduleSession {
  id: string;
  time: string;
  student: string;
  class: string;
  topic: string;
  room: string;
  duration: string;
  status: 'Terjadwal' | 'Selesai';
  initial: string;
  bgColor: string;
}

interface RoomAvailability {
  name: string;
  timeRange: string;
  status: 'Terpakai' | 'Tersedia' | 'Selesai';
  statusColor: string;
}

const JadwalPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 17)); // November 17, 2025
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isReservasiModalOpen, setIsReservasiModalOpen] = useState(false);

  // Get month and year
  const monthYear = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  
  // Calendar days
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays: (number | null)[] = [];
  
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Schedule data for selected date
  const schedules: ScheduleSession[] = [
    {
      id: '1',
      time: '08:00',
      student: 'Ahmad Fauzi',
      class: 'XII IPA 1',
      topic: 'Konsultasi Karir',
      room: 'Ruang BK 1',
      duration: '08:00 - 09:00',
      status: 'Terjadwal',
      initial: 'A',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      id: '2',
      time: '09:30',
      student: 'Siti Nurhaliza',
      class: 'XI IPS 2',
      topic: 'Masalah Akademik',
      room: 'Ruang BK 1',
      duration: '09:30 - 10:30',
      status: 'Terjadwal',
      initial: 'S',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      id: '3',
      time: '11:00',
      student: 'Budi Santoso',
      class: 'X MIPA 3',
      topic: 'Adaptasi Sosial',
      room: 'Ruang BK 2',
      duration: '11:00 - 12:00',
      status: 'Terjadwal',
      initial: 'B',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    {
      id: '4',
      time: '13:00',
      student: 'Dewi Lestari',
      class: 'XII IPS 1',
      topic: 'Persiapan SNBT',
      room: 'Ruang BK 1',
      duration: '13:00 - 14:00',
      status: 'Selesai',
      initial: 'D',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      id: '5',
      time: '14:30',
      student: 'Rizky Pratama',
      class: 'XI IPA 2',
      topic: 'Motivasi Belajar',
      room: 'Ruang BK 1',
      duration: '14:30 - 15:30',
      status: 'Terjadwal',
      initial: 'R',
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    {
      id: '6',
      time: '16:00',
      student: 'Meeting Tim',
      class: '-',
      topic: 'Koordinasi Wali Kelas',
      room: 'Ruang Guru',
      duration: '16:00 - 17:00',
      status: 'Terjadwal',
      initial: 'M',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  // Room availability for today
  const rooms: RoomAvailability[] = [
    {
      name: 'Ruang BK 1',
      timeRange: '08:00 - 15:30',
      status: 'Terpakai',
      statusColor: 'bg-red-100 text-red-700'
    },
    {
      name: 'Ruang BK 2',
      timeRange: 'Setelah 12:00',
      status: 'Tersedia',
      statusColor: 'bg-green-100 text-green-700'
    },
    {
      name: 'Ruang BK 3',
      timeRange: 'Sepanjang hari',
      status: 'Tersedia',
      statusColor: 'bg-green-100 text-green-700'
    }
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number | null) => {
    if (day) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date(2025, 10, 17);
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const handleReservasiSubmit = (data: any) => {
    console.log('Data reservasi:', data);
    // Tambahkan jadwal baru ke list
    alert(`Reservasi berhasil! ${data.studentName} pada ${data.preferredDate} pukul ${data.preferredTime}`);
  };

  const handleAcceptSchedule = (scheduleId: string) => {
    alert(`Reservasi dari jadwal #${scheduleId} telah diterima!`);
    console.log('Accept schedule:', scheduleId);
  };

  const handleRejectSchedule = (scheduleId: string) => {
    alert(`Reservasi dari jadwal #${scheduleId} telah dibatalkan!`);
    console.log('Reject schedule:', scheduleId);
  };

  const handleEditSchedule = (scheduleId: string) => {
    alert(`Edit reservasi jadwal #${scheduleId}`);
    console.log('Edit schedule:', scheduleId);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      alert(`Jadwal #${scheduleId} telah dihapus!`);
      console.log('Delete schedule:', scheduleId);
    }
  };

  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jadwal Konseling</h1>
            <p className="text-gray-600 mt-1">Kelola jadwal konseling dan appointment</p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 flex items-center gap-2 font-semibold transition-colors" onClick={() => setIsReservasiModalOpen(true)}>
            <Plus size={20} />
            Buat Jadwal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule and Calendar Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{monthYear}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Selected date info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-center">
                <p className="text-sm text-gray-600">Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-3 mb-3">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-12 flex items-center justify-center rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      day === null
                        ? 'invisible'
                        : isToday(day)
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Jadwal Hari Ini - {currentDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Jam</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Siswa</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Kelas</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Topik</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Ruangan</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-700 text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Time with Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 ${schedule.bgColor} rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
                            {schedule.initial}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{schedule.time}</span>
                        </div>
                      </td>
                      
                      {/* Student Name */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-gray-900 text-sm">{schedule.student}</p>
                      </td>
                      
                      {/* Class */}
                      <td className="py-3 px-3">
                        <p className="text-gray-600 text-sm">{schedule.class}</p>
                      </td>
                      
                      {/* Topic */}
                      <td className="py-3 px-3">
                        <p className="text-gray-600 text-sm">{schedule.topic}</p>
                      </td>
                      
                      {/* Room */}
                      <td className="py-3 px-3">
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                          {schedule.room}
                        </span>
                      </td>
                      
                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
                          schedule.status === 'Selesai'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {schedule.status}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {schedule.status === 'Terjadwal' ? (
                            <>
                              <button
                                onClick={() => handleEditSchedule(schedule.id)}
                                className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors flex-shrink-0"
                                title="Edit Reservasi"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleAcceptSchedule(schedule.id)}
                                className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors flex-shrink-0"
                                title="Terima Reservasi"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleRejectSchedule(schedule.id)}
                                className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors flex-shrink-0"
                                title="Batalkan Reservasi"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex-shrink-0"
                                title="Hapus Reservasi"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex-shrink-0"
                              title="Hapus Jadwal"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Room Availability Section (Right Sidebar) */}
        <div className="lg:col-span-1">
          {/* Room Availability */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ketersediaan Ruangan</h3>
            <div className="space-y-3">
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRoom(room.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{room.name}</p>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${room.statusColor}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{room.timeRange}</p>
                </div>
              ))}
            </div>

            {/* Total Schedule Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Hari Ini</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Jadwal</span>
                  <span className="font-semibold text-gray-900">6 Sesi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selesai</span>
                  <span className="font-semibold text-green-600">1 Sesi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tersisa</span>
                  <span className="font-semibold text-blue-600">5 Sesi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservasiModal
        isOpen={isReservasiModalOpen}
        onClose={() => setIsReservasiModalOpen(false)}
        onSubmit={handleReservasiSubmit}
      />
    </div>
  );
};

export default JadwalPage;
