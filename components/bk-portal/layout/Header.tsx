'use client'

import React from 'react';
import { HeaderProps } from '@types';
import { apiRequest } from "@/lib/api";

// Top header for BK portal. Left area shows the portal name and current page title;
// right area shows the user avatar / info. Positioned to the right of the sidebar (left-64).
const Header: React.FC<HeaderProps> = ({ title, subtitle, profile }) => {

  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", "POST");

      // Bersihkan penyimpanan frontend
      localStorage.clear();
      sessionStorage.clear();

      // Hapus cookie versi client-side (untuk jaga-jaga)
      document.cookie = "auth_profile=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "access_token=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Redirect paksa
      window.location.replace("/login");
    } catch (err) {
      console.error("Logout gagal:", err);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-20 px-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bimbingan Konseling</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">Portal Siswa</p>
            {/* show page-specific title if provided */}
            {title && <span className="text-sm font-medium text-gray-700">· {title}</span>}
          </div>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 relative">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {profile?.username ? profile.username.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            <button
              className="flex flex-col items-start focus:outline-none"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <span className="font-medium text-gray-900 text-sm">{profile?.username || "Anda"}</span>
              <span className="text-xs text-gray-500">{profile?.role || "Siswa"}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-14 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-semibold">{profile?.username || "Nama"}</div>
                  <div className="text-xs text-gray-500">{profile?.email || "-"}</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">{profile?.role || "Role"}</div>
                </div>
                <button
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;