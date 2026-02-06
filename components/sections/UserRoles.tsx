"use client"

import React, { useState } from 'react'
import { Shield, GraduationCap, Briefcase, Users, ChevronRight } from 'lucide-react'
import type { UserRole } from '@/types'

const UserRoles = () => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  const userRoles = [
    { 
      role: "Admin", 
      icon: Shield,
      color: "red",
      description: "Mengelola sistem, user, dan konfigurasi aplikasi",
      features: ["Manajemen User", "Konfigurasi Sistem", "Laporan Komprehensif", "Backup & Recovery"]
    },
    { 
      role: "Siswa", 
      icon: GraduationCap,
      color: "green",
      description: "Mengakses portal pribadi dan layanan konseling online",
      features: ["Dashboard Personal", "Konsultasi Online", "Chat dengan BK", "Lihat Berita"]
    },
    { 
      role: "Kesiswaan", 
      icon: Briefcase,
      color: "purple",
      description: "Mengelola kehadiran, keterlambatan, dan monitoring siswa",
      features: ["Input Kehadiran", "Monitoring Keterlambatan", "Laporan Kesiswaan", "Publikasi Berita"]
    },
    { 
      role: "BK", 
      icon: Users,
      color: "orange",
      description: "Mengelola konseling, monitoring siswa, dan dokumentasi kasus",
      features: ["Dashboard Konseling", "Monitoring Siswa", "Dokumentasi Case", "Chat Kolaborasi"]
    }
  ]

  return (
    <section id="userRoles" className="relative scroll-mt-20 overflow-hidden">
      <style>{`
        .roles-section {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
          position: relative;
          width: 100%;
          padding: 6rem 0;
        }
        .roles-pattern {
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
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideInDown 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      
      <div className="roles-section relative">
        {/* Pattern overlay */}
        <div className="roles-pattern absolute inset-0"></div>
        
        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-300 to-red-500 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-purple-300 to-blue-400 rounded-full blur-3xl opacity-15"></div>
        </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-slide-down" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
            Hak Akses Pengguna
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Setiap pengguna memiliki akses sesuai perannya dengan fitur-fitur khusus untuk mendukung tugas operasional
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-slide-down" style={{ animationDelay: '0.2s' }}>
          {userRoles.map((user, index) => {
            const IconComponent = user.icon
            const isHovered = hoveredRole === user.role
            const colorMap: any = {
              red: { bg: 'bg-red-500/20', border: 'border-red-400', text: 'text-red-300', light: 'from-red-500/10', gradient: 'from-red-400 to-red-600' },
              green: { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-300', light: 'from-emerald-500/10', gradient: 'from-emerald-400 to-teal-600' },
              purple: { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-300', light: 'from-purple-500/10', gradient: 'from-purple-400 to-pink-600' },
              orange: { bg: 'bg-orange-500/20', border: 'border-orange-400', text: 'text-orange-300', light: 'from-orange-500/10', gradient: 'from-orange-400 to-red-600' }
            }
            const colors = colorMap[user.color]

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredRole(user.role)}
                onMouseLeave={() => setHoveredRole(null)}
                className={`group relative rounded-2xl border-2 p-8 transition-all duration-300 transform backdrop-blur-md ${
                  isHovered ? `${colors.border} -translate-y-4 shadow-2xl shadow-blue-500/40 bg-white/15` : `border-white/20 bg-white/10 hover:border-white/30`
                }`}
              >
                {/* Gradient background for hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>

                {/* Icon container */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-6 group-hover:scale-125 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Role name */}
                <h3 className="text-2xl font-black text-white mb-2">{user.role}</h3>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-6 text-blue-100 transition-colors duration-300">
                  {user.description}
                </p>

                {/* Features list */}
                <div className={`space-y-2 overflow-hidden transition-all duration-300 ${isHovered ? 'max-h-64' : 'max-h-0'}`}>
                  {user.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-2 text-sm text-cyan-200 animate-slide-down" style={{ animationDelay: `${fIndex * 50}ms` }}>
                      <ChevronRight className={`w-4 h-4 ${colors.text} flex-shrink-0 font-bold`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Hover indicator */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r ${colors.gradient} transition-all duration-300 ${isHovered ? 'h-1' : 'h-0'}`}></div>
              </div>
            )
          })}
        </div>

        {/* Permission Matrix */}
        <div className="mt-24 pt-16 border-t border-white/20 animate-slide-down" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black text-white mb-3">Akses & Permission Matrix</h3>
            <p className="text-blue-200">Lihat detailed permission untuk setiap role di sistem</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-white/20 shadow-2xl backdrop-blur-md bg-white/10">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-bold">Modul / Fitur</th>
                  <th className="text-center py-4 px-6 font-bold">
                    <div className="flex flex-col items-center gap-1">
                      <Shield className="w-5 h-5" />
                      <span className="text-xs">Admin</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-bold">
                    <div className="flex flex-col items-center gap-1">
                      <GraduationCap className="w-5 h-5" />
                      <span className="text-xs">Siswa</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-bold">
                    <div className="flex flex-col items-center gap-1">
                      <Briefcase className="w-5 h-5" />
                      <span className="text-xs">Kesiswaan</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 font-bold">
                    <div className="flex flex-col items-center gap-1">
                      <Users className="w-5 h-5" />
                      <span className="text-xs">BK</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {[
                  { feature: "Dashboard", admin: true, siswa: true, kesiswaan: true, bk: true },
                  { feature: "Manajemen User", admin: true, siswa: false, kesiswaan: false, bk: false },
                  { feature: "Konsultasi Online", admin: false, siswa: true, kesiswaan: false, bk: true },
                  { feature: "Input Kehadiran", admin: true, siswa: true, kesiswaan: true, bk: false },
                  { feature: "Monitoring Siswa", admin: true, siswa: false, kesiswaan: true, bk: true },
                  { feature: "Laporan & Analitik", admin: true, siswa: false, kesiswaan: true, bk: true },
                  { feature: "Publikasi Konten", admin: true, siswa: false, kesiswaan: true, bk: true }
                ].map((row, index) => (
                  <tr key={index} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10 hover:bg-blue-500/20'}`}>
                    <td className="py-4 px-6 text-white font-bold">{row.feature}</td>
                    <td className="text-center py-4 px-6">
                      {row.admin ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-400 rounded-full text-slate-900 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-500 font-bold">−</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-6">
                      {row.siswa ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-400 rounded-full text-slate-900 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-500 font-bold">−</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-6">
                      {row.kesiswaan ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-400 rounded-full text-slate-900 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-500 font-bold">−</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-6">
                      {row.bk ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-400 rounded-full text-slate-900 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-500 font-bold">−</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

export default UserRoles