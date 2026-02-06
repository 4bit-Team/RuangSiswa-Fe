'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Shield, ChevronRight, Mail, Phone, Calendar, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'
import { HistoryItemProps, SettingItemProps } from '@types'
import { kelasLabel, genderLabel, fetchStudentCardData, handleLogout, fetchStudentStatistics, fetchCounselingHistory } from '@/lib/profileAPI'
import type { StudentCardData, StudentCardViewProps, HistoryItem } from '@/lib/profileAPI'
import EditProfileModalButton from './EditProfileModalButton'

// Logo SMKN 1 Cibinong dari public folder
const Smkn1Logo = () => (
  <img src="/logo.svg" alt="SMKN 1 Cibinong" className="w-16 h-16" />
);

const StudentCardView: React.FC<StudentCardViewProps> = ({ userId }) => {
  const [cards, setCards] = useState<StudentCardData[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');

  useEffect(() => {
    fetchStudentCardData(userId).then(userCards => {
      setCards(userCards);
      if (userCards.length > 0) setSelectedKelas(userCards[0].kelas);
    });
  }, [userId]);

  const kelasOptions = Array.from(new Set(cards.map(card => card.kelas)));
  const card = cards.find(c => c.kelas === selectedKelas);

  if (!userId) return null;

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center w-full py-8">
        <div className="w-full max-w-md p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-600 font-medium">📋 Kartu pelajar belum diverifikasi</p>
          <p className="text-xs text-blue-500 mt-2">Silakan upload kartu pelajar Anda di halaman verifikasi untuk melihatnya di sini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full py-4 sm:py-6 md:py-8 px-2 sm:px-4">
      <div className="mb-4 sm:mb-6 md:mb-8 w-full max-w-xs sm:max-w-md">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
        <div className="relative">
          <select
            className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-white text-xs sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
            value={selectedKelas}
            onChange={e => setSelectedKelas(e.target.value)}
          >
            {kelasOptions.map(kelas => (
              <option key={kelas} value={kelas}>{kelasLabel(kelas)}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md px-0 sm:px-2">
        <div 
          className="w-full rounded-lg overflow-hidden shadow-lg relative mx-auto"
          style={{
            backgroundImage: 'url(/frame.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            aspectRatio: '16 / 9',
            maxWidth: '100%',
          }}
        >
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 px-1 sm:px-2 py-0.5 sm:py-1 flex flex-col gap-0.5 sm:gap-1 justify-start items-start z-30">
            <img src="/logo.svg" alt="SMKN 1 Cibinong" className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10" />
            <p className="text-[0.35rem] sm:text-[0.55rem] md:text-xs font-bold text-white leading-tight">PEMERINTAH DAERAH PROVINSI JAWA BARAT</p>
            <p className="text-[0.35rem] sm:text-[0.55rem] md:text-xs text-white leading-tight">DINAS PENDIDIKAN</p>
            <p className="text-[0.35rem] sm:text-[0.55rem] md:text-xs text-white leading-tight">CABANG DINAS PENDIDIKAN WILAYAH 1</p>
          </div>

          <div className="absolute top-[50%] sm:top-[55%] md:top-[60%] left-0 right-0 flex justify-center z-10 px-2">
            <h2 
              className="font-bold text-center"
              style={{
                fontSize: 'clamp(12px, 2.8vw, 24px)',
                color: '#FDF05C',
                textShadow: '-1px -1px 0 #222222, 1px -1px 0 #222222, -1px 1px 0 #222222, 1px 1px 0 #222222',
              }}
            >
              KARTU PELAJAR
            </h2>
          </div>

          <div className="w-full h-full flex items-end px-1 sm:px-1.5 md:px-2 pb-1.5 sm:pb-2 md:pb-3">
            <div className="flex-grow min-w-0">
              <div className="text-black space-y-0.25 sm:space-y-0.5">
                <div className="flex flex-wrap gap-0.25 sm:gap-0.5" style={{ fontSize: 'clamp(7px, 1.8vw, 12px)' }}>
                  <span className="font-semibold w-14 sm:w-16 md:w-20 flex-shrink-0">NAMA</span>
                  <span className="hidden sm:inline mx-0.25 sm:mx-0.5">:</span>
                  <span className="flex-grow break-words min-w-0">{card?.nama || '-'}</span>
                </div>
                <div className="flex flex-wrap gap-0.25 sm:gap-0.5" style={{ fontSize: 'clamp(7px, 1.8vw, 12px)' }}>
                  <span className="font-semibold w-14 sm:w-16 md:w-20 flex-shrink-0">NIS/NISN</span>
                  <span className="hidden sm:inline mx-0.25 sm:mx-0.5">:</span>
                  <span className="flex-grow break-words min-w-0">{card?.nis || '-'} / {card?.nisn || '-'}</span>
                </div>
                <div className="flex flex-wrap gap-0.25 sm:gap-0.5" style={{ fontSize: 'clamp(7px, 1.8vw, 12px)' }}>
                  <span className="font-semibold w-14 sm:w-16 md:w-20 flex-shrink-0">T.T.L</span>
                  <span className="hidden sm:inline mx-0.25 sm:mx-0.5">:</span>
                  <span className="flex-grow break-words min-w-0">{card?.ttl || '-'}</span>
                </div>
                <div className="flex flex-wrap gap-0.25 sm:gap-0.5" style={{ fontSize: 'clamp(7px, 1.8vw, 12px)' }}>
                  <span className="font-semibold w-14 sm:w-16 md:w-20 flex-shrink-0">L / P</span>
                  <span className="hidden sm:inline mx-0.25 sm:mx-0.5">:</span>
                  <span className="flex-grow min-w-0">{genderLabel(card?.gender || '')}</span>
                </div>
                <div className="flex flex-wrap gap-0.25 sm:gap-0.5" style={{ fontSize: 'clamp(7px, 1.8vw, 12px)' }}>
                  <span className="font-semibold w-14 sm:w-16 md:w-20 flex-shrink-0">KELAS</span>
                  <span className="hidden sm:inline mx-0.25 sm:mx-0.5">:</span>
                  <span className="flex-grow min-w-0">{card?.kelas || '-'}</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 ml-1 sm:ml-1.5 md:ml-2">
              <div 
                className="border border-black bg-gray-300 flex items-center justify-center flex-shrink-0"
                style={{
                  width: 'clamp(40px, 10vw, 80px)',
                  height: 'clamp(50px, 13vw, 105px)',
                }}
              >
                <span className="text-gray-600" style={{ fontSize: 'clamp(6px, 1.5vw, 10px)' }}>Foto</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryItemComponent: React.FC<HistoryItemProps> = ({ title, counselor, date, status, statusColor }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-100">
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{counselor} • {date}</p>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor} bg-opacity-10`}>{status}</span>
  </div>
)

const SettingItem: React.FC<SettingItemProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </div>
)

const ProfilPage: React.FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalConsultations: 0,
    totalConsultationHours: 0
  })
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const match = document.cookie.match(/auth_profile=([^;]+)/)
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1]))
        setUser(parsed)
      }
    } catch (err) {
      console.error('Gagal memuat profil dari cookie:', err)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchStudentStatistics(user.id).then(setStats)
      fetchCounselingHistory(user.id, 5).then(setHistory)
    }
  }, [user])

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-4xl text-white font-bold">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.username || 'Nama belum diatur'}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{user?.kelas ? `Kelas ${user.kelas.nama}` : 'Kelas'}</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{user?.nomor_induk || 'ID tidak tersedia'}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{user?.email || '-'}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{user?.phone_number || '-'}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> <span>Bergabung sejak {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Januari 2024'}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <EditProfileModalButton user={user} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">{stats.totalSessions}</div>
            <div>
              <p className="text-sm text-gray-500">Konseling</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold">{stats.totalConsultations}</div>
            <div>
              <p className="text-sm text-gray-500">Konsultasi</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold">{stats.totalConsultationHours}</div>
            <div>
              <p className="text-sm text-gray-500">Jam Konseling</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg border border-gray-200">
          <h3 className="p-4 font-semibold text-gray-900 border-b border-gray-100">Riwayat Konseling</h3>
          <div>
            {history.length > 0 ? (
              history.map((item) => (
                <HistoryItemComponent 
                  key={item.id}
                  title={item.title}
                  counselor={item.counselor}
                  date={item.date}
                  status={item.status}
                  statusColor={item.statusColor}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Belum ada riwayat konseling</p>
              </div>
            )}
          </div>
          <div className="p-4">
            <button 
              onClick={() => router.push('/home/siswa/reservasi')}
              className="w-full py-3 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50">
              Lihat Semua Riwayat
            </button>
          </div>
        </div>
        {/* Kartu Pelajar Siswa dipindah ke bawah riwayat konseling */}
        {user?.id && (
          <StudentCardView userId={user.id} />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-900 p-4 border-b border-gray-200">Pengaturan</h3>
        <div>
          <SettingItem icon={Bell} label="Notifikasi" />
          <SettingItem icon={Shield} label="Privasi & Keamanan" />
          <div className="border-t mt-2">
            <button onClick={handleLogout} className="w-full text-left px-4 py-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors duration-200">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilPage