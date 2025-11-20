'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Shield, ChevronRight, Mail, Phone, Calendar, LogOut } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { HistoryItemProps, SettingItemProps } from '@types'
import EditProfileModalButton from './EditProfileModalButton'

const HistoryItem: React.FC<HistoryItemProps> = ({ title, counselor, date, status, statusColor }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100">
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{counselor} • {date}</p>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor} bg-opacity-10`}>{status}</span>
  </div>
)

const SettingItem: React.FC<SettingItemProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </div>
)

const ProfilPage: React.FC = () => {
  const [user, setUser] = useState<any>(null)

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST')
    } catch (err) {
      // ignore errors but continue to clear client state
      console.error('Logout gagal:', err)
    }

    localStorage.clear()
    sessionStorage.clear()

    // clear common cookies (best-effort)
    try {
      document.cookie = 'auth_profile=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'access_token=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch (e) {
      // ignore
    }

    // navigate to login
    window.location.replace('/login')
  }

  useEffect(() => {
    try {
      const match = document.cookie.match(/auth_profile=([^;]+)/)
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1]))
        setUser(parsed)
      }
    } catch (err) {
      console.error('Gagal memuat profil dari cookie:', err)
    }
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-4xl text-white font-bold">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.username || 'Nama belum diatur'}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{user?.kelas ? `Kelas ${user.kelas.nama}` : 'Kelas'}</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{user?.nomor_induk || 'ID tidak tersedia'}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{user?.email || '-'}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{user?.phone || '-'}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> <span>Bergabung sejak {user?.joined ? user.joined : 'Januari 2024'}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <EditProfileModalButton user={user} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">12</div>
            <div>
              <p className="text-sm text-gray-500">Total Sesi</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold">8</div>
            <div>
              <p className="text-sm text-gray-500">Konsultasi</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold">18</div>
            <div>
              <p className="text-sm text-gray-500">Jam Konseling</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg border border-gray-200">
          <h3 className="p-4 font-semibold text-gray-900 border-b border-gray-100">Riwayat Konseling</h3>
          <div>
            <HistoryItem title="Konseling Pribadi" counselor="Bu Sarah" date="15 Oktober 2025" status="Selesai" statusColor="text-green-600" />
            <HistoryItem title="Konseling Akademik" counselor="Pak Budi" date="10 Oktober 2025" status="Selesai" statusColor="text-green-600" />
            <HistoryItem title="Konseling Kelompok" counselor="Bu Dina" date="5 Oktober 2025" status="Selesai" statusColor="text-green-600" />
          </div>
          <div className="p-4">
            <button className="w-full py-3 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50">Lihat Semua Riwayat</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-900 p-4 border-b border-gray-200">Pengaturan</h3>
        <div>
          <SettingItem icon={Bell} label="Notifikasi" />
          <SettingItem icon={Shield} label="Privasi & Keamanan" />
          <div className="border-t mt-2">
            <button onClick={handleLogout} className="w-full text-left px-4 py-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors duration-200">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilPage