'use client'

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical } from 'lucide-react';
import Modal from '../modals/Modal';

// Interfaces
interface StudentRowProps {
  id: number;
  name: string;
  nisn: string;
  class: string;
  status: 'Active' | 'Need Attention';
  issue: 'Karir' | 'Akademik' | 'Sosial';
  sessions: string;
  lastDate: string;
  initial: string;
  bgColor?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
}

// Student Row Component
const StudentRow: React.FC<StudentRowProps> = ({ id, name, nisn, class: studentClass, status, issue, sessions, lastDate, initial, bgColor }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50">
    <td className="py-4 px-4">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold`}>
          {initial}
        </div>
        <span className="font-medium text-gray-900">{name}</span>
      </div>
    </td>
    <td className="py-4 px-4 text-sm text-gray-600">{nisn}</td>
    <td className="py-4 px-4 text-sm text-gray-600">{studentClass}</td>
    <td className="py-4 px-4">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {status}
      </span>
    </td>
    <td className="py-4 px-4">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        issue === 'Karir' ? 'bg-purple-100 text-purple-700' :
        issue === 'Akademik' ? 'bg-blue-100 text-blue-700' :
        'bg-pink-100 text-pink-700'
      }`}>
        {issue}
      </span>
    </td>
    <td className="py-4 px-4 text-sm text-gray-600">{sessions}</td>
    <td className="py-4 px-4 text-sm text-gray-600">{lastDate}</td>
    <td className="py-4 px-4">
      <button className="p-1 hover:bg-gray-200 rounded">
        <MoreVertical size={18} className="text-gray-600" />
      </button>
    </td>
  </tr>
);

// Stats Card
const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <h3 className="text-sm text-gray-600 mb-2">{label}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const DaftarSiswaPage: React.FC = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const students: StudentRowProps[] = [
    { id: 1, name: 'Ahmad Fauzi', nisn: '0012345678', class: 'XII IPA 1', status: 'Active', issue: 'Karir', sessions: '5x', lastDate: '10 Nov 2025', initial: 'A', bgColor: 'bg-indigo-600' },
    { id: 2, name: 'Siti Nurhaliza', nisn: '0012345679', class: 'XI IPS 2', status: 'Active', issue: 'Akademik', sessions: '3x', lastDate: '12 Nov 2025', initial: 'S', bgColor: 'bg-purple-600' },
    { id: 3, name: 'Budi Santoso', nisn: '0012345680', class: 'X MIPA 3', status: 'Need Attention', issue: 'Sosial', sessions: '8x', lastDate: '08 Nov 2025', initial: 'B', bgColor: 'bg-blue-600' },
    { id: 4, name: 'Dewi Lestari', nisn: '0012345681', class: 'XII IPS 1', status: 'Active', issue: 'Karir', sessions: '4x', lastDate: '11 Nov 2025', initial: 'D', bgColor: 'bg-green-600' },
    { id: 5, name: 'Rizky Pratama', nisn: '0012345682', class: 'XI IPA 2', status: 'Active', issue: 'Akademik', sessions: '2x', lastDate: '09 Nov 2025', initial: 'R', bgColor: 'bg-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daftar Siswa</h2>
          <p className="text-sm text-gray-600">Kelola data siswa dan riwayat konseling</p>
        </div>
        <button 
          onClick={() => setOpenModal('add')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors">
          <Plus size={20} />
          <span>Tambah Siswa</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Siswa" value="342" />
        <StatCard label="Aktif Konseling" value="156" />
        <StatCard label="Perlu Perhatian" value="15" />
        <StatCard label="Kritis" value="8" />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau kelas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="ml-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Siswa</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">NISN</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kelas</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Masalah Utama</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Konsultasi</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Terakhir</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <StudentRow key={student.id} {...student} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Siswa */}
      <Modal 
        isOpen={openModal === 'add'} 
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
                <option>X MIPA 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Active</option>
                <option>Need Attention</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Masalah Utama</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Karir</option>
                <option>Akademik</option>
                <option>Sosial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" placeholder="Masukkan email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
            <input type="tel" placeholder="Masukkan nomor telepon" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setOpenModal(null)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Tambah Siswa</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DaftarSiswaPage;
