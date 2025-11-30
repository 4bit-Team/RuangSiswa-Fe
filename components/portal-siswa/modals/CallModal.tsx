'use client'

import React, { useState } from 'react'
import { Phone, Video, MoreVertical, X } from 'lucide-react'

interface CallModalProps {
  isOpen: boolean
  onClose: () => void
  counselorName?: string
  counselorInitial?: string
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  counselorName = 'Bu Sarah',
  counselorInitial = 'S',
}) => {
  const [selectedCallType, setSelectedCallType] = useState<'phone' | 'video' | null>(null)
  const [isInCall, setIsInCall] = useState(false)

  const handleStartCall = (type: 'phone' | 'video') => {
    setSelectedCallType(type)
    setIsInCall(true)
  }

  const handleEndCall = () => {
    setIsInCall(false)
    setSelectedCallType(null)
    setTimeout(onClose, 300)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              {selectedCallType === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isInCall ? 'Sedang Menelepon' : 'Mulai Percakapan'}
              </h2>
              <p className="text-emerald-100 text-sm">Hubungi {counselorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!isInCall ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl text-white font-bold">{counselorInitial}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{counselorName}</h3>
                <p className="text-sm text-gray-600 mt-1">Konselor BK</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleStartCall('phone')}
                  className="group p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <Phone className="w-8 h-8 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-semibold text-gray-900">Telepon</h4>
                  <p className="text-xs text-gray-600 mt-1">Panggilan suara</p>
                </button>

                <button
                  onClick={() => handleStartCall('video')}
                  className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <Video className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-semibold text-gray-900">Video Call</h4>
                  <p className="text-xs text-gray-600 mt-1">Wajah ke wajah</p>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-semibold text-blue-900 mb-2">💡 Tips</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Pastikan perangkat Anda dalam kondisi siap</li>
                  <li>• Cari tempat yang nyaman dan tenang</li>
                  <li>• Koneksi internet harus stabil</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className={`w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse`}>
                  <span className="text-5xl text-white font-bold">{counselorInitial}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{counselorName}</h3>
                <p className="text-emerald-600 font-medium mt-2">Panggilan sedang berjalan...</p>
                
                <div className="mt-6 text-3xl font-mono font-bold text-gray-700">
                  <span id="call-duration">00:00</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button className="p-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-gray-900">
                  <Phone className="w-6 h-6 rotate-90" />
                </button>
                <button
                  onClick={handleEndCall}
                  className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-300 flex items-center justify-center text-white shadow-lg"
                >
                  <Phone className="w-6 h-6 rotate-135" />
                </button>
                <button className="p-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 flex items-center justify-center text-gray-700 hover:text-gray-900">
                  <MoreVertical className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-sm text-emerald-700">
                  Tekan tombol merah untuk mengakhiri panggilan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CallModal
