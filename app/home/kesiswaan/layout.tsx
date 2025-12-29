'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/kesiswaan/layout/Sidebar'
import Header from '@/components/kesiswaan/layout/Header'
import { usePathname } from 'next/navigation'
import { verifyAuthOrRedirect } from "@/lib/authRedirect"

interface LayoutProps {
  children: React.ReactNode
}

const KesiswaaLayout: React.FC<LayoutProps> = ({ children }) => {
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
      '/home/kesiswaan': { title: 'Dashboard Kesiswaan', subtitle: 'Selamat datang di portal kesiswaan' },
      '/home/kesiswaan/kehadiran': { title: 'Kehadiran Kelas', subtitle: 'Lihat dan pantau riwayat kehadiran Anda di sekolah' },
      '/home/kesiswaan/keterlambatan': { title: 'Keterlambatan Masuk', subtitle: 'Pantau dan kelola data keterlambatan Anda' },
      '/home/kesiswaan/statusbimbingan': { title: 'Status Bimbingan', subtitle: 'Progres dan riwayat sesi bimbingan dengan konselor' },
    }
    return titleMap[pathname] ?? titleMap['/home/kesiswaan']
  }

  const header = getTitleFromPath()

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Header title={header.title} subtitle={header.subtitle} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="md:ml-64 relative">
        <main className="pt-16 md:pt-20 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default KesiswaaLayout
