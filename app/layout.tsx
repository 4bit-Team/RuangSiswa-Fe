import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RuangSiswa - Sistem Informasi Pengembangan Kompetensi & Kesejahteraan Siswa',
  description: 'Platform digital terintegrasi untuk mengoptimalkan pengembangan kompetensi siswa SMK Negeri 1 Cibinong',
  keywords: 'SMK, RuangSiswa, Pendidikan, Kompetensi Siswa, SMK Negeri 1 Cibinong',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}