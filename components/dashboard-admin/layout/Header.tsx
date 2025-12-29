'use client'

import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/api'

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick }) => {
  const [user, setUser] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

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
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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

          {/* Profile Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              {!isMobile && (
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@ruangsiswa.com'}</p>
                  </div>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                    <User size={16} />
                    <span className="text-sm">Profil</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                    <Settings size={16} />
                    <span className="text-sm">Pengaturan</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
