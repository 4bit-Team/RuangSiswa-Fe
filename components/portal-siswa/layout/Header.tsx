'use client'

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Mail, Phone, HelpCircle, User, Settings, LogOut } from 'lucide-react'
import { HeaderProps } from '@types';
import { useNotification } from '@/lib/useNotification';

const Header: React.FC<HeaderProps & { onToggleSidebar?: () => void }> = ({ title, subtitle, profile, onToggleSidebar }) => {

  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const { notifications, getNotifications, markAsRead, unreadCount } = useNotification();

  // Function to get title and subtitle based on current path
  const getPageTitle = (path: string) => {
    if (path.includes('/berita')) {
      return {
        title: '📰 Berita & Artikel BK',
        subtitle: 'Baca artikel dan tips dari konselor BK'
      };
    } else if (path.includes('/konseling')) {
      return {
        title: '💬 Konseling & Bimbingan',
        subtitle: 'Dapatkan dukungan dan bimbingan untuk perkembangan Anda'
      };
    } else if (path.includes('/reservasi')) {
      return {
        title: '📅 Manajemen Reservasi',
        subtitle: 'Kelola jadwal konseling dan reservasi Anda'
      };
    } else if (path.includes('/konsultasi')) {
      return {
        title: '💬 Konsultasi Terbuka',
        subtitle: 'Tanya jawab dengan komunitas siswa dan konselor BK'
      };
    } else if (path.includes('/chat')) {
      return {
        title: '💬 Chat BK',
        subtitle: 'Komunikasi langsung dengan konselor BK Anda'
      };
    } else if (path.includes('/kehadiran')) {
      return {
        title: '📊 Rekap Kehadiran',
        subtitle: 'Pantau catatan kehadiran Anda secara detail setiap hari'
      };
    } else if (path.includes('/keterlambatan')) {
      return {
        title: '⏰ Rekap Keterlambatan',
        subtitle: 'Pantau catatan keterlambatan Anda'
      };
    } else if (path.includes('/pelanggaran')) {
      return {
        title: '⚠️ Rekap Pelanggaran',
        subtitle: 'Pantau catatan pelanggaran dan bimbingan Anda'
      };
    } else if (path.includes('/profil')) {
      return {
        title: '👤 Profil Saya',
        subtitle: 'Kelola informasi dan pengaturan akun Anda'
      };
    } else if (path.includes('/bookmarks')) {
      return {
        title: '🔖 Bookmark Saya',
        subtitle: 'Konsultasi yang Anda simpan untuk referensi'
      };
    } else if (path.includes('/dashboard') || path === '/home/siswa') {
      return {
        title: '🏠 Dashboard Portal Siswa',
        subtitle: 'Tempat yang aman untuk berbagi, berkonsultasi, dan berkembang bersama'
      };
    } else {
      return {
        title: title || '🏠 Dashboard Portal Siswa',
        subtitle: subtitle || 'Tempat yang aman untuk berbagi, berkonsultasi, dan berkembang bersama'
      };
    }
  };

  const currentPage = getPageTitle(pathname);

  useEffect(() => {
    if (profile?.id) {
      getNotifications(profile.id);
    }
  }, [profile?.id, getNotifications]);

  const handleToggleSidebar = () => {
    if (typeof onToggleSidebar === 'function') {
      onToggleSidebar();
      return;
    }

    // fallback: toggle a class and dispatch an event so legacy code/CSS can respond
    try {
      document.documentElement.classList.toggle('sidebar-open');
      window.dispatchEvent(new CustomEvent('toggleSidebar'));
    } catch (err) {
      // ignore
    }
  };



  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-10">
      {/* Header Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{currentPage.title}</h2>
            <p className="text-blue-50">{currentPage.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setShowDropdown(false);
                }}
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
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
                    <button className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
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

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {profile?.username ? profile.username.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            {/* avatar-only button on very small screens */}
            <button
              className="sm:hidden p-1 focus:outline-none"
              onClick={() => {
                setShowDropdown((prev) => !prev);
                setNotificationOpen(false);
              }}
              aria-label="Open profile menu"
            />
            {/* name + role hidden on very small screens to avoid wrapping */}
            <button
              className="hidden sm:flex flex-col items-start focus:outline-none"
              onClick={() => {
                setShowDropdown((prev) => !prev);
                setNotificationOpen(false);
              }}
            >
              <span className="font-medium text-white text-sm">{profile?.username || "Anda"}</span>
              <span className="text-xs text-blue-100">{profile?.role || "Siswa"}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-14 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      {profile?.username ? profile.username.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{profile?.username || 'Siswa'}</h3>
                      <p className="text-blue-100 text-sm">{profile?.role || 'Pelajar'}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{profile?.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{profile?.phone || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <a href="/home/siswa/profil" className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <User size={18} className="text-blue-600" />
                    <div>
                      <p className="font-medium">Profil Saya</p>
                      <p className="text-xs text-gray-500">Lihat dan edit profil</p>
                    </div>
                  </a>

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

                  <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={18} />
                    <span className="font-medium">Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </header>
  );
}

export default Header;