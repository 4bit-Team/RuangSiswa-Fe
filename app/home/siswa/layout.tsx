'use client'

import React, { useState, useMemo } from 'react'
import Sidebar from '@/components/portal-siswa/layout/Sidebar'
import Header from '@/components/portal-siswa/layout/Header'
import { usePathname } from 'next/navigation'
import { verifyAuthOrRedirect } from "@/lib/authRedirect"

interface LayoutProps {
  children: React.ReactNode
}

const titleMap: Record<string, { title: string; subtitle: string }> = {
  '/home/siswa': { title: 'Dashboard', subtitle: 'Ringkasan aktivitas dan pengumuman' },
  '/home/siswa/berita': { title: 'Berita & Artikel BK', subtitle: 'Baca artikel dan tips dari konselor BK' },
  '/home/siswa/konseling': { title: 'Konseling', subtitle: 'Layanan konseling sekolah' },
  '/home/siswa/konsultasi': { title: 'Konsultasi', subtitle: 'Ajukan pertanyaan dan baca artikel' },
  '/home/siswa/reservasi': { title: 'Reservasi', subtitle: 'Jadwalkan sesi dengan konselor' },
  '/home/siswa/chat': { title: 'Chat BK', subtitle: 'Percakapan langsung dengan konselor' },
  '/home/siswa/profil': { title: 'Profil', subtitle: 'Kelola informasi akun Anda' },
}

const SiswaLayout: React.FC<LayoutProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<any>(null)
  const pathname = usePathname()

  // React.useEffect(() => {
  //   verifyAuthOrRedirect().then((user) => {
  //     if (user) setUserProfile(user)
  //   })
  // }, [])

  const header = useMemo(() => {
    // Try exact match first
    if (titleMap[pathname]) {
      return titleMap[pathname]
    }
    // Try matching with trailing slash removed
    const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
    if (titleMap[cleanPath]) {
      return titleMap[cleanPath]
    }
    // Find best match by checking if pathname starts with any key
    const sortedKeys = Object.keys(titleMap).sort((a, b) => b.length - a.length)
    for (const key of sortedKeys) {
      if (pathname.startsWith(key) && key !== '/home/siswa') {
        return titleMap[key]
      }
    }
    return titleMap['/home/siswa']
  }, [pathname])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar pathname={pathname} />
      <div className="md:ml-64">
        <Header title={header.title} subtitle={header.subtitle} profile={userProfile} />
        <main className="pt-20 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default SiswaLayout
