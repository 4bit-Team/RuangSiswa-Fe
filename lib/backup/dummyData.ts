/**
 * Dummy Data Generator
 * This utility provides dummy data for all modules when no real data is fetched from the API
 */

// ==================== TYPE DEFINITIONS ====================

interface AttendanceRecord {
  id: number
  studentId: number
  studentName: string
  className: string
  date: string
  status: string
  time?: string
  notes?: string
}

interface AttendanceStats {
  totalHadir: number
  totalSakit: number
  totalIzin: number
  totalAlpa: number
  attendancePercentage: number
}

interface TardinessRecord {
  id: number
  studentId: number
  studentName: string
  className: string
  date: string
  time: string
  minutesLate: number
  reason?: string
  status: 'recorded' | 'verified' | 'appealed' | 'resolved'
}

interface TardinessStats {
  totalTardiness: number
  thisMonth: number
  averageMinutes: number
  longestLate: number
}

// ==================== ATTENDANCE DUMMY DATA ====================

export const generateDummyAttendanceRecords = (): AttendanceRecord[] => [
  {
    id: 1,
    studentId: 1,
    studentName: 'Ahmad Ridho Pratama',
    className: 'XI-RPL-A',
    date: '2025-02-01',
    status: 'Hadir',
    time: '07:00',
    notes: '',
  },
  {
    id: 2,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    className: 'XI-TKJ-B',
    date: '2025-02-01',
    status: 'Sakit',
    time: '07:15',
    notes: 'Terkena flu',
  },
  {
    id: 3,
    studentId: 3,
    studentName: 'Budi Santoso',
    className: 'XI-MM-C',
    date: '2025-02-01',
    status: 'Hadir',
    time: '06:55',
    notes: '',
  },
  {
    id: 4,
    studentId: 4,
    studentName: 'Nur Azizah',
    className: 'XI-RPL-A',
    date: '2025-02-01',
    status: 'Izin',
    time: '',
    notes: 'Izin mengurus keluarga',
  },
  {
    id: 5,
    studentId: 5,
    studentName: 'Eka Pratama',
    className: 'XI-TKJ-B',
    date: '2025-02-01',
    status: 'Alpa',
    time: '',
    notes: '',
  },
  {
    id: 6,
    studentId: 1,
    studentName: 'Ahmad Ridho Pratama',
    className: 'XI-RPL-A',
    date: '2025-02-02',
    status: 'Hadir',
    time: '07:05',
    notes: '',
  },
  {
    id: 7,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    className: 'XI-TKJ-B',
    date: '2025-02-02',
    status: 'Hadir',
    time: '07:20',
    notes: '',
  },
  {
    id: 8,
    studentId: 3,
    studentName: 'Budi Santoso',
    className: 'XI-MM-C',
    date: '2025-02-02',
    status: 'Hadir',
    time: '07:00',
    notes: '',
  },
  {
    id: 9,
    studentId: 4,
    studentName: 'Nur Azizah',
    className: 'XI-RPL-A',
    date: '2025-02-02',
    status: 'Hadir',
    time: '07:10',
    notes: '',
  },
  {
    id: 10,
    studentId: 5,
    studentName: 'Eka Pratama',
    className: 'XI-TKJ-B',
    date: '2025-02-02',
    status: 'Sakit',
    time: '',
    notes: 'Sakit kepala',
  },
]

export const generateDummyAttendanceStats = (): AttendanceStats => ({
  totalHadir: 18,
  totalSakit: 2,
  totalIzin: 1,
  totalAlpa: 1,
  attendancePercentage: 75,
})

// ==================== VIOLATION DUMMY DATA ====================

interface ViolationRecordLocal {
  id: number
  studentId: number
  studentName: string
  nisn: string
  className: string
  date: string
  type: 'Pelanggaran Ringan' | 'Pelanggaran Sedang' | 'Pelanggaran Berat'
  description: string
  consequence: string
  witness?: string
  notes?: string
}

export const generateDummyViolationRecords = (): ViolationRecordLocal[] => [
  {
    id: 1,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nisn: '0031234568',
    className: 'XI-TKJ-B',
    date: '2025-01-20',
    type: 'Pelanggaran Ringan',
    description: 'Terlambat masuk kelas 15 menit',
    consequence: '1 poin',
    witness: 'Bapak Bambang',
    notes: 'Karena macet di jalan',
  },
  {
    id: 2,
    studentId: 3,
    studentName: 'Budi Santoso',
    nisn: '0031234569',
    className: 'XI-MM-C',
    date: '2025-01-25',
    type: 'Pelanggaran Ringan',
    description: 'Seragam tidak rapi',
    consequence: '1 poin',
    witness: 'Ibu Sarah',
    notes: 'Diperingatkan untuk perbaikan',
  },
  {
    id: 3,
    studentId: 5,
    studentName: 'Eka Pratama',
    nisn: '0031234571',
    className: 'XI-TKJ-B',
    date: '2025-01-28',
    type: 'Pelanggaran Sedang',
    description: 'Membolos pada mata pelajaran Matematika',
    consequence: '3 poin',
    witness: 'Ibu Dewi',
    notes: 'Siswa tidak ada keterangan, ditemukan di luar sekolah',
  },
  {
    id: 4,
    studentId: 1,
    studentName: 'Ahmad Ridho Pratama',
    nisn: '0031234567',
    className: 'XI-RPL-A',
    date: '2025-02-01',
    type: 'Pelanggaran Ringan',
    description: 'Menggunakan hp di kelas',
    consequence: '2 poin',
    witness: 'Pak Gunawan',
    notes: 'Gadget disita dan dikembalikan setelah sekolah',
  },
  {
    id: 5,
    studentId: 4,
    studentName: 'Nur Azizah',
    nisn: '0031234570',
    className: 'XI-RPL-A',
    date: '2025-02-03',
    type: 'Pelanggaran Sedang',
    description: 'Berkelahi dengan siswa lain',
    consequence: '5 poin',
    witness: 'Bapak Hendra, Ibu Siti',
    notes: 'Kedua siswa diminta untuk menjalani konseling',
  },
  {
    id: 6,
    studentId: 5,
    studentName: 'Eka Pratama',
    nisn: '0031234571',
    className: 'XI-TKJ-B',
    date: '2025-02-05',
    type: 'Pelanggaran Berat',
    description: 'Merokok di lingkungan sekolah',
    consequence: '8 poin',
    witness: 'Bapak Bambang',
    notes: 'Orang tua dipanggil, SP 1 diberikan',
  },
]

interface ViolationStats {
  totalViolations: number
  lightViolations: number
  mediumViolations: number
  severeViolations: number
}

export const generateDummyViolationStats = (): ViolationStats => ({
  totalViolations: 6,
  lightViolations: 3,
  mediumViolations: 2,
  severeViolations: 1,
})

// ==================== TARDINESS DUMMY DATA ====================

export const generateDummyTardinessRecords = (): TardinessRecord[] => [
  {
    id: 1,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    className: 'XI-TKJ-B',
    date: '2025-02-01',
    time: '07:15',
    minutesLate: 15,
    reason: 'Macet di jalan menuju sekolah',
    status: 'resolved',
  },
  {
    id: 2,
    studentId: 1,
    studentName: 'Ahmad Ridho Pratama',
    className: 'XI-RPL-A',
    date: '2025-02-02',
    time: '07:20',
    minutesLate: 20,
    reason: 'Bangun terlambat',
    status: 'resolved',
  },
  {
    id: 3,
    studentId: 5,
    studentName: 'Eka Pratama',
    className: 'XI-TKJ-B',
    date: '2025-02-03',
    time: '07:30',
    minutesLate: 30,
    reason: 'Antar jemput terlambat',
    status: 'verified',
  },
  {
    id: 4,
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    className: 'XI-TKJ-B',
    date: '2025-02-04',
    time: '07:10',
    minutesLate: 10,
    reason: 'Macet di persimpangan',
    status: 'recorded',
  },
  {
    id: 5,
    studentId: 4,
    studentName: 'Nur Azizah',
    className: 'XI-RPL-A',
    date: '2025-02-05',
    time: '07:25',
    minutesLate: 25,
    reason: 'Kegiatan pagi di rumah',
    status: 'verified',
  },
  {
    id: 6,
    studentId: 1,
    studentName: 'Ahmad Ridho Pratama',
    className: 'XI-RPL-A',
    date: '2025-02-06',
    time: '07:05',
    minutesLate: 5,
    reason: 'Jam tangan terlambat',
    status: 'resolved',
  },
]

export const generateDummyTardinessStats = (): TardinessStats => ({
  totalTardiness: 6,
  thisMonth: 6,
  averageMinutes: 18,
  longestLate: 30,
})

// ==================== DASHBOARD DUMMY DATA ====================

interface ProblemRecord {
  id: number
  category: 'Presensi' | 'Disiplin' | 'Akademik'
  description: string
  referenceFrom: string
  problemType: 'Attendance' | 'Discipline' | 'Academic'
  dateReported: string
  resolutionStatus: 'Tuntas' | 'Tidak Tuntas'
  guidanceHistory: Array<{
    id: number
    date: string
    counselor: string
    notes: string
  }>
  followUpActions: Array<{
    id: number
    type: 'Pangilan Orang Tua' | 'Home Visit' | 'Konferensi Kasus'
    date: string
    description: string
    result: string
    status: 'Terjadwal' | 'Selesai' | 'Ditunda'
  }>
  referralStatus?: 'Belum' | 'Dirujuk' | 'Ditangani Ahli'
}

interface DashboardItem {
  id: number
  studentName: string
  nisn: string
  className: string
  jurusan: string
  status: 'Aktif' | 'Nonaktif'
  phoneNumber: string
  dateOfBirth: string
  address: string
  parentName: string
  parentPhone: string
  totalAttendance: number
  totalTardiness: number
  totalViolations: number
  guidanceStatus: 'Normal' | 'Peringatan' | 'Perlu Tindak Lanjut'
  problemRecords: ProblemRecord[]
}

export const generateDummyDashboardStudents = (): DashboardItem[] => [
  {
    id: 1,
    studentName: 'Ahmad Ridho Pratama',
    nisn: '0031234567',
    className: 'XI-RPL-A',
    jurusan: 'RPL',
    status: 'Aktif',
    phoneNumber: '085123456789',
    dateOfBirth: '2007-05-15',
    address: 'Jl. Merdeka No. 45, Jakarta Selatan',
    parentName: 'Budi Pratama',
    parentPhone: '081234567890',
    totalAttendance: 95,
    totalTardiness: 3,
    totalViolations: 0,
    guidanceStatus: 'Normal',
    problemRecords: [],
  },
  {
    id: 2,
    studentName: 'Siti Nurhaliza',
    nisn: '0031234568',
    className: 'XI-TKJ-B',
    jurusan: 'TKJ',
    status: 'Aktif',
    phoneNumber: '085234567890',
    dateOfBirth: '2007-08-22',
    address: 'Jl. Ahmad Yani No. 12, Bandung',
    parentName: 'Heru Wijaya',
    parentPhone: '081345678901',
    totalAttendance: 85,
    totalTardiness: 8,
    totalViolations: 1,
    guidanceStatus: 'Peringatan',
    problemRecords: [
      {
        id: 1,
        category: 'Presensi',
        description: 'Sering terlambat masuk sekolah',
        referenceFrom: 'Wali Kelas',
        problemType: 'Attendance',
        dateReported: '2025-01-20',
        resolutionStatus: 'Tidak Tuntas',
        guidanceHistory: [
          {
            id: 1,
            date: '2025-01-25',
            counselor: 'Bu Sarah Wijaya',
            notes: 'Sesi pertama bimbingan, mengidentifikasi penyebab keterlambatan',
          },
        ],
        followUpActions: [
          {
            id: 1,
            type: 'Pangilan Orang Tua',
            date: '2025-02-01',
            description: 'Menghubungi orang tua untuk diskusi masalah keterlambatan',
            result: 'Orang tua setuju membantu mengatasi',
            status: 'Selesai',
          },
        ],
        referralStatus: 'Belum',
      },
    ],
  },
  {
    id: 3,
    studentName: 'Budi Santoso',
    nisn: '0031234569',
    className: 'XI-MM-C',
    jurusan: 'MM',
    status: 'Aktif',
    phoneNumber: '085345678901',
    dateOfBirth: '2007-03-10',
    address: 'Jl. Sudirman No. 88, Tangerang',
    parentName: 'Suyanto',
    parentPhone: '081456789012',
    totalAttendance: 92,
    totalTardiness: 4,
    totalViolations: 0,
    guidanceStatus: 'Normal',
    problemRecords: [],
  },
  {
    id: 4,
    studentName: 'Nur Azizah',
    nisn: '0031234570',
    className: 'XI-RPL-A',
    jurusan: 'RPL',
    status: 'Aktif',
    phoneNumber: '085456789012',
    dateOfBirth: '2007-06-18',
    address: 'Jl. Reformasi No. 23, Jakarta Timur',
    parentName: 'Bambang Wijaya',
    parentPhone: '081567890123',
    totalAttendance: 88,
    totalTardiness: 6,
    totalViolations: 2,
    guidanceStatus: 'Perlu Tindak Lanjut',
    problemRecords: [
      {
        id: 2,
        category: 'Disiplin',
        description: 'Berselisih dengan teman sekelas',
        referenceFrom: 'Guru Mapel',
        problemType: 'Discipline',
        dateReported: '2025-02-03',
        resolutionStatus: 'Tidak Tuntas',
        guidanceHistory: [
          {
            id: 1,
            date: '2025-02-04',
            counselor: 'Bapak Hendra',
            notes: 'Penggalian informasi tentang permasalahan dengan teman',
          },
        ],
        followUpActions: [
          {
            id: 1,
            type: 'Konferensi Kasus',
            date: '2025-02-07',
            description: 'Pertemuan dengan guru dan orang tua untuk solusi',
            result: 'Belum terlaksana',
            status: 'Terjadwal',
          },
        ],
        referralStatus: 'Belum',
      },
    ],
  },
  {
    id: 5,
    studentName: 'Eka Pratama',
    nisn: '0031234571',
    className: 'XI-TKJ-B',
    jurusan: 'TKJ',
    status: 'Aktif',
    phoneNumber: '085567890123',
    dateOfBirth: '2007-09-28',
    address: 'Jl. Sudirman Barat No. 99, Depok',
    parentName: 'Rahmat Taufik',
    parentPhone: '081678901234',
    totalAttendance: 80,
    totalTardiness: 12,
    totalViolations: 3,
    guidanceStatus: 'Perlu Tindak Lanjut',
    problemRecords: [],
  },
]

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  rplStudents: number
  tkjStudents: number
}

export const generateDummyDashboardStats = (students: DashboardItem[]): DashboardStats => ({
  totalStudents: students.length,
  activeStudents: students.filter((s) => s.status === 'Aktif').length,
  rplStudents: students.filter((s) => s.jurusan === 'RPL').length,
  tkjStudents: students.filter((s) => s.jurusan === 'TKJ').length,
})
