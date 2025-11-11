'use client'

import React from 'react';
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

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => (
  // hidden on small screens; visible and fixed from md+ upwards
  <div className="hidden md:flex w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex-col">
    <div className="p-6 border-b border-gray-200">
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

    <nav className="flex-1 p-4 space-y-1">
      <SidebarItem icon={Home} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
      <SidebarItem icon={Heart} label="Konseling" active={activePage === 'konseling'} onClick={() => setActivePage('konseling')} />
      <SidebarItem icon={MessageCircle} label="Konsultasi" active={activePage === 'konsultasi'} onClick={() => setActivePage('konsultasi')} />
      <SidebarItem icon={Calendar} label="Reservasi" active={activePage === 'reservasi'} onClick={() => setActivePage('reservasi')} />
      <SidebarItem icon={MessageSquare} label="Chat BK" active={activePage === 'chat'} onClick={() => setActivePage('chat')} />
      <SidebarItem icon={User} label="Profil" active={activePage === 'profil'} onClick={() => setActivePage('profil')} />
    </nav>

    <div className="p-4 border-t border-gray-200">
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm font-medium text-gray-900">Butuh bantuan?</p>
        <p className="text-xs text-gray-500 mt-1">Hubungi konselor kami kapan saja</p>
      </div>
    </div>
  </div>
);

export default Sidebar;