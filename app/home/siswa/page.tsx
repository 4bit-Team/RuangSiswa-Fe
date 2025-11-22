"use client"

import React, { useState } from 'react'
import Sidebar from '@/components/bk-portal/layout/Sidebar'
import Header from '@/components/bk-portal/layout/Header'
import DashboardPage from '@/components/bk-portal/pages/DashboardPage'
import ChatPage from '@/components/bk-portal/pages/ChatPage'
import KonsultasiPage from '@/components/bk-portal/pages/KonsultasiPage'
import KonselingPage from '@/components/bk-portal/pages/KonselingPage'
import ReservasiPage from '@/components/bk-portal/pages/ReservasiPage'
import ProfilPage from '@/components/bk-portal/pages/ProfilPage'
import { verifyAuthOrRedirect } from "@/lib/authRedirect";

const BKPortal: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard')
  const [userProfile, setUserProfile] = useState<any>(null);

  React.useEffect(() => {
  verifyAuthOrRedirect().then((user) => {
    if (user) setUserProfile(user);
  });
}, []);


  // title/subtitle shown in the Header component
  const titleMap: Record<string, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Dashboard BK', subtitle: 'Ringkasan aktivitas dan pengumuman' },
    konseling: { title: 'Konseling', subtitle: 'Layanan konseling sekolah' },
    konsultasi: { title: 'Konsultasi', subtitle: 'Ajukan pertanyaan dan baca artikel' },
    reservasi: { title: 'Reservasi', subtitle: 'Jadwalkan sesi dengan konselor' },
    chat: { title: 'Chat BK', subtitle: 'Percakapan langsung dengan konselor' },
    profil: { title: 'Profil', subtitle: 'Kelola informasi akun Anda' },
  }

  const header = titleMap[activePage] ?? titleMap.dashboard

  const renderContent = () => {
    switch (activePage) {
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
      default:
        return <DashboardPage />
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