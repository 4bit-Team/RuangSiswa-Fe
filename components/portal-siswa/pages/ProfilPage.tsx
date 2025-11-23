'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Shield, ChevronRight, Mail, Phone, Calendar, LogOut } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { HistoryItemProps, SettingItemProps } from '@types'
import EditProfileModalButton from './EditProfileModalButton'

// Logo SMKN 1 Cibinong dari public folder
const Smkn1Logo = () => (
  <img src="@public/logo.svg" alt="logo" className="w-16 h-16" />
);

type StudentCardData = {
  user_id: string;
  kelas: string;
  nama: string;
  nis: string;
  nisn: string;
  ttl: string;
  gender: string;
  jurusan: string;
};

type StudentCardViewProps = {
  userId: string;
};

const kelasLabel = (kelas: string) => {
  if (/10/.test(kelas)) return 'Kelas 10';
  if (/11/.test(kelas)) return 'Kelas 11';
  if (/12/.test(kelas)) return 'Kelas 12';
  return kelas;
};

const genderLabel = (gender: string) => {
  if (!gender) return '-';
  const g = gender.trim().toLowerCase();
  if (g === 'laki-laki' || g === 'l' || g === 'male') return 'L';
  if (g === 'perempuan' || g === 'p' || g === 'female') return 'P';
  return gender;
};

const StudentCardView: React.FC<StudentCardViewProps> = ({ userId }) => {
  const [cards, setCards] = useState<StudentCardData[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');

  useEffect(() => {
    fetch('/api/student_card/extracted_data')
      .then(res => res.json())
      .then((data: StudentCardData[]) => {
        const userCards = data.filter(card => card.user_id === userId);
        setCards(userCards);
        if (userCards.length > 0) setSelectedKelas(userCards[0].kelas);
      });
  }, [userId]);
    console.log('Student cards data:', cards);

  const kelasOptions = Array.from(new Set(cards.map(card => card.kelas)));
  const card = cards.find(c => c.kelas === selectedKelas);

  if (!userId) return null;

  return (
    <div className="flex flex-col items-center w-full py-8">
      <div className="mb-4 w-full max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedKelas}
          onChange={e => setSelectedKelas(e.target.value)}
        >
          {kelasOptions.map(kelas => (
            <option key={kelas} value={kelas}>{kelasLabel(kelas)}</option>
          ))}
        </select>
      </div>
      
      <div className="relative w-full max-w-2xl aspect-video rounded-xl shadow-2xl overflow-hidden bg-white" style={{ maxWidth: '800px' }}>
        {/* Header Biru dengan Info Sekolah */}
        <div className="bg-blue-800 h-24 flex items-start p-4 gap-4">
          <div className="flex-shrink-0">
            <Smkn1Logo />
          </div>
          <div className="flex-grow">
            <div className="text-white text-xs font-bold leading-tight">
              <div>PEMERINTAH DAERAH PROVINSI JAWA BARAT</div>
              <div>DINAS PENDIDIKAN</div>
              <div>CABANG DINAS PENDIDIKAN WILAYAH 1</div>
              <div className="text-yellow-300 font-bold">SEKOLAH MENENGAH KEJURUAN NEGERI 1 CIBINONG</div>
              <div className="text-xs font-normal mt-1">
                Jl. Karadenan No.7 Cibinong Bogor 16193 • (0251) 866 3846 Fax. (0251) 866 5558<br/>
                Email: admin@smkn1cibinong.sch.id • Website: www.smkn1cibinong.sch.id
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex h-32 relative">
          {/* Foto Frame */}
          <div className="flex-shrink-0 w-40 bg-gray-100 border-8 border-gray-300 flex items-center justify-center m-4">
            <span className="text-gray-400 text-xs">Foto</span>
          </div>

          {/* Data Kartu Pelajar */}
          <div className="flex-grow p-4 flex flex-col justify-between">
            {/* Judul dan Jurusan */}
            <div>
              <div className="text-yellow-600 font-bold text-lg tracking-widest">KARTU PELAJAR</div>
              <div className="text-black font-semibold text-sm" style={{ letterSpacing: '0.5px' }}>
                {card?.jurusan?.toUpperCase() || 'JURUSAN'}
              </div>
            </div>

            {/* Data Tabel */}
            <table className="text-xs text-black font-medium w-full">
              <tbody>
                <tr>
                  <td className="align-top font-bold pr-2">NAMA</td>
                  <td className="align-top pr-2">:</td>
                  <td className="align-top">{card?.nama || '-'}</td>
                </tr>
                <tr>
                  <td className="align-top font-bold pr-2">NIS/NISN</td>
                  <td className="align-top pr-2">:</td>
                  <td className="align-top">{card ? `${card.nis} / ${card.nisn}` : '-'}</td>
                </tr>
                <tr>
                  <td className="align-top font-bold pr-2">T.T.L</td>
                  <td className="align-top pr-2">:</td>
                  <td className="align-top">{card?.ttl || '-'}</td>
                </tr>
                <tr>
                  <td className="align-top font-bold pr-2">L / P</td>
                  <td className="align-top pr-2">:</td>
                  <td className="align-top">{card ? genderLabel(card.gender) : '-'}</td>
                </tr>
                <tr>
                  <td className="align-top font-bold pr-2">KELAS</td>
                  <td className="align-top pr-2">:</td>
                  <td className="align-top">{card?.kelas || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Decorative Wave on Right */}
          <svg className="absolute right-0 top-0 h-full w-24 opacity-10" viewBox="0 0 100 200" fill="none">
            <path d="M0,0 Q50,0 100,100 Q50,200 0,200 Z" fill="#2563eb" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const HistoryItem: React.FC<HistoryItemProps> = ({ title, counselor, date, status, statusColor }) => (
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
  const [user, setUser] = useState<any>(null)

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST')
    } catch (err) {
      // ignore errors but continue to clear client state
      console.error('Logout gagal:', err)
    }

    localStorage.clear()
    sessionStorage.clear()

    // clear common cookies (best-effort)
    try {
      document.cookie = 'auth_profile=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'access_token=; path=/; domain=.ruangsiswa.my.id; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch (e) {
      // ignore
    }

    // navigate to login
    window.location.replace('/login')
  }

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
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{user?.phone || '-'}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> <span>Bergabung sejak {user?.joined ? user.joined : 'Januari 2024'}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <EditProfileModalButton user={user} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">12</div>
            <div>
              <p className="text-sm text-gray-500">Total Sesi</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold">8</div>
            <div>
              <p className="text-sm text-gray-500">Konsultasi</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold">18</div>
            <div>
              <p className="text-sm text-gray-500">Jam Konseling</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg border border-gray-200">
          <h3 className="p-4 font-semibold text-gray-900 border-b border-gray-100">Riwayat Konseling</h3>
          <div>
            <HistoryItem title="Konseling Pribadi" counselor="Bu Sarah" date="15 Oktober 2025" status="Selesai" statusColor="text-green-600" />
            <HistoryItem title="Konseling Akademik" counselor="Pak Budi" date="10 Oktober 2025" status="Selesai" statusColor="text-green-600" />
            <HistoryItem title="Konseling Kelompok" counselor="Bu Dina" date="5 Oktober 2025" status="Selesai" statusColor="text-green-600" />
          </div>
          <div className="p-4">
            <button className="w-full py-3 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50">Lihat Semua Riwayat</button>
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