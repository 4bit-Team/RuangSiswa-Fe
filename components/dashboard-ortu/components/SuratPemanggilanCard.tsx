'use client'

import { Calendar, MapPin, ChevronRight, AlertCircle } from 'lucide-react'

interface PembinaanOrtu {
  id: number
  student_name: string
  student_class: string
  violation_details: string
  letter_content: string
  scheduled_date: Date | string
  scheduled_time?: string
  location?: string
  status: 'pending' | 'sent' | 'read' | 'responded' | 'closed'
  createdAt: Date | string
}

interface Props {
  pembinaan: PembinaanOrtu
  onViewDetail: (pembinaan: PembinaanOrtu) => void
  getStatusBadge: (status: string) => React.ReactNode
}

const SuratPemanggilanCard = ({ pembinaan, onViewDetail, getStatusBadge }: Props) => {
  const scheduledDate = new Date(pembinaan.scheduled_date)
  const formattedDate = scheduledDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
      case 'sent':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
      case 'read':
        return 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100'
      case 'responded':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100'
      case 'closed':
        return 'border-green-200 bg-green-50 hover:bg-green-100'
      default:
        return 'border-slate-200 bg-white'
    }
  }

  return (
    <div className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${getStatusColor(pembinaan.status)}`}>
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-current border-opacity-10">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-slate-900">{pembinaan.student_name}</h3>
          <p className="text-sm text-slate-600">Kelas {pembinaan.student_class}</p>
        </div>
        <div className="flex-shrink-0">{getStatusBadge(pembinaan.status)}</div>
      </div>

      {/* Body */}
      <div className="mt-4 space-y-4">
        {/* Violation Details */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Detail Pelanggaran</p>
          <p className="text-sm text-slate-700 line-clamp-2">{pembinaan.violation_details}</p>
        </div>

        {/* Schedule Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{formattedDate}</span>
            {pembinaan.scheduled_time && <span className="text-slate-500">• {pembinaan.scheduled_time}</span>}
          </div>

          {pembinaan.location && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>{pembinaan.location}</span>
            </div>
          )}
        </div>

        {/* Alert for pending */}
        {pembinaan.status === 'pending' && (
          <div className="flex items-start gap-2 p-2 bg-yellow-100 rounded">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700">Menunggu surat dikirim</p>
          </div>
        )}

        {/* Alert for action needed */}
        {pembinaan.status === 'sent' && (
          <div className="flex items-start gap-2 p-2 bg-blue-100 rounded">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">Silakan baca surat dan berikan respons</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onViewDetail(pembinaan)}
          className={`w-full mt-4 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            pembinaan.status === 'pending'
              ? 'border border-current border-opacity-30 text-slate-700 hover:bg-current hover:bg-opacity-10'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <span>Lihat Detail</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default SuratPemanggilanCard
