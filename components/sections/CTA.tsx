import React from 'react'
import { ArrowRight, CheckCircle, Zap, Shield, Sparkles } from 'lucide-react'

const CTA = () => {
  return (
    <section className="relative overflow-hidden">
      <style>{`
        .cta-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
          position: relative;
          width: 100%;
          padding: 6rem 0;
        }
        .cta-pattern {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.08;
          background-image: 
            repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px),
            repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px);
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideInUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      
      <div className="cta-section relative">
        {/* Pattern overlay */}
        <div className="cta-pattern absolute inset-0"></div>
        
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-bl from-cyan-300 to-blue-400 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400 to-blue-300 rounded-full blur-3xl opacity-20"></div>
        </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left side - Content */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 px-6 py-3 rounded-full text-sm font-bold mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              Fitur Unggulan
            </div>

            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Kelola Kesiswaan & BK
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">dengan Lebih Efisien</span>
            </h2>

            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Satu platform untuk mengelola data siswa, layanan bimbingan konseling, dan kehadiran sekolah dengan terintegrasi.
            </p>

            {/* Benefits list */}
            <div className="space-y-4 mb-12">
              {[
                "Kelola data siswa secara terpusat",
                "Layanan konseling terintegrasi dengan mudah",
                "Laporan kehadiran real-time dan akurat"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <span className="text-lg text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a 
                href="/login" 
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-1 flex items-center justify-center gap-2 inline-flex"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Masuk Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>

            {/* Features badges */}
            <div className="flex flex-wrap gap-6 pt-8 border-t border-white/20">
              {[
                { icon: Shield, label: "Data Aman" },
                { icon: Zap, label: "Performa Cepat" },
                { icon: CheckCircle, label: "Reliable 99.9%" }
              ].map((badge, index) => {
                const IconComponent = badge.icon
                return (
                  <div key={index} className="flex items-center gap-2 text-blue-100">
                    <IconComponent className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold">{badge.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative hidden md:flex md:justify-center md:items-start w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full max-w-lg pt-12 pb-16">
              {/* Floating card 1 - Hidden on mobile */}
              <div className="hidden lg:block absolute -top-12 -left-16 w-56 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-2xl shadow-cyan-500/50 p-5 text-white transform hover:-translate-y-2 transition-transform duration-300 animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Real-time</span>
                </div>
                <p className="text-blue-100 text-xs leading-relaxed">Data terupdate setiap saat untuk monitoring siswa</p>
              </div>

              {/* Floating card 2 - Hidden on mobile */}
              <div className="hidden lg:block absolute -bottom-12 -right-16 w-56 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/50 p-5 text-white transform hover:-translate-y-2 transition-transform duration-300 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="font-bold">Integrasi</span>
                </div>
                <p className="text-purple-100 text-xs leading-relaxed">Satu platform untuk semua kebutuhan</p>
              </div>

              {/* Main card */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/30 shadow-2xl p-8 md:p-10 hover:shadow-3xl hover:border-cyan-400/50 transition-all duration-300">
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-cyan-400 rounded-full opacity-20 blur-xl"></div>
                <div className="relative z-10">
                  <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    {[
                      { number: "21+", label: "Fitur Lengkap" },
                      { number: "100%", label: "Integrasi" },
                      { number: "4", label: "Role Akses" },
                      { number: "24/7", label: "Support" }
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-1">{stat.number}</div>
                        <div className="text-xs md:text-sm text-blue-200">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 md:pt-6 border-t border-white/20">
                    <p className="text-blue-200 text-center text-xs md:text-sm font-semibold">Untuk SMK Negeri 1 Cibinong</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

export default CTA 