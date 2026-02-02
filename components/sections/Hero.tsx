import React from 'react'
import { ChevronRight, Sparkles, ArrowDown, ArrowRight, BarChart3, CheckCircle, MessageCircle, Trophy, Zap } from 'lucide-react'
const Hero = () => {

  return (
    <section className="relative w-full overflow-hidden py-0">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .hero-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-pattern {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0.1;
          background-image: 
            repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px),
            repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px);
        }
        .hero-circles {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          border: 2px solid rgba(255,255,255,0.2);
        }
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        .slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }
      `}</style>
      
      <div className="hero-section">
        {/* Pattern Background */}
        <div className="hero-pattern absolute inset-0"></div>
        
        {/* Decorative Circles */}
        <div className="hero-circles">
          <div className="circle w-96 h-96 top-[-10%] left-[-5%]" style={{borderColor: 'rgba(34, 211, 238, 0.3)'}}></div>
          <div className="circle w-80 h-80 top-[10%] right-[5%]" style={{borderColor: 'rgba(59, 130, 246, 0.3)'}}></div>
          <div className="circle w-72 h-72 bottom-[5%] left-[10%]" style={{borderColor: 'rgba(99, 102, 241, 0.3)'}}></div>
          <div className="circle w-64 h-64 bottom-[-5%] right-[10%]" style={{borderColor: 'rgba(34, 211, 238, 0.25)'}}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div className="slide-in-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-400/20 border border-blue-300/50 text-blue-100 px-6 py-3 rounded-full text-sm font-semibold mb-8 backdrop-blur-md hover:bg-blue-400/30 transition-all">
                <Sparkles className="w-5 h-5" />
                Platform Internal SMK Negeri 1 Cibinong
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                Sistem Manajemen
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">Kesiswaan & BK</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed font-light">
                Aplikasi manajemen terpadu untuk mengelola data siswa, layanan bimbingan konseling, dan kehadiran dengan mudah dan efisien.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a 
                  href="/login" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-bold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:-translate-y-1 flex items-center justify-center gap-2 text-center"
                >
                  <span className="relative flex items-center gap-2">
                    Masuk ke Aplikasi
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                <a 
                  href="#features" 
                  className="px-8 py-4 border-2 border-blue-300 text-blue-100 font-semibold rounded-lg hover:bg-blue-400/20 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  Lihat Fitur
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-cyan-300">21+</div>
                  <div className="text-sm text-blue-100">Fitur Lengkap</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-cyan-300">4</div>
                  <div className="text-sm text-blue-100">Role Akses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-cyan-300">24/7</div>
                  <div className="text-sm text-blue-100">Support</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="slide-in-right hidden lg:block">
              <div className="relative h-[500px] flex flex-col justify-center">
                {/* Floating Card 1 */}
                <div className="absolute -top-4 -left-16 w-56 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-2xl shadow-purple-500/50 transform hover:-translate-y-2 transition-transform animate-float z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Analytics</span>
                  </div>
                  <p className="text-xs opacity-90">Real-time monitoring & reports</p>
                </div>

                {/* Main Card */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/30 p-8 shadow-2xl hover:shadow-3xl hover:border-cyan-400/50 transition-all duration-300 z-20">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Manajemen Siswa</div>
                        <div className="text-blue-200 text-sm">Data lengkap terintegrasi</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Konsultasi Online</div>
                        <div className="text-blue-200 text-sm">Chat, voice & video</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Manajemen Prestasi</div>
                        <div className="text-blue-200 text-sm">Publikasi otomatis</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute -bottom-10 -right-16 w-56 h-32 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-5 text-white shadow-2xl shadow-cyan-500/50 transform hover:-translate-y-2 transition-transform animate-float z-10" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Lightning Fast</span>
                  </div>
                  <p className="text-xs opacity-90">Performa optimal untuk operasional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-blue-200 text-sm">Scroll untuk lanjut</span>
            <ArrowDown className="w-5 h-5 text-cyan-300" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero