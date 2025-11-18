'use client'

import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onMenuClick }) => {
  const [isMobile, setIsMobile] = useState(true);

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
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Avatar */}
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              IB
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
