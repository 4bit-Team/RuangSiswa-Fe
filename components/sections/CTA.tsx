import React from 'react'

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">
            Tingkatkan Pemantauan, Transparansi & Kesejahteraan Siswa SMK
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Platform terintegrasi Kesiswaan & BK untuk pengelolaan yang lebih efisien, data real-time,
            dan kolaborasi lebih baik antara siswa, guru BK, dan bidang kesiswaan.
          </p>
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-2">✨</div>
              <p className="text-blue-100 text-sm">Portal Siswa modern & intuitif</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-2">📊</div>
              <p className="text-blue-100 text-sm">Laporan & analitik mendalam</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-2">🔗</div>
              <p className="text-blue-100 text-sm">Integrasi data seamless</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/login" className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Mulai Sekarang
            </a>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300">
              Hubungi Tim Kami
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA 