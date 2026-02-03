import React from 'react'
import { GraduationCap, Shield, Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Github, Zap, ArrowRight } from 'lucide-react'

const Footer = () => {
  return (
    <footer id="footer" className="bg-gradient-to-b from-gray-900 to-gray-950 text-white scroll-mt-20 relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        {/* Center subtle accent */}
        <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="footerAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.12)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.04)" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="60" fill="none" stroke="url(#footerAccent)" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative">
        {/* CTA Band */}
        <div className="border-b border-gray-800 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, label: "Response Cepat", desc: "Dukungan teknis dalam hitungan menit" },
                { icon: Shield, label: "Aman & Terpercaya", desc: "Enkripsi data tingkat enterprise" },
                { icon: GraduationCap, label: "Khusus SMK", desc: "Dirancang untuk kebutuhan SMK modern" }
              ].map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={index} className="flex items-start gap-4 group cursor-default">
                    <div className="w-12 h-12 bg-blue-600/30 rounded-lg flex items-center justify-center group-hover:bg-blue-600/50 transition-colors duration-300 flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{item.label}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-lg shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">RuangSiswa</h3>
                  <p className="text-xs text-gray-400">SMK Negeri 1 Cibinong</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Aplikasi internal untuk SMK Negeri 1 Cibinong — mendukung operasional manajemen kesiswaan dan bimbingan konseling sekolah.
              </p>
              {/* Social Media */}
              <div className="flex items-center gap-4">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Github, label: "GitHub" }
                ].map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Produk</h4>
              <ul className="space-y-3">
                {["Portal Siswa", "Dashboard BK", "Dashboard Kesiswaan", "Admin Panel"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Resources</h4>
              <ul className="space-y-3">
                {["Dokumentasi", "Tutorial Video", "FAQ", "Contact Support"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Hubungi Kami</h4>
              <div className="space-y-4">
                <a href="#" className="flex items-start gap-3 group cursor-pointer hover:text-blue-400 transition-colors">
                  <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400 group-hover:text-blue-300">Jl. Karadenan, Cibinong<br/>Kabupaten Bogor, Jawa Barat</span>
                </a>
                <a href="mailto:info@smkn1cibinong.sch.id" className="flex items-center gap-3 group cursor-pointer hover:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400 group-hover:text-blue-300">info@smkn1cibinong.sch.id</span>
                </a>
                <a href="tel:+6221" className="flex items-center gap-3 group cursor-pointer hover:text-blue-400 transition-colors">
                  <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400 group-hover:text-blue-300">+62 (21) xxx-xxxx</span>
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 py-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <p className="text-gray-400 text-sm">
                © 2025 RuangSiswa. Semua hak dilindungi.
              </p>

              {/* Newsletter signup */}
              <div className="md:col-span-1 hidden md:block">
                <p className="text-xs text-gray-500 mb-2">Berlangganan update terbaru</p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email Anda"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 rounded-lg text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Kirim
                  </button>
                </form>
              </div>

              {/* Legal Links */}
              <div className="flex flex-wrap justify-end gap-4 text-xs text-gray-500">
                <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                <span>•</span>
                <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-blue-400" />
            Dikembangkan dengan dedikasi untuk pendidikan SMK Indonesia
            <Zap className="w-3 h-3 text-blue-400" />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer