'use client'

import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, Mail, Phone, LogOut, User, Settings, HelpCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick }) => {
  const [isMobile, setIsMobile] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Jadwal Konseling Baru',
      description: 'Ahmad Fauzi membuat janji untuk konseling karir',
      time: '5 menit yang lalu',
      icon: '📅',
      read: false,
    },
    {
      id: 2,
      title: 'Siswa Perlu Perhatian',
      description: 'Maya Putri memiliki absensi tinggi (7 hari)',
      time: '1 jam yang lalu',
      icon: '⏰',
      read: false,
    },
    {
      id: 3,
      title: 'Laporan Selesai',
      description: 'Laporan konseling Budi Santoso telah selesai',
      time: '2 jam yang lalu',
      icon: '📋',
      read: false,
    },
    {
      id: 4,
      title: 'Siswa Baru Ditambahkan',
      description: 'Linda Kartika telah ditambahkan ke sistem',
      time: '3 jam yang lalu',
      icon: '👤',
      read: true,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-30">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-2.5 md:ml-64">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {isMobile && (
              <button 
                onClick={onMenuClick}
                className="p-1 hover:bg-gray-100 rounded md:hidden flex-shrink-0"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
              <p className="text-xs md:text-sm text-gray-500 truncate">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {/* Search - hidden on mobile */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari siswa..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 md:w-64"
              />
            </div>

            {/* Notification */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setProfileOpen(false);
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
                      <span className="text-sm font-medium text-red-500">3 Baru</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className="w-full p-4 hover:bg-gray-50 text-left transition-colors flex items-start gap-3 border-l-4 border-transparent hover:border-indigo-500"
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
                      ))}
                    </div>

                    <div className="p-3 border-t border-gray-200 flex gap-2 sticky bottom-0 bg-white">
                      <button className="flex-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
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
                  setProfileOpen(!profileOpen);
                  setNotificationOpen(false);
                }}
                className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                IB
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
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                          IB
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Ibu Sarah Wijaya</h3>
                          <p className="text-blue-100 text-sm">Guru BK Senior</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={16} />
                          <span>sarah.wijaya@school.ac.id</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>+62 812-3456-7890</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                        <User size={18} className="text-indigo-600" />
                        <div>
                          <p className="font-medium">Profil Saya</p>
                          <p className="text-xs text-gray-500">Lihat dan edit profil</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                        <Settings size={18} className="text-purple-600" />
                        <div>
                          <p className="font-medium">Pengaturan</p>
                          <p className="text-xs text-gray-500">Kelola preferensi akun</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left">
                        <HelpCircle size={18} className="text-teal-600" />
                        <div>
                          <p className="font-medium">Bantuan & Dukungan</p>
                          <p className="text-xs text-gray-500">FAQ dan kontak support</p>
                        </div>
                      </button>

                      <div className="border-t border-gray-200 my-2"></div>

                      <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
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
      </div>
    </header>
  );
};

export default Header;
