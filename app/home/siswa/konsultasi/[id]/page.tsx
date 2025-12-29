'use client'

import React, { useState } from 'react'
import DetailKonsultasiPage from '@/components/portal-siswa/pages/DetailKonsultasiPage'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function KonsultasiDetailPage() {
  const [showDetail, setShowDetail] = useState(true)

  if (!showDetail) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Go back button */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/home/siswa/konsultasi"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Daftar Konsultasi
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Go back button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link
          href="/home/siswa/konsultasi"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Kembali ke Daftar Konsultasi
        </Link>
      </div>

      {/* Detail Content */}
      <DetailKonsultasiPage onBack={() => setShowDetail(false)} />
    </div>
  )
}
