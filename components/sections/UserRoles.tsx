import React from 'react'
import { Users } from 'lucide-react'
import type { UserRole } from '@/types'

const UserRoles = () => {
  const userRoles: UserRole[] = [
    { role: "Admin", color: "bg-red-500", description: "Pengelolaan sistem menyeluruh" },
    { role: "Guru", color: "bg-blue-500", description: "Manajemen pembelajaran dan evaluasi" },
    { role: "Siswa", color: "bg-green-500", description: "Akses pembelajaran dan portofolio" },
    { role: "Kesiswaan", color: "bg-purple-500", description: "Layanan kemahasiswaan" },
    { role: "BK", color: "bg-orange-500", description: "Bimbingan konseling dan karir" }
  ]

  return (
    <section id="userRoles" className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            5 Tingkat Akses Pengguna
          </h2>
          <p className="text-xl text-gray-600">
            Sistem yang disesuaikan untuk setiap peran dalam ekosistem pendidikan SMK
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {userRoles.map((user, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className={`${user.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{user.role}</h3>
              <p className="text-gray-600 text-sm">{user.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UserRoles