"use client"

import React, { useState } from 'react'
import Sidebar from '@/components/portal-siswa/layout/Sidebar'
import Header from '@/components/portal-siswa/layout/Header'
import DashboardPage from '@/components/portal-siswa/pages/DashboardPage'
import ChatPage from '@/components/portal-siswa/pages/ChatPage'
import KonsultasiPage from '@/components/portal-siswa/pages/KonsultasiPage'
import KonselingPage from '@/components/portal-siswa/pages/KonselingPage'
import ReservasiPage from '@/components/portal-siswa/pages/ReservasiPage'
import ProfilPage from '@/components/portal-siswa/pages/ProfilPage'
import BeritaPage from '@/components/portal-siswa/pages/BeritaPage'
import { verifyAuthOrRedirect } from "@/lib/authRedirect";

const BKPortal: React.FC<{ searchParams?: Promise<{ topic?: string }> }> = ({ searchParams }) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activePage, setActivePage] = useState<string>('dashboard')
  const [params, setParams] = useState<{ topic?: string }>({})
  
  React.useEffect(() => {
    if (searchParams) {
      searchParams.then((result) => {
        setParams(result || {})
      })
    }
  }, [searchParams])
  
  const topicParam = params?.topic

  const getPageAndTopic = (page: string) => {
    if (page.startsWith('berita-')) {
      return { page: 'berita', topic: page.replace('berita-', '') }
    }
    return { page, topic: null }
  }

  const currentPageInfo = getPageAndTopic(activePage)

//   React.useEffect(() => {
//   verifyAuthOrRedirect().then((user) => {
//     if (user) setUserProfile(user);
//   });
// }, []);


  // title/subtitle shown in the Header component
  const titleMap: Record<string, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Dashboard BK', subtitle: 'Ringkasan aktivitas dan pengumuman' },
    konseling: { title: 'Konseling', subtitle: 'Layanan konseling sekolah' },
    konsultasi: { title: 'Konsultasi', subtitle: 'Ajukan pertanyaan dan baca artikel' },
    reservasi: { title: 'Reservasi', subtitle: 'Jadwalkan sesi dengan konselor' },
    chat: { title: 'Chat BK', subtitle: 'Percakapan langsung dengan konselor' },
    profil: { title: 'Profil', subtitle: 'Kelola informasi akun Anda' },
    berita: { title: 'Berita & Artikel BK', subtitle: 'Baca artikel dan tips dari konselor BK' },
  }

  const header = titleMap[activePage] ?? titleMap.dashboard


  const renderContent = () => {
    const page = currentPageInfo.page
    const topic = currentPageInfo.topic

    switch (page) {
      case 'dashboard':
        return <DashboardPage />
      case 'konseling':
        return <KonselingPage />
      case 'konsultasi':
        return <KonsultasiPage />
      case 'reservasi':
        return <ReservasiPage />
      case 'chat':
        return <ChatPage />
      case 'profil':
        return <ProfilPage />
      case 'berita':
        return <BeritaPage selectedTopic={topic || topicParam} setActivePage={setActivePage} />
      default:
        return <DashboardPage setActivePage={setActivePage} />
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="md:ml-64">
        <Header title={header.title} subtitle={header.subtitle ?? ''} profile={userProfile} />
        <main className="pt-20 p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}

export default BKPortal
