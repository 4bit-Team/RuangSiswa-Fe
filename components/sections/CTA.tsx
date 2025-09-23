import React from 'react'

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Mengoptimalkan Potensi Siswa SMK?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Bergabunglah dengan revolusi digital pendidikan SMK. Tingkatkan kompetensi siswa 
            dan siapkan mereka untuk masa depan yang cerah.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Mulai Uji Coba Gratis
            </button>
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