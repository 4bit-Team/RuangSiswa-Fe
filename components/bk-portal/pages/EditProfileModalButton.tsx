'use client'

import React, { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { EditProfileModal } from '../modals'

interface EditProfileModalButtonProps {
  user: any
}

const EditProfileModalButton: React.FC<EditProfileModalButtonProps> = ({ user }) => {
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setEditProfileModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-200"
      >
        <Edit2 className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium">Edit Profil</span>
      </button>
      <EditProfileModal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        currentData={{
          name: user?.username || 'Nama',
          email: user?.email || 'email@example.com',
          phone: user?.phone || '+62-',
          class: user?.kelas?.nama || 'XII IPA 1',
        }}
      />
    </>
  )
}

export default EditProfileModalButton
