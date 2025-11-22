'use client'

import React, { useState } from 'react'
import { CounselorCardProps } from '@types'
import AppointmentScheduleModal from '../modals/AppointmentScheduleModal'

const CounselorCard: React.FC<CounselorCardProps & { onBook?: () => void }> = ({ initial, name, status, statusColor, specialty, onBook }) => (
  <button 
    onClick={onBook}
    className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white font-semibold">{initial}</span>
      </div>
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900">{name}</h5>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="text-xs text-gray-600">{status}</span>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-600">{specialty}</p>
  </button>
)

const CounselorCardWithModal: React.FC<CounselorCardProps & { selectedTab: string }> = ({ initial, name, status, statusColor, specialty, selectedTab }) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <CounselorCard
        initial={initial}
        name={name}
        status={status}
        statusColor={statusColor}
        specialty={specialty}
        onBook={() => setModalOpen(true)}
      />
      <AppointmentScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        counselingType={selectedTab === 'tatap-muka' ? 'Konseling Tatap Muka' : 'Sesi Chat'}
        counselorName={name}
      />
    </>
  )
}

export default CounselorCardWithModal
