'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard-bk/layout/Sidebar'
import Header from '@/components/dashboard-bk/layout/Header'
import DashboardPage from '@/components/dashboard-bk/pages/DashboardPage'
import DaftarSiswaPage from '@/components/dashboard-bk/pages/DaftarSiswaPage'
import LaporanPage from '@/components/dashboard-bk/pages/LaporanPage'
import BeritaPage from '@/components/dashboard-bk/pages/BeritaPage'
import StatistikPage from '@/components/dashboard-bk/pages/StatistikPage'
import PengaturanPage from '@/components/dashboard-bk/pages/PengaturanPage'
import ChatBKPage from '@/components/dashboard-bk/pages/ChatBKPage'
import ReservasiManagementPage from '@/components/dashboard-bk/pages/ReservasiManagementPage'
import ReservasiApprovalPage from '@/components/dashboard-bk/pages/ReservasiApprovalPage'
import KehadiranKelasPage from '@/components/dashboard-bk/pages/KehadiranKelasPage'
import KeterlambatanPage from '@/components/dashboard-bk/pages/KeterlambatanPage'
import SiswaBermasalahPage from '@/components/dashboard-bk/pages/SiswaBermasalahPage'
import SiswaBerprestiPage from '@/components/dashboard-bk/pages/SiswaBerprestiPage'
import { verifyAuthOrRedirect } from "@/lib/authRedirect";

const DashboardBK: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activePage, setActivePage] = useState<string>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // React.useEffect(() => {
  //   verifyAuthOrRedirect().then((user) => {
  //     if (user) setUserProfile(user);
  //   });
  // }, []);

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard BK', subtitle: 'Ringkasan aktivitas dan pengumuman' },
    siswa: { title: 'Daftar Siswa', subtitle: 'Kelola data siswa dan riwayat konseling' },
    chat: { title: 'Chat BK', subtitle: 'Percakapan langsung dengan konselor' },
    persetujuan: { title: 'Persetujuan Reservasi', subtitle: 'Setujui atau tolak reservasi konseling dari siswa' },
    // reservasi: { title: 'Manajemen Reservasi', subtitle: 'Kelola semua reservasi konseling' },
    kehadiran: { title: 'Kehadiran Kelas', subtitle: 'Kelola dan pantau data kehadiran siswa per kelas' },
    keterlambatan: { title: 'Keterlambatan Siswa', subtitle: 'Kelola data keterlambatan dan frekuensi siswa' },
    siswaBermasalah: { title: 'Siswa Bermasalah', subtitle: 'Kelola data siswa dengan masalah perilaku atau akademik' },
    siswaBerprestasi: { title: 'Siswa Berprestasi', subtitle: 'Kelola dan verifikasi data prestasi siswa' },
    laporan: { title: 'Laporan Konseling', subtitle: 'Kelola dan buat laporan konseling siswa' },
    berita: { title: 'Berita & Artikel BK', subtitle: 'Kelola dan publikasikan artikel untuk siswa' },
    statistik: { title: 'Statistik & Analytics', subtitle: 'Analisis performa dan tren konseling' },
    pengaturan: { title: 'Pengaturan', subtitle: 'Kelola profil dan preferensi akun Anda' },
  }

  const header = titleMap[activePage] ?? titleMap.dashboard

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />
      case 'siswa':
        return <DaftarSiswaPage />
      case 'chat':
        return <ChatBKPage />
      case 'persetujuan':
        return <ReservasiApprovalPage />
      case 'reservasi':
        return <ReservasiManagementPage />
      case 'kehadiran':
        return <KehadiranKelasPage />
      case 'keterlambatan':
        return <KeterlambatanPage />
      case 'siswaBermasalah':
        return <SiswaBermasalahPage />
      case 'siswaBerprestasi':
        return <SiswaBerprestiPage />
      case 'laporan':
        return <LaporanPage />
      case 'berita':
        return <BeritaPage />
      case 'statistik':
        return <StatistikPage />
      case 'pengaturan':
        return <PengaturanPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Header title={header.title} subtitle={header.subtitle} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="md:ml-64 relative">
        <main className="pt-16 md:pt-20 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

export default DashboardBK
