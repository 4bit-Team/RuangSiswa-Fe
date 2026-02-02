"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-lg shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  RuangSiswa
                </h1>
                <p className="text-xs text-gray-500">SMK Negeri 1 Cibinong</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-gray-700 font-medium hover:text-blue-600 transition-colors duration-200">
                Fitur
              </a>
              <a href="#userRoles" className="text-gray-700 font-medium hover:text-blue-600 transition-colors duration-200">
                Role Pengguna
              </a>
              <a href="#footer" className="text-gray-700 font-medium hover:text-blue-600 transition-colors duration-200">
                Kontak
              </a>
              <div className="w-px h-6 bg-gray-200"></div>
              <Link href="/login" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md">
                Masuk
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="border-t border-gray-200 md:hidden pb-4">
              <div className="px-2 py-4 space-y-3">
                <a href="#features" className="block text-gray-700 font-medium hover:text-blue-600 py-2 px-2 transition-colors rounded-lg hover:bg-gray-100">
                  Fitur
                </a>
                <a href="#userRoles" className="block text-gray-700 font-medium hover:text-blue-600 py-2 px-2 transition-colors rounded-lg hover:bg-gray-100">
                  Role Pengguna
                </a>
                <a href="#footer" className="block text-gray-700 font-medium hover:text-blue-600 py-2 px-2 transition-colors rounded-lg hover:bg-gray-100">
                  Kontak
                </a>
                <Link href="/login" className="block w-full px-6 py-2.5 bg-blue-600 text-white font-medium text-center rounded-lg hover:bg-blue-700 transition-all duration-200 mt-2">
                  Masuk
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar