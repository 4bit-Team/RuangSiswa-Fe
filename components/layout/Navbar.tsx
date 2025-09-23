'use client'

import React, { useState } from 'react'
import { GraduationCap, Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  RuangSiswa
                </h1>
                <p className="text-xs text-gray-600">SMK Negeri 1 Cibinong</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Fitur
              </a>
              <a href="#userRoles" className="text-gray-600 hover:text-blue-600 transition-colors">
                Role
              </a>
              <a href="#footer" className="text-gray-600 hover:text-blue-600 transition-colors">
                Kontak
              </a>
              <button className="btn-primary">
                Login
              </button>
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 absolute w-full z-40">
          <div className="px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-blue-600">
              Fitur
            </a>
            <a href="#userRoles" className="block text-gray-600 hover:text-blue-600">
              Role
            </a>
            <a href="#footer" className="block text-gray-600 hover:text-blue-600">
              Kontak
            </a>
            <button className="w-full btn-primary">
              Login
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar