'use client'

import React, { useState } from 'react';
import { Calendar, Users, FileText, Bell, BarChart3, Clock, MapPin, User, Plus } from 'lucide-react';
import Modal from '../modals/Modal';

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

const DashboardBKPage: React.FC = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const schedules = [
    { time: '08:00', student: 'Ahmad Fauzi', class: 'XII IPA 1', topic: 'Konsultasi Karir', room: 'Ruang BK 1', duration: '08:00 - 09:00', status: 'Selesai', initial: 'A', bgColor: 'bg-indigo-600' },
    { time: '09:30', student: 'Siti Nurhaliza', class: 'XI IPS 2', topic: 'Masalah Akademik', room: 'Ruang BK 1', duration: '09:30 - 10:30', status: 'Selesai', initial: 'S', bgColor: 'bg-purple-600' },
    { time: '11:00', student: 'Budi Santoso', class: 'X MIPA 3', topic: 'Adaptasi Sosial', room: 'Ruang BK 2', duration: '11:00 - 12:00', status: 'Terjadwal', initial: 'B', bgColor: 'bg-blue-600' },
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
        <h2 className="text-2xl font-bold mb-2">Selamat Datang di Portal BK! 👋</h2>
        <p className="text-indigo-100">Kelola konseling siswa dengan mudah dan efisien</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Siswa" 
          value="342" 
          description="+12 dari bulan lalu"
          color="bg-red-600"
        />
        <StatCard 
          icon={Calendar} 
          label="Konsultasi Hari Ini" 
          value="8" 
          description="3 selesai, 5 terjadwal"
          color="bg-green-600"
        />
        <StatCard 
          icon={Bell} 
          label="Perlu Perhatian" 
          value="15" 
          description="Siswa dengan masalah prioritas"
          color="bg-orange-600"
        />
        <StatCard 
          icon={BarChart3} 
          label="Progres Penanganan" 
          value="89%" 
          description="+5% dari bulan lalu"
          color="bg-blue-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton 
          icon={Plus} 
          label="Buat Janji Baru" 
          color="bg-blue-600"
          onClick={() => setOpenModal('appointment')}
        />
        <QuickActionButton 
          icon={Users} 
          label="Tambah Siswa" 
          color="bg-purple-600"
          onClick={() => setOpenModal('student')}
        />
        <QuickActionButton 
          icon={FileText} 
          label="Buat Laporan" 
          color="bg-pink-600"
          onClick={() => setOpenModal('report')}
        />
        <QuickActionButton 
          icon={Calendar} 
          label="Lihat Jadwal" 
          color="bg-green-600"
          onClick={() => setOpenModal('schedule')}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultation Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Konsultasi (6 Bulan Terakhir)</h3>
          <div className="space-y-4">
            {[
              { label: 'Akademik', value: 42, color: 'bg-pink-500' },
              { label: 'Sosial', value: 32, color: 'bg-green-500' },
              { label: 'Karir', value: 30, color: 'bg-orange-500' },
              { label: 'Keluarga', value: 22, color: 'bg-purple-500' },
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

        {/* Priority Students */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Siswa Perlu Perhatian</h3>
          <div className="space-y-4">
            {priorityStudents.map((student, idx) => (
              <PriorityStudentCard key={idx} {...student} />
            ))}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Konsultasi Hari Ini</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Lihat Semua</button>
        </div>
        
        <div className="space-y-4">
          {schedules.map((schedule, idx) => (
            <ScheduleItem key={idx} {...schedule} />
          ))}
        </div>
      </div>

      {/* Modal: Buat Janji Baru */}
      <Modal 
        isOpen={openModal === 'appointment'} 
        onClose={() => setOpenModal(null)} 
        title="Buat Janji Konseling Baru"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
              <input type="text" placeholder="Masukkan nama siswa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>XII IPA 1</option>
                <option>XII IPA 2</option>
                <option>XI IPS 2</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Waktu</label>
              <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topik Konsultasi</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Akademik</option>
              <option>Karir</option>
              <option>Sosial</option>
              <option>Keluarga</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ruangan</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Ruang BK 1</option>
              <option>Ruang BK 2</option>
              <option>Ruang Konseling</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setOpenModal(null)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Buat Janji</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Tambah Siswa */}
      <Modal 
        isOpen={openModal === 'student'} 
        onClose={() => setOpenModal(null)} 
        title="Tambah Siswa Baru"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input type="text" placeholder="Masukkan nama lengkap" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NISN</label>
              <input type="text" placeholder="Masukkan NISN" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>XII IPA 1</option>
                <option>XII IPA 2</option>
                <option>XI IPS 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Masalah Utama</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Akademik</option>
                <option>Karir</option>
                <option>Sosial</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" placeholder="Masukkan email siswa" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setOpenModal(null)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Tambah Siswa</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Buat Laporan */}
      <Modal 
        isOpen={openModal === 'report'} 
        onClose={() => setOpenModal(null)} 
        title="Buat Laporan Konseling"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Siswa</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Ahmad Fauzi</option>
              <option>Siti Nurhaliza</option>
              <option>Budi Santoso</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Laporan</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Konseling</option>
                <option>Progress</option>
                <option>Insiden</option>
                <option>Evaluasi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Laporan</label>
            <textarea rows={4} placeholder="Masukkan deskripsi laporan konseling..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setOpenModal(null)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Buat Laporan</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Lihat Jadwal */}
      <Modal 
        isOpen={openModal === 'schedule'} 
        onClose={() => setOpenModal(null)} 
        title="Jadwal Lengkap"
        size="lg"
      >
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
      </Modal>
    </div>
  );
};

export default DashboardBKPage;
