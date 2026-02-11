'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard-admin/layout/Sidebar'
import Header from '@/components/dashboard-admin/layout/Header'
import { usePathname } from 'next/navigation'
import { verifyAuthOrRedirect } from "@/lib/authRedirect"
import { SocketProvider } from '@/lib/context/SocketContext'

interface LayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
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
      '/home/admin': { title: 'Admin Dashboard', subtitle: 'Ringkasan semua fitur dan data sistem' },
      '/home/admin/users': { title: 'User Management', subtitle: 'Kelola pengguna BK, Siswa, dan Kesiswaan' },
      '/home/admin/toxic': { title: 'Filter Toxic', subtitle: 'Monitor dan filter konten berbahaya di chat dan konseling' },
      '/home/admin/emoji': { title: 'Emoji Library', subtitle: 'Kelola emoji untuk digunakan di chat' },
      '/home/admin/blocklist': { title: 'Block List ICE', subtitle: 'Kelola users yang terblokir dari ICE candidate spam' },
    }
    return titleMap[pathname] ?? titleMap['/home/admin']
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

export default AdminLayout
