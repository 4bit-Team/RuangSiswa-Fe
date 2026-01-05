'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';

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

interface BkJurusan {
  id: number;
  jurusanId: number;
  jurusan: { id: number; nama: string; kode: string };
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
  const { user, token, loading } = useAuth();
  const [assignedJurusan, setAssignedJurusan] = useState<BkJurusan[]>([]);
  const [students, setStudents] = useState<StudentRowProps[]>([]);
  const [isLoadingJurusan, setIsLoadingJurusan] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Demo students data
  const demoStudents: StudentRowProps[] = [
    { id: 1, name: 'Ahmad Fauzi', nisn: '0012345678', class: 'XII IPA 1', status: 'Active', issue: 'Karir', sessions: '5x', lastDate: '10 Nov 2025', initial: 'A', bgColor: 'bg-indigo-600' },
    { id: 2, name: 'Siti Nurhaliza', nisn: '0012345679', class: 'XI IPS 2', status: 'Active', issue: 'Akademik', sessions: '3x', lastDate: '12 Nov 2025', initial: 'S', bgColor: 'bg-purple-600' },
    { id: 3, name: 'Budi Santoso', nisn: '0012345680', class: 'X MIPA 3', status: 'Need Attention', issue: 'Sosial', sessions: '8x', lastDate: '08 Nov 2025', initial: 'B', bgColor: 'bg-blue-600' },
    { id: 4, name: 'Dewi Lestari', nisn: '0012345681', class: 'XII IPS 1', status: 'Active', issue: 'Karir', sessions: '4x', lastDate: '11 Nov 2025', initial: 'D', bgColor: 'bg-green-600' },
    { id: 5, name: 'Rizky Pratama', nisn: '0012345682', class: 'XI IPA 2', status: 'Active', issue: 'Akademik', sessions: '2x', lastDate: '09 Nov 2025', initial: 'R', bgColor: 'bg-pink-600' },
  ];

  // Load assigned jurusan on mount
  useEffect(() => {
    if (!loading && user && token) {
      loadAssignedJurusan();
    }
  }, [loading, user, token]);

  // Load assigned jurusan for current BK
  const loadAssignedJurusan = async () => {
    try {
      setIsLoadingJurusan(true);
      const response = await apiRequest('/bk-jurusan/my-jurusan', 'GET', undefined, token);
      if (Array.isArray(response)) {
        setAssignedJurusan(response);
        // If has jurusan, load students
        if (response.length > 0) {
          loadStudentsByJurusan(response.map(j => j.jurusanId));
        }
      }
    } catch (error) {
      console.error('Error loading assigned jurusan:', error);
      setAssignedJurusan([]);
    } finally {
      setIsLoadingJurusan(false);
    }
  };

  // Load students by jurusan IDs
  const loadStudentsByJurusan = async (jurusanIds: number[]) => {
    try {
      setIsLoadingStudents(true);
      const jurusanIdsParam = JSON.stringify(jurusanIds);
      const response = await apiRequest(`/users/students/by-jurusan?jurusanIds=${encodeURIComponent(jurusanIdsParam)}`, 'GET', undefined, token);
      
      if (Array.isArray(response)) {
        // Transform API response to StudentRowProps format
        const transformedStudents = response.map((student: any, idx: number) => ({
          id: student.id,
          name: student.fullName || 'N/A',
          nisn: student.username || 'N/A',
          class: student.kelas_lengkap || student.kelas?.nama || 'N/A',
          status: 'Active' as const,
          issue: ['Karir', 'Akademik', 'Sosial'][idx % 3] as any,
          sessions: `${Math.floor(Math.random() * 10) + 1}x`,
          lastDate: `${Math.floor(Math.random() * 29) + 1} Nov 2025`,
          initial: (student.fullName || 'A')[0],
          bgColor: ['bg-indigo-600', 'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-pink-600'][idx % 5],
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      // Use demo data if API fails
      setStudents(demoStudents);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const displayStudents = students.length > 0 ? students : demoStudents;
  const isConfigured = assignedJurusan.length > 0;

  if (loading || isLoadingJurusan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Blur overlay and modal if not configured */}
      {!isConfigured && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Konfigurasi Diperlukan</h2>
                    <p className="text-blue-100 text-sm mt-1">Isi pengaturan jurusan terlebih dahulu</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Sebelum melihat daftar siswa, Anda perlu mengatur jurusan yang akan Anda tangani di halaman pengaturan.
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  Klik tombol di bawah untuk membuka halaman pengaturan dan tambahkan jurusan Anda.
                </p>

                <button
                  onClick={() => {
                    // Navigate to settings page
                    window.location.href = '/home/bk/pengaturan';
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                >
                  Buka Pengaturan
                </button>
              </div>
            </div>
          </div>

          {/* Blur the content */}
          <div className="opacity-50 pointer-events-none">
            {/* Content will be below this */}
          </div>
        </>
      )}

      {/* Main Content */}
      <div className={isConfigured ? '' : 'blur-sm pointer-events-none'}>
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daftar Siswa</h2>
          <p className="text-sm text-gray-600">Kelola data siswa dan riwayat konseling</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Siswa" value={displayStudents.length} />
          <StatCard label="Aktif Konseling" value={Math.floor(displayStudents.length * 0.7)} />
          <StatCard label="Perlu Perhatian" value={Math.floor(displayStudents.length * 0.15)} />
          <StatCard label="Kritis" value={Math.floor(displayStudents.length * 0.05)} />
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

          {/* Jurusan Filter Info */}
          {isConfigured && assignedJurusan.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Filter Aktif:</strong> Menampilkan siswa dari {assignedJurusan.length} jurusan: {assignedJurusan.map(j => j.jurusan.nama).join(', ')}
              </p>
            </div>
          )}

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
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <Loader className="animate-spin text-blue-600 mx-auto" size={30} />
                  </td>
                </tr>
              ) : displayStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Tidak ada siswa ditemukan
                  </td>
                </tr>
              ) : (
                displayStudents.map((student) => (
                  <StudentRow key={student.id} {...student} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      </div>
    </div>
  );
};

export default DaftarSiswaPage;
