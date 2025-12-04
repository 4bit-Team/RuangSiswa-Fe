'use client'

import React, { useState, useEffect } from 'react';
import { Home, Users, MessageCircle, FileText, Newspaper, BarChart3, Settings, Menu, X, Calendar, CheckCircle, Clock, AlertTriangle, Trophy } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, sidebarOpen, setSidebarOpen }) => {
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
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'siswa', icon: Users, label: 'Daftar Siswa' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'persetujuan', icon: CheckCircle, label: 'Persetujuan Reservasi' },
    // Divider for management section
    { id: 'divider1', icon: null, label: 'MANAJEMEN DATA', isDivider: true },
    { id: 'kehadiran', icon: CheckCircle, label: 'Kehadiran Kelas' },
    { id: 'keterlambatan', icon: Clock, label: 'Keterlambatan' },
    { id: 'siswaBermasalah', icon: AlertTriangle, label: 'Siswa Bermasalah' },
    { id: 'siswaBerprestasi', icon: Trophy, label: 'Siswa Berprestasi' },
    // Divider for reporting section
    { id: 'divider2', icon: null, label: 'LAPORAN & KONTEN', isDivider: true },
    { id: 'laporan', icon: FileText, label: 'Laporan' },
    { id: 'berita', icon: Newspaper, label: 'Berita' },
    { id: 'statistik', icon: BarChart3, label: 'Statistik' },
    { id: 'pengaturan', icon: Settings, label: 'Pengaturan' },
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
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">BK</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">BK Portal</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
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
        {menuItems.map((item) => {
          // Render divider
          if (item.isDivider) {
            return (
              <div key={item.id} className="pt-3 pb-2">
                {sidebarOpen && (
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                )}
              </div>
            )
          }
          // Render menu item
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activePage === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon && <item.icon size={20} />}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
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
