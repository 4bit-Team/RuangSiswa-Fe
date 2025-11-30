'use client'

import React, { useEffect, useState } from 'react'
import { Bell, Shield, ChevronRight, Mail, Phone, Calendar, LogOut } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { HistoryItemProps, SettingItemProps } from '@types'
import EditProfileModalButton from './EditProfileModalButton'

// Logo SMKN 1 Cibinong dari public folder
const Smkn1Logo = () => (
  <img src="/logo.svg" alt="SMKN 1 Cibinong" className="w-16 h-16" />
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    fetch(`${apiUrl}/student-card/extracted_data`)
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data: StudentCardData[]) => {
        // ✅ Convert userId ke string untuk comparison dengan user_id dari API
        const userIdStr = userId?.toString();
        console.log(`🔍 [StudentCard] Filtering cards - userId=${userIdStr}, available users:`, data.map(d => d.user_id));
        
        const userCards = data.filter(card => {
          const match = card.user_id?.toString() === userIdStr;
          console.log(`  - Checking card user_id="${card.user_id}" vs "${userIdStr}": ${match ? '✅' : '❌'}`);
          return match;
        });
        
        console.log(`🔍 [StudentCard] Found ${userCards.length} cards for user ${userIdStr}`);
        setCards(userCards);
        if (userCards.length > 0) setSelectedKelas(userCards[0].kelas);
      })
      .catch(err => {
        console.error('Gagal memuat data kartu pelajar:', err);
        setCards([]);
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
      
      {/* Student Card */}
      <div 
        className="w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl relative"
        style={{
          backgroundImage: 'url(/frame.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          aspectRatio: '16 / 9',
        }}
      >
        {/* Header Section with Logo and Text */}
        <div className="absolute top-0 left-0 right-0 bg-blue-600 px-6 pt-2 pb-4 flex gap-3 justify-center items-start z-20" style={{ backgroundColor: '#3F52DC' }}>
          {/* Logo */}
          <div className="flex-shrink-0 mt-1">
            <img src="/logo.svg" alt="SMKN 1 Cibinong" className="w-16 h-16" />
          </div>

          {/* Header Text */}
          <div className="text-center text-white text-xs font-medium leading-tight max-w-2xl">
            <div>PEMERINTAH DAERAH PROVINSI JAWA BARAT</div>
            <div>DINAS PENDIDIKAN</div>
            <div>CABANG DINAS PENDIDIKAN WILAYAH 1</div>
            <div className="font-bold">SEKOLAH MENENGAH KEJURUAN NEGERI 1 CIBINONG</div>
            <div className="text-xs font-normal mt-1">
              Jl. Karadenan No.7 Cibinong Bogor 16193 • (0251) 866 3846 Fax. (0251) 866 5558
            </div>
            <div className="text-xs font-normal">
              Email: admin@smkn1cibinong.sch.id • Website: www.smkn1cibinong.sch.id
            </div>
          </div>
        </div>

        {/* Title centered at top */}
        <div className="absolute top-36 left-0 right-0 flex justify-center z-10">
          <h2 
            className="font-bold text-5xl"
            style={{
              color: '#FDF05C',
              textShadow: '-1.5px -1.5px 0 #222222, 1.5px -1.5px 0 #222222, -1.5px 1.5px 0 #222222, 1.5px 1.5px 0 #222222, -1px 0 0 #222222, 1px 0 0 #222222, 0 -1px 0 #222222, 0 1px 0 #222222'
            }}
          >
            KARTU PELAJAR
          </h2>
        </div>

        {/* Content layout */}
        <div className="w-full h-full flex items-center p-8 pt-32">
          {/* Left side - Data */}
          <div className="flex-grow">
            <div className="text-lg font-semibold text-black space-y-3">
              <div className="flex">
                <span className="w-24">NAMA</span>
                <span className="mx-2">:</span>
                <span className="flex-grow">{card?.nama || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-24">NIS/NISN</span>
                <span className="mx-2">:</span>
                <span className="flex-grow">{card?.nis || '-'} / {card?.nisn || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-24">T.T.L</span>
                <span className="mx-2">:</span>
                <span className="flex-grow">{card?.ttl || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-24">L / P</span>
                <span className="mx-2">:</span>
                <span className="flex-grow">{genderLabel(card?.gender || '')}</span>
              </div>
              <div className="flex">
                <span className="w-24">KELAS</span>
                <span className="mx-2">:</span>
                <span className="flex-grow">{card?.kelas || '-'}</span>
              </div>
            </div>
          </div>

          {/* Right side - Photo Frame */}
          <div className="flex-shrink-0 ml-8">
            <div className="w-48 h-56 border-4 border-black bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm">Foto</span>
            </div>
          </div>
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
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{user?.phone_number || '-'}</span></div>
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