'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Users, MessageCircle, FileText, Newspaper, BarChart3, Settings, Menu, X, Calendar, CheckCircle, Clock, AlertTriangle, Trophy } from 'lucide-react';

interface SidebarProps {
  pathname?: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ pathname = '', sidebarOpen, setSidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if mobile on mount
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Auto-show sidebar on desktop, auto-hide on mobile
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile, setSidebarOpen]);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', href: '/home/kesiswaan' },
    { id: 'kehadiran', icon: CheckCircle, label: 'Kehadiran Kelas', href: '/home/kesiswaan/kehadiran' },
    { id: 'keterlambatan', icon: Clock, label: 'Keterlambatan Masuk', href: '/home/kesiswaan/keterlambatan' },
    { id: 'pelanggaran', icon: AlertTriangle, label: 'Pencatatan Pelanggaran', href: '/home/kesiswaan/pelanggaran' },
    { id: 'statusBimbingan', icon: Calendar, label: 'Status Bimbingan', href: '/home/kesiswaan/statusbimbingan' },
  ];

  return (
    <>
      {/* Overlay on mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col fixed left-0 top-0 h-screen z-40`}>
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">KS</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Kesiswaan</h2>
                <p className="text-xs text-gray-500">Portal Siswa</p>
              </div>
            </div>
          )}
          {isMobile && sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-1 hover:bg-gray-100 rounded md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => {
              if (window.innerWidth < 768) {
                setSidebarOpen(false)
              }
            }}
          >
            {item.icon && <item.icon size={20} />}
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <span className="text-sm">👋</span>
          {sidebarOpen && <span className="text-sm">Butuh bantuan?</span>}
        </button>
      </div>
    </aside>
    </>
  );
};
export default Sidebar;
