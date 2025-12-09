'use client'

import React, { useState } from 'react';
import { Calendar, Users, FileText, Bell, BarChart3, Clock, MapPin, User, Plus, CheckCircle, X, Eye, Trophy, AlertTriangle } from 'lucide-react';

// Prop types
interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  description?: string;
  color?: string;
}

interface QuickActionButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  color?: string;
}

interface ScheduleItemProps {
  time: string;
  student: string;
  'class': string;
  topic: string;
  room: string;
  duration: string;
  status: string;
  initial: string;
  bgColor?: string;
}

interface PriorityStudentCardProps {
  name: string;
  'class': string;
  issue: string;
  priority: string;
  initial: string;
  bgColor?: string;
}

// Stats Card Component
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, description, color }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-600 mb-2">{label}</p>
    <p className="text-xs text-green-600">{description}</p>
  </div>
);

// Quick Action Button
interface QuickActionButtonExtendedProps extends QuickActionButtonProps {
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonExtendedProps> = ({ icon: Icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} hover:opacity-90 text-white rounded-xl p-6 flex items-center justify-center space-x-3 transition-colors w-full`}>
    <Icon size={24} />
    <span className="font-semibold">{label}</span>
  </button>
);

// Schedule Item
const ScheduleItem: React.FC<ScheduleItemProps> = ({ time, student, class: studentClass, topic, room, duration, status, initial, bgColor }) => (
  <div className={`flex items-center space-x-4 p-4 ${status === 'Selesai' ? 'bg-gray-50' : 'bg-blue-50 border-2 border-blue-200'} rounded-lg`}>
    <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initial}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-gray-900">{student} • <span className="text-sm font-normal text-gray-600">{studentClass}</span></p>
        <span className={`text-xs px-3 py-1 ${status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} rounded-full font-medium`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{topic}</p>
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center"><Clock size={14} className="mr-1" /> {duration}</span>
        <span className="flex items-center"><MapPin size={14} className="mr-1" /> {room}</span>
      </div>
    </div>
  </div>
);

// Priority Student Card
const PriorityStudentCard: React.FC<PriorityStudentCardProps> = ({ name, class: studentClass, issue, priority, initial, bgColor }) => (
  <div className={`flex items-start space-x-3 p-3 ${priority === 'Tinggi' ? 'bg-red-50' : 'bg-orange-50'} rounded-lg`}>
    <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
      <span className="text-sm font-semibold text-white">{initial}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <span className={`text-xs px-2 py-0.5 ${priority === 'Tinggi' ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'} rounded-full`}>
          {priority}
        </span>
      </div>
      <p className="text-xs text-gray-600">{studentClass}</p>
      <p className="text-xs text-gray-500 mt-1">{issue}</p>
    </div>
  </div>
);

const DashboardKesiswaaPage: React.FC = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const schedules = [
    { time: '08:00', student: 'Ahmad Fauzi', class: 'XII IPA 1', topic: 'Konsultasi Karir', room: 'Ruang Kesiswaan 1', duration: '08:00 - 09:00', status: 'Selesai', initial: 'A', bgColor: 'bg-indigo-600' },
    { time: '09:30', student: 'Siti Nurhaliza', class: 'XI IPS 2', topic: 'Masalah Akademik', room: 'Ruang Kesiswaan 1', duration: '09:30 - 10:30', status: 'Selesai', initial: 'S', bgColor: 'bg-purple-600' },
    { time: '11:00', student: 'Budi Santoso', class: 'X MIPA 3', topic: 'Adaptasi Sosial', room: 'Ruang Kesiswaan 2', duration: '11:00 - 12:00', status: 'Terjadwal', initial: 'B', bgColor: 'bg-blue-600' },
  ];

  const priorityStudents = [
    { name: 'Andi Wijaya', class: 'XI IPA 1', issue: 'Penurunan nilai signifikan', priority: 'Tinggi', initial: 'A', bgColor: 'bg-red-200' },
    { name: 'Maya Putri', class: 'X IPS 2', issue: 'Absensi tinggi (7 hari)', priority: 'Tinggi', initial: 'M', bgColor: 'bg-red-200' },
    { name: 'Fajar Rahman', class: 'XII IPA 2', issue: 'Laporan perilaku dari guru', priority: 'Sedang', initial: 'F', bgColor: 'bg-orange-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang di Portal Kesiswaan! 👋</h2>
        <p className="text-indigo-100">Kelola data siswa dan kegiatan dengan mudah dan efisien</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Siswa" 
          value="342" 
          description="+2.3%"
          color="bg-purple-600"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Kehadiran Hari Ini" 
          value="92%" 
          description="+1.2%"
          color="bg-green-600"
        />
        <StatCard 
          icon={Clock} 
          label="Terlambat Hari Ini" 
          value="23" 
          description="+5"
          color="bg-red-600"
        />
        <StatCard 
          icon={Bell} 
          label="Perlu Perhatian" 
          value="15" 
          description="-2"
          color="bg-orange-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <QuickActionButton 
          icon={AlertTriangle} 
          label="Tambah Siswa Bermasalah" 
          color="bg-red-600"
          onClick={() => setOpenModal('problemstudent')}
        />
        <QuickActionButton 
          icon={Trophy} 
          label="Input Prestasi Siswa" 
          color="bg-yellow-500"
          onClick={() => setOpenModal('achievement')}
        />
      </div>

      {/* Modal: Input Prestasi Siswa */}
      <div>
        {openModal === 'achievement' && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setOpenModal(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Input Prestasi Siswa</h2>
                    <p className="text-yellow-100 text-sm mt-1">Tambahkan prestasi siswa baru</p>
                  </div>
                  <button
                    onClick={() => setOpenModal(null)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('Achievement added');
                      setOpenModal(null);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NIS
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan NIS"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Siswa
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan nama siswa"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kelas
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan kelas"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jurusan
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan jurusan"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Prestasi
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan judul prestasi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tingkat Prestasi
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option value="">Pilih Tingkat</option>
                        <option value="nasional">Nasional</option>
                        <option value="provinsi">Provinsi</option>
                        <option value="kabupaten">Kabupaten/Kota</option>
                        <option value="sekolah">Sekolah</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Prestasi
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bulan Pengumuman
                        </label>
                        <input
                          type="month"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Sertifikat
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setOpenModal(null)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
                      >
                        Simpan Prestasi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Tambah Siswa Bermasalah */}
      <div>
        {openModal === 'problemstudent' && (
          <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setOpenModal(null)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Tambah Siswa Bermasalah</h2>
            <p className="text-red-100 text-sm mt-1">Daftarkan siswa yang memerlukan pengawasan</p>
          </div>
          <button
            onClick={() => setOpenModal(null)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
            </div>

            <div className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Problem student added');
              setOpenModal(null);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIS
            </label>
            <input
              type="text"
              placeholder="Masukkan NIS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
              </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Siswa
            </label>
            <input
              type="text"
              placeholder="Masukkan nama siswa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas
            </label>
            <input
              type="text"
              placeholder="Masukkan kelas"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
              </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jurusan
            </label>
            <input
              type="text"
              placeholder="Masukkan jurusan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Masalah
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="">Pilih Kategori</option>
            <option value="akademik">Akademik</option>
            <option value="perilaku">Perilaku</option>
            <option value="kesehatan">Kesehatan</option>
            <option value="sosial">Sosial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Masalah
              </label>
              <textarea
            placeholder="Jelaskan masalah yang dihadapi..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Pilih Status</option>
              <option value="dalam-pengawasan">Dalam Pengawasan</option>
              <option value="butuh-bimbingan">Butuh Bimbingan</option>
              <option value="mendapat-sp">Mendapat SP</option>
            </select>
              </div>
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah SP
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
            type="button"
            onClick={() => setOpenModal(null)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
              >
            Batal
              </button>
              <button
            type="submit"
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
            Tambah Siswa
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Attendance Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Konsultasi (6 Bulan Terakhir)</h3>
          <div className="space-y-4">
            {[
              { label: 'Absensi', value: 25, color: 'bg-purple-500' },
              { label: 'Kehadiran', value: 60, color: 'bg-pink-500' },
              { label: 'Pelanggaran', value: 35, color: 'bg-orange-500' },
              { label: 'Terlambat', value: 30, color: 'bg-teal-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Students & Achievements */}
        <div className="space-y-6">
          {/* Siswa Perlu Perhatian */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Siswa Perlu Perhatian</h3>
            <div className="space-y-3">
              {priorityStudents.slice(0, 2).map((student, idx) => (
                <PriorityStudentCard key={idx} {...student} />
              ))}
            </div>
          </div>

          {/* Prestasi Terbaru */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestasi Terbaru</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-gray-900">Fitri Rahmawati</p>
                <p className="text-xs text-gray-600">XII IPA 1</p>
                <p className="text-xs text-gray-500 mt-1">Juara 1 Olimpiade Matematika Nasional</p>
                <p className="text-xs text-gray-400 mt-1">2 hari lalu</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-gray-900">Dimas Pratama</p>
                <p className="text-xs text-gray-600">XI IPS 2</p>
                <p className="text-xs text-gray-500 mt-1">Juara 2 Lomba Debat Bahasa Inggris</p>
                <p className="text-xs text-gray-400 mt-1">3 hari lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jadwal Kegiatan */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Ringkasan Kehadiran & Keterlambatan</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Lihat Semua</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kehadiran Summary */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Ringkasan Kehadiran</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Hadir</p>
                  <p className="text-xs text-gray-600">315 siswa</p>
                </div>
                <p className="text-lg font-bold text-green-600">92.1%</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Sakit</p>
                  <p className="text-xs text-gray-600">15 siswa</p>
                </div>
                <p className="text-lg font-bold text-yellow-600">4.4%</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Izin</p>
                  <p className="text-xs text-gray-600">12 siswa</p>
                </div>
                <p className="text-lg font-bold text-blue-600">3.5%</p>
              </div>
            </div>
          </div>

          {/* Keterlambatan Summary */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Ringkasan Keterlambatan</h4>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-semibold text-gray-900">Mendekati Batas SP</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Ahmad Rizki</span>
                    <span className="text-xs font-semibold text-red-600">4/5x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Siti Nurhaliza</span>
                    <span className="text-xs font-semibold text-red-600">4/5x</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-gray-900">Total Terlambat Hari Ini</p>
                <p className="text-2xl font-bold text-red-600 mt-1">23 siswa</p>
                <p className="text-xs text-red-600">+5 dari kemarin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Buat Acara Baru */}
      <div>
        {openModal === 'appointment' && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setOpenModal(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Buat Acara Baru</h2>
                    <p className="text-blue-100 text-sm mt-1">Buat acara atau kegiatan baru untuk siswa</p>
                  </div>
                  <button
                    onClick={() => setOpenModal(null)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('Event created');
                      setOpenModal(null);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Acara
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan nama acara"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jam
                        </label>
                        <input
                          type="time"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Pilih Kategori</option>
                        <option value="acara-umum">Acara Umum</option>
                        <option value="kepramukaan">Kepramukaan</option>
                        <option value="olahraga">Olahraga</option>
                        <option value="seni">Seni & Budaya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokasi
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan lokasi acara"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        placeholder="Masukkan deskripsi acara..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setOpenModal(null)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                      >
                        Buat Acara
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Tambah Siswa */}
      <div>
        {openModal === 'student' && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setOpenModal(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Kelola Data Siswa</h2>
                    <p className="text-blue-100 text-sm mt-1">Tambah atau ubah informasi siswa</p>
                  </div>
                  <button
                    onClick={() => setOpenModal(null)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('Student added');
                      setOpenModal(null);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Siswa
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan nama siswa"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NISN
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan NISN siswa"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kelas
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Pilih Kelas</option>
                          <option value="10-a">10-A</option>
                          <option value="10-b">10-B</option>
                          <option value="11-a">11-A</option>
                          <option value="12-a">12-A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jurusan
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Pilih Jurusan</option>
                          <option value="ipa">IPA</option>
                          <option value="ips">IPS</option>
                          <option value="bahasa">Bahasa</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Telepon
                      </label>
                      <input
                        type="tel"
                        placeholder="Masukkan no. telepon"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                      </label>
                      <textarea
                        placeholder="Masukkan alamat siswa..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setOpenModal(null)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                      >
                        Simpan Data
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Buat Laporan */}
      <div>
        {openModal === 'report' && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setOpenModal(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Buat Laporan</h2>
                    <p className="text-blue-100 text-sm mt-1">Buat laporan kegiatan dan siswa</p>
                  </div>
                  <button
                    onClick={() => setOpenModal(null)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('Report created');
                      setOpenModal(null);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Laporan
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan judul laporan"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Laporan
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Pilih Jenis Laporan</option>
                        <option value="kegiatan">Kegiatan</option>
                        <option value="prestasi">Prestasi Siswa</option>
                        <option value="insiden">Insiden</option>
                        <option value="evaluasi">Evaluasi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Siswa/Grup
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan nama siswa atau grup"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Pilih Kategori</option>
                        <option value="acara">Acara</option>
                        <option value="akademik">Akademik</option>
                        <option value="perilaku">Perilaku</option>
                        <option value="prestasi">Prestasi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        placeholder="Masukkan deskripsi laporan..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Pilih Status</option>
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setOpenModal(null)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                      >
                        Simpan Laporan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal: Lihat Jadwal */}
      <div>
        {openModal === 'schedule' && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center space-x-2">
                    <Eye size={28} />
                    <span>Jadwal Lengkap</span>
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Lihat semua jadwal kegiatan</p>
                </div>
                <button
                  onClick={() => setOpenModal(null)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  {schedules.map((schedule, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{schedule.student} ({schedule.class})</p>
                          <p className="text-sm text-gray-600">{schedule.duration}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 ${schedule.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} rounded-full font-medium`}>
                          {schedule.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{schedule.topic}</p>
                      <p className="text-xs text-gray-500">{schedule.room}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardKesiswaaPage;
