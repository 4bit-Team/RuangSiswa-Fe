'use client'

import React, { useState } from 'react';
import { Search, Plus, Download, Eye, FileText, Calendar, User } from 'lucide-react';
import Modal from '../modals/Modal';

// Interfaces
interface ReportCardProps {
  id: number;
  title: string;
  status: 'Selesai' | 'Pending' | 'Draft';
  type: 'Konseling' | 'Progress' | 'Insiden' | 'Evaluasi';
  category: string;
  studentClass: string;
  date: string;
  initial: string;
  bgColor: string;
}

interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  color: string;
}

// Report Card Component
const ReportCard: React.FC<ReportCardProps> = ({ id, title, status, type, category, studentClass, date, initial, bgColor }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-4 flex-1">
      <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
        {initial}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-1">
          <p className="font-semibold text-gray-900">{title}</p>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            status === 'Selesai' ? 'bg-green-100 text-green-700' :
            status === 'Pending' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-200 text-gray-700'
          }`}>
            {status}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span className={`px-2 py-1 rounded ${
            type === 'Konseling' ? 'bg-blue-100 text-blue-700' :
            type === 'Progress' ? 'bg-purple-100 text-purple-700' :
            type === 'Insiden' ? 'bg-red-100 text-red-700' :
            'bg-green-100 text-green-700'
          }`}>
            {type}
          </span>
          <span>{category}</span>
          <span className="flex items-center"><User size={12} className="mr-1" /> {studentClass}</span>
          <span className="flex items-center"><Calendar size={12} className="mr-1" /> {date}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="p-2 hover:bg-gray-200 rounded-lg" title="Lihat Detail">
        <Eye size={18} className="text-gray-600" />
      </button>
      <button className="p-2 hover:bg-gray-200 rounded-lg" title="Download">
        <Download size={18} className="text-gray-600" />
      </button>
    </div>
  </div>
);

// Stats Card Component
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-center space-x-3 mb-2">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="text-white" size={20} />
      </div>
      <h3 className="text-sm text-gray-600">{label}</h3>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const LaporanPage: React.FC = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const reports: ReportCardProps[] = [
    { id: 1, title: 'Laporan Konseling - Ahmad Fauzi', type: 'Konseling', category: 'Karir', status: 'Selesai', studentClass: 'XII IPA 1', date: '12 Nov 2025', initial: 'A', bgColor: 'bg-indigo-600' },
    { id: 2, title: 'Progress Report - Siti Nurhaliza', type: 'Progress', category: 'Akademik', status: 'Selesai', studentClass: 'XI IPS 2', date: '11 Nov 2025', initial: 'S', bgColor: 'bg-purple-600' },
    { id: 3, title: 'Laporan Insiden - Budi Santoso', type: 'Insiden', category: 'Sosial', status: 'Pending', studentClass: 'X MIPA 3', date: '10 Nov 2025', initial: 'B', bgColor: 'bg-orange-600' },
    { id: 4, title: 'Evaluasi Bulanan - Dewi Lestari', type: 'Evaluasi', category: 'Karir', status: 'Selesai', studentClass: 'XII IPS 1', date: '09 Nov 2025', initial: 'D', bgColor: 'bg-green-600' },
    { id: 5, title: 'Laporan Konseling - Rizky Pratama', type: 'Konseling', category: 'Akademik', status: 'Draft', studentClass: 'XI IPA 2', date: '08 Nov 2025', initial: 'R', bgColor: 'bg-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Konseling</h2>
          <p className="text-sm text-gray-600">Kelola dan buat laporan konseling siswa</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 font-medium">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setOpenModal('create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors">
            <Plus size={20} />
            <span>Buat Laporan</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={FileText} 
          label="Total Laporan" 
          value="248" 
          color="bg-blue-600"
        />
        <StatCard 
          icon={FileText} 
          label="Bulan Ini" 
          value="42" 
          color="bg-green-600"
        />
        <StatCard 
          icon={FileText} 
          label="Pending" 
          value="8" 
          color="bg-orange-600"
        />
        <StatCard 
          icon={FileText} 
          label="Draft" 
          value="3" 
          color="bg-gray-600"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari laporan, siswa, atau topik..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Semua Tipe</option>
            <option>Konseling</option>
            <option>Progress</option>
            <option>Insiden</option>
            <option>Evaluasi</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Semua Status</option>
            <option>Selesai</option>
            <option>Pending</option>
            <option>Draft</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} {...report} />
          ))}
        </div>
      </div>

      {/* Modal: Buat Laporan */}
      <Modal 
        isOpen={openModal === 'create'} 
        onClose={() => setOpenModal(null)} 
        title="Buat Laporan Konseling Baru"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Siswa</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Ahmad Fauzi - XII IPA 1</option>
              <option>Siti Nurhaliza - XI IPS 2</option>
              <option>Budi Santoso - X MIPA 3</option>
              <option>Dewi Lestari - XII IPS 1</option>
              <option>Rizky Pratama - XI IPA 2</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Karir</option>
                <option>Akademik</option>
                <option>Sosial</option>
                <option>Keluarga</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Laporan</label>
            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Konten Laporan</label>
            <textarea rows={6} placeholder="Masukkan konten laporan lengkap..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setOpenModal(null)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Buat Laporan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LaporanPage;
