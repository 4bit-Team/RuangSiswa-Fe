"use client"

import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Calendar, MessageSquare, User, Home } from 'lucide-react';
import { SidebarItemProps, SidebarProps } from '@types';

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((v) => !v);
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // ensure mobile overlay is closed on larger screens
        setIsOpen(false);
      }
    };

    window.addEventListener('toggleSidebar', handleToggle as EventListener);
    window.addEventListener('resize', handleResize);

    // initial sync with document class
    try {
      if (document.documentElement.classList.contains('sidebar-open')) setIsOpen(true);
    } catch (e) {
      // ignore
    }

    return () => {
      window.removeEventListener('toggleSidebar', handleToggle as EventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // keep document class in sync with state
  useEffect(() => {
    try {
      document.documentElement.classList.toggle('sidebar-open', isOpen);
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  const navContent = (
    <>
      <nav className="flex-1 p-4 space-y-1">
        <SidebarItem icon={Home} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
        <SidebarItem icon={User} label="Berita" active={activePage === 'berita'} onClick={() => setActivePage('berita')} />
        <SidebarItem icon={Heart} label="Konseling" active={activePage === 'konseling'} onClick={() => setActivePage('konseling')} />
        <SidebarItem icon={MessageCircle} label="Konsultasi" active={activePage === 'konsultasi'} onClick={() => setActivePage('konsultasi')} />
        <SidebarItem icon={Calendar} label="Reservasi Saya" active={activePage === 'reservasi'} onClick={() => setActivePage('reservasi')} />
        <SidebarItem icon={MessageSquare} label="Chat BK" active={activePage === 'chat'} onClick={() => setActivePage('chat')} />
        <SidebarItem icon={User} label="Profil" active={activePage === 'profil'} onClick={() => setActivePage('profil')} />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900">Butuh bantuan?</p>
          <p className="text-xs text-gray-500 mt-1">Hubungi konselor kami kapan saja</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
        {/* backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* panel */}
        <div className={`absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <h2 className="font-semibold">BK Portal</h2>
                <p className="text-xs text-gray-500">Sekolah Anda</p>
              </div>
            </div>
            <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setIsOpen(false)} aria-label="Close sidebar">
              ✕
            </button>
          </div>

          {navContent}
        </div>
      </div>

      {/* Desktop sidebar (show header + navContent) */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex-col">
        {/* top header area for desktop so title/logo isn't missing */}
        <div className="h-20 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">BK Portal</h1>
              <p className="text-xs text-gray-500">Sekolah Anda</p>
            </div>
          </div>
        </div>

        {navContent}
      </div>
    </>
  );
};

export default Sidebar;