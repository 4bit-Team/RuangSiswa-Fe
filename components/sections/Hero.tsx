import React from 'react'
import { ChevronRight, Zap } from 'lucide-react'

const Hero = () => {
  const stats = [
    { number: "14+", label: "Modul Terintegrasi" },
    { number: "4", label: "Jenis User Role" },
    { number: "100%", label: "Digital Solution" },
    { number: "24/7", label: "Akses Sistem" }
  ]

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Sistem Informasi Terdepan untuk SMK
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sistem Informasi
            <span className="text-gradient-text block leading-tight md:leading-tight text-blue-600">
              Pengembangan Kompetensi
            </span>
            <span className="text-3xl md:text-4xl text-gray-700">
              & Kesejahteraan Siswa SMK
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Platform digital terintegrasi untuk mengoptimalkan pengembangan kompetensi siswa SMK 
            melalui pemetaan skill, monitoring kemajuan, dan layanan pendukung komprehensif
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-primary">
              Mulai Sekarang
              <ChevronRight className="w-5 h-5 inline ml-2" />
            </button>
            <button className="btn-secondary">
              Lihat Demo
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero