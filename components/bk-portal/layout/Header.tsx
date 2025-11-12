'use client'

import React from 'react';
import { HeaderProps } from '../types';

// Top header for BK portal. Left area shows the portal name and current page title;
// right area shows the user avatar / info. Positioned to the right of the sidebar (left-64).
const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
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
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 text-sm">Anda</span>
            <span className="text-xs text-gray-500">Siswa</span>
          </div>
        </div>
      </div>
    </div>
  </header>
)

export default Header;