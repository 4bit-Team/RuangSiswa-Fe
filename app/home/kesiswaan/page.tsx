'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/kesiswaan/layout/Sidebar'
import Header from '@/components/kesiswaan/layout/Header'
import DashboardPage from '@/components/kesiswaan/pages/DashboardPage'
import KehadiranPage from '@/components/kesiswaan/pages/KehadiranPage'
import KeterlambatanPage from '@/components/kesiswaan/pages/KeterlambatanPage'
import StatusBimbinganPage from '@/components/kesiswaan/pages/StatusBimbinganPage'
import { verifyAuthOrRedirect } from "@/lib/authRedirect"

const KesiswaaPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activePage, setActivePage] = useState<string>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  React.useEffect(() => {
    verifyAuthOrRedirect().then((user) => {
      if (user) setUserProfile(user);
    });
  }, []);

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Kesiswaan', subtitle: 'Selamat datang di portal kesiswaan' },
    kehadiran: { title: 'Kehadiran Kelas', subtitle: 'Lihat dan pantau riwayat kehadiran Anda di sekolah' },
    keterlambatan: { title: 'Keterlambatan Masuk', subtitle: 'Pantau dan kelola data keterlambatan Anda' },
    statusBimbingan: { title: 'Status Bimbingan', subtitle: 'Progres dan riwayat sesi bimbingan dengan konselor' },
  }

  const header = titleMap[activePage] ?? titleMap.dashboard

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />
      case 'kehadiran':
        return <KehadiranPage />
      case 'keterlambatan':
        return <KeterlambatanPage />
      case 'statusBimbingan':
        return <StatusBimbinganPage />
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

export default KesiswaaPage
