'use client'

import React, { useState, useEffect } from 'react'
import { apiRequest } from '@/lib/api'
import { useNotification } from '@/lib/useNotification'
import { Bell, User, LogOut, Mail, Phone, Settings, HelpCircle, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  subtitle?: string
  onMenuClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Dashboard WAKA', 
  subtitle = 'Wakil Kepala Kesiswaan', 
  onMenuClick 
}) => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { notifications, getNotifications, markAsRead, unreadCount } = useNotification()
  
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

  useEffect(() => {
    if (user?.id) {
      getNotifications(user.id)
    }
  }, [user?.id, getNotifications])



  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen)
                setProfileOpen(false)
              }}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {notificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotificationOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="text-sm font-medium text-red-500">{unreadCount} Baru</span>
                    )}
                  </div>

                  <div className="divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className="w-full p-4 hover:bg-gray-50 text-left transition-colors flex items-start gap-3 border-l-4 border-transparent hover:border-blue-500"
                        >
                          <div className="flex-shrink-0 text-xl mt-1">{notif.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">{notif.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Tidak ada notifikasi
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-200 flex gap-2 sticky bottom-0 bg-white">
                    <button 
                      onClick={() => {
                        markAsRead(user?.id);
                      }}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ✓ Tandai Semua Dibaca
                    </button>
                    <button className="flex-1 text-sm text-gray-600 hover:text-gray-700 font-medium">
                      Lihat Semua
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotificationOpen(false)
              }}
              className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors font-semibold"
            >
              {user?.username?.[0]?.toUpperCase() || 'W'}
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40 overflow-hidden">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {user?.username?.[0]?.toUpperCase() || 'W'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user?.username || 'WAKA'}</h3>
                        <p className="text-blue-100 text-sm">Wakil Kepala Kesiswaan</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{user?.email || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{user?.phone_number || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <User size={18} className="text-blue-600" />
                      <div>
                        <p className="font-medium">Profil Saya</p>
                        <p className="text-xs text-gray-500">Lihat dan edit profil</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <Settings size={18} className="text-blue-600" />
                      <div>
                        <p className="font-medium">Pengaturan</p>
                        <p className="text-xs text-gray-500">Kelola preferensi akun</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <HelpCircle size={18} className="text-blue-600" />
                      <div>
                        <p className="font-medium">Bantuan & Dukungan</p>
                        <p className="text-xs text-gray-500">FAQ dan kontak support</p>
                      </div>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                      <LogOut size={18} />
                      <span className="font-medium">Keluar</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
