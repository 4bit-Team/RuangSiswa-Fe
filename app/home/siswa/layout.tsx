'use client'

import React from 'react'
import Sidebar from '@/components/portal-siswa/layout/Sidebar'
import Header from '@/components/portal-siswa/layout/Header'
import { usePathname } from 'next/navigation'
import { verifyAuthOrRedirect } from "@/lib/authRedirect"
import { SocketProvider } from '@/lib/context/SocketContext'

interface LayoutProps {
  children: React.ReactNode
}

const SiswaLayout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname()

  React.useEffect(() => {
    verifyAuthOrRedirect()
  }, [])

  const getTitleFromPath = () => {
    const titleMap: Record<string, { title: string; subtitle: string }> = {
      '/home/siswa': { title: 'Dashboard', subtitle: 'Ringkasan aktivitas dan pengumuman' },
      '/home/siswa/berita': { title: 'Berita & Artikel BK', subtitle: 'Baca artikel dan tips dari konselor BK' },
      '/home/siswa/konseling': { title: 'Konseling', subtitle: 'Layanan konseling sekolah' },
      '/home/siswa/konsultasi': { title: 'Konsultasi', subtitle: 'Ajukan pertanyaan dan baca artikel' },
      '/home/siswa/reservasi': { title: 'Reservasi', subtitle: 'Jadwalkan sesi dengan konselor' },
      '/home/siswa/chat': { title: 'Chat BK', subtitle: 'Percakapan langsung dengan konselor' },
      '/home/siswa/profil': { title: 'Profil', subtitle: 'Kelola informasi akun Anda' },
    }
    return titleMap[pathname] ?? titleMap['/home/siswa']
  }

  const header = getTitleFromPath()

  return (
    <SocketProvider>
      <div className="bg-gray-50 min-h-screen">
        <Sidebar pathname={pathname} />
        <div className="md:ml-64">
          <Header title={header.title} subtitle={header.subtitle} />
          <main className="pt-20 p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SocketProvider>
  )
}

export default SiswaLayout
