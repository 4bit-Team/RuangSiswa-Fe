'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard-waka/layout/Sidebar'
import Header from '@/components/dashboard-waka/layout/Header'
import { usePathname } from 'next/navigation'
import { verifyAuthOrRedirect } from "@/lib/authRedirect"
import { SocketProvider } from '@/lib/context/SocketContext'

interface LayoutProps {
  children: React.ReactNode
}

const WAKALayout: React.FC<LayoutProps> = ({ children }) => {
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
      '/home/waka': { title: 'Dashboard WAKA', subtitle: 'Ringkasan kasus dan keputusan pembinaan' },
      '/home/waka/dashboard': { title: 'Dashboard WAKA', subtitle: 'Ringkasan kasus dan keputusan pembinaan' },
      '/home/waka/kasus-siswa': { title: 'Kasus Siswa Menunggu', subtitle: 'Kelola kasus siswa yang menunggu keputusan' },
      '/home/waka/riwayat-keputusan': { title: 'Riwayat Keputusan', subtitle: 'Lihat riwayat keputusan pembinaan yang telah dibuat' },
      '/home/waka/statistics': { title: 'Statistik & Analytics', subtitle: 'Analisis data pembinaan dan keputusan' },
    }
    return titleMap[pathname] ?? titleMap['/home/waka']
  }

  const header = getTitleFromPath()

  return (
    <SocketProvider>
      <div className="bg-gray-50 min-h-screen">
        <Sidebar pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Header title={header.title} subtitle={header.subtitle} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="md:ml-64">
          <main className="pt-16 md:pt-20 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SocketProvider>
  )
}

export default WAKALayout
