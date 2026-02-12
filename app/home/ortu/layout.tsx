'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/dashboard-ortu/layout/Sidebar'
import Header from '@/components/dashboard-ortu/layout/Header'
import { usePathname } from 'next/navigation'
import { verifyAuthOrRedirect } from '@/lib/authRedirect'

interface LayoutProps {
  children: React.ReactNode
}

const OrtuLayout: React.FC<LayoutProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<any>(null)
  const pathname = usePathname()

  React.useEffect(() => {
    verifyAuthOrRedirect().then((user) => {
      if (user) setUserProfile(user)
    })
  }, [])

  const getTitleFromPath = () => {
    const titleMap: Record<string, { title: string; subtitle: string }> = {
      '/home/ortu': { 
        title: 'Portal Orang Tua', 
        subtitle: 'Kelola surat pemanggilan dan komunikasi dengan sekolah' 
      },
      '/home/ortu/chat': { 
        title: 'Pesan', 
        subtitle: 'Berkomunikasi dengan pihak sekolah' 
      },
    }
    return titleMap[pathname] ?? titleMap['/home/ortu']
  }

  const header = getTitleFromPath()

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar pathname={pathname} />
      <div className="md:ml-64">
        <Header title={header.title} subtitle={header.subtitle} />
        <main className="pt-24 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default OrtuLayout
