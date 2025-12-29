'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard-bk/layout/Sidebar'
import Header from '@/components/dashboard-bk/layout/Header'
import { usePathname } from 'next/navigation'
import { verifyAuthOrRedirect } from "@/lib/authRedirect"

interface LayoutProps {
  children: React.ReactNode
}

const BKLayout: React.FC<LayoutProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    verifyAuthOrRedirect().then((user) => {
      if (user) setUserProfile(user)
    })
  }, [])

  const getTitleFromPath = () => {
    const titleMap: Record<string, { title: string; subtitle: string }> = {
      '/home/bk': { title: 'Dashboard BK', subtitle: 'Ringkasan aktivitas dan pengumuman' },
      '/home/bk/siswa': { title: 'Daftar Siswa', subtitle: 'Kelola data siswa dan riwayat konseling' },
      '/home/bk/chat': { title: 'Chat BK', subtitle: 'Percakapan langsung dengan konselor' },
      '/home/bk/persetujuan': { title: 'Persetujuan Reservasi', subtitle: 'Setujui atau tolak reservasi konseling dari siswa' },
      '/home/bk/laporan': { title: 'Laporan Konseling', subtitle: 'Kelola dan buat laporan konseling siswa' },
      '/home/bk/berita': { title: 'Berita & Artikel BK', subtitle: 'Kelola dan publikasikan artikel untuk siswa' },
      '/home/bk/statistik': { title: 'Statistik & Analytics', subtitle: 'Analisis performa dan tren konseling' },
      '/home/bk/pengaturan': { title: 'Pengaturan', subtitle: 'Kelola profil dan preferensi akun Anda' },
    }
    return titleMap[pathname] ?? titleMap['/home/bk']
  }

  const header = getTitleFromPath()

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Header title={header.title} subtitle={header.subtitle} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="md:ml-64">
        <main className="pt-16 md:pt-20 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default BKLayout
