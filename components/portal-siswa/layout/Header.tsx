'use client'

import React from 'react';
import { HeaderProps } from '@types';

const Header: React.FC<HeaderProps & { onToggleSidebar?: () => void }> = ({ title, subtitle, profile, onToggleSidebar }) => {

  const [showDropdown, setShowDropdown] = React.useState(false);

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
    <header className="fixed top-0 right-0 left-0 md:left-64 z-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-20 px-4 md:px-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {/* mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle sidebar"
              onClick={handleToggleSidebar}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">Bimbingan Konseling</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">Portal Siswa</p>
                {/* show page-specific title if provided */}
                {title && <span className="text-sm font-medium text-gray-700">· {title}</span>}
              </div>
              {/* hide subtitle on small screens to reduce crowding */}
              {subtitle && <p className="hidden md:block text-xs text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 relative">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {profile?.username ? profile.username.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            {/* avatar-only button on very small screens */}
            <button
              className="sm:hidden p-1 focus:outline-none"
              onClick={() => setShowDropdown((prev) => !prev)}
              aria-label="Open profile menu"
            />
            {/* name + role hidden on very small screens to avoid wrapping */}
            <button
              className="hidden sm:flex flex-col items-start focus:outline-none"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <span className="font-medium text-gray-900 text-sm">{profile?.username || "Anda"}</span>
              <span className="text-xs text-gray-500">{profile?.role || "Siswa"}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {profile?.username ? profile.username.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">{profile?.username || 'Nama'}</div>
                    <div className="text-xs text-gray-500 mt-1">{profile?.email || '-'}</div>
                    <div className="mt-2">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{profile?.role || 'Siswa'}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-3 py-2 bg-gray-50 flex gap-2">
                  <a href="/portal-bk/profil" className="flex-1 text-center text-sm py-2 rounded-md hover:bg-gray-100">Lihat Profil</a>
                  <a href="/portal-bk/profil" className="flex-1 text-center text-sm py-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50">Edit Profil</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;