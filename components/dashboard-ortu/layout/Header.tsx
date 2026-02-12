'use client'

import React, { useState, useEffect } from 'react'
import { Bell, User, LogOut, Mail, Phone, HelpCircle, Settings } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useNotification } from '@/lib/useNotification'

interface HeaderProps {
  title: string
  subtitle: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { notifications, getNotifications, markAsRead, unreadCount } = useNotification()

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST')
    } catch (err) {
      console.error('Logout gagal:', err)
    }

    localStorage.clear()
    sessionStorage.clear()

    try {
      document.cookie = 'auth_profile=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'access_token=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch (e) {
      // ignore
    }

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
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen)
                setProfileOpen(false)
              }}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notification Dropdown */}
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
                          className="w-full p-4 hover:bg-gray-50 text-left transition-colors flex items-start gap-3 border-l-4 border-transparent hover:border-cyan-500"
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
                    <button className="flex-1 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
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

          {/* Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotificationOpen(false)
              }}
              className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-cyan-700 transition-colors"
            >
              {user?.fullName?.[0]?.toUpperCase() || 'O'}
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40 overflow-hidden">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-cyan-600 font-bold text-xl">
                        {user?.username?.[0]?.toUpperCase() || 'O'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user?.username || 'Orang Tua'}</h3>
                        <p className="text-cyan-100 text-sm">Orang Tua</p>
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
                      <User size={18} className="text-cyan-600" />
                      <div>
                        <p className="font-medium">Profil Saya</p>
                        <p className="text-xs text-gray-500">Lihat dan edit profil</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <Settings size={18} className="text-cyan-600" />
                      <div>
                        <p className="font-medium">Pengaturan</p>
                        <p className="text-xs text-gray-500">Kelola preferensi akun</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                      <HelpCircle size={18} className="text-cyan-600" />
                      <div>
                        <p className="font-medium">Bantuan & Dukungan</p>
                        <p className="text-xs text-gray-500">FAQ dan kontak support</p>
                      </div>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
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
