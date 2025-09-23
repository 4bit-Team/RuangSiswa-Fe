import React from 'react'
import { GraduationCap, Shield } from 'lucide-react'

const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-12 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">RuangSiswa</h3>
                <p className="text-sm text-gray-400">SMK Negeri 1 Cibinong</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Sistem Informasi Pengembangan Kompetensi dan Kesejahteraan Siswa SMK 
              yang dirancang untuk mengoptimalkan potensi setiap siswa.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Terpercaya & Aman</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Fitur Utama</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Pemetaan Kompetensi</li>
              <li>Monitoring Kemajuan</li>
              <li>Rekomendasi AI</li>
              <li>Matching PKL</li>
              <li>Sertifikasi Digital</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <div className="space-y-2 text-gray-400">
              <p>SMK Negeri 1 Cibinong</p>
              <p>Jl. Karadenan, Cibinong</p>
              <p>Kabupaten Bogor, Jawa Barat</p>
              <p>Email: info@smkn1cibinong.sch.id</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 RuangSiswa. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer