'use client'

import React, { useState } from 'react'
import { Edit2, Save, Camera, X } from 'lucide-react'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentData?: {
    name?: string
    email?: string
    phone?: string
    class?: string
  }
  onSave?: (data: any) => void
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentData = {
    name: 'Andi Pratama',
    email: 'andi@student.com',
    phone: '+62 812-3456-7890',
    class: 'XII IPA 1',
  },
  onSave,
}) => {
  const [formData, setFormData] = useState(currentData)
  const [isSaved, setIsSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Nama tidak boleh kosong'
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email tidak boleh kosong'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Nomor telepon tidak boleh kosong'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(formData)
      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
        onClose()
      }, 2000)
    }
  }

  const handleClose = () => {
    setIsSaved(false)
    onClose()
  }

  if (!isOpen) return null

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${isSaved ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'} px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                {isSaved ? <Save className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isSaved ? '✅ Profil Diperbarui' : 'Edit Profil'}
                </h2>
                <p className="text-white/80 text-sm">
                  {isSaved ? 'Data Anda telah disimpan dengan sukses' : 'Perbarui informasi pribadi Anda'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!isSaved ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold text-white">
                        {formData.name?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200 group">
                      <Camera className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">Klik kamera untuk mengubah foto</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:ring-indigo-500'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:ring-indigo-500'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.phone
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:ring-indigo-500'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelas
                    </label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Kelas tidak dapat diubah. Hubungi admin untuk perubahan</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center">
                <div className="text-5xl mb-4">✨</div>
                <p className="text-gray-700 mb-4">
                  Profil Anda telah berhasil diperbarui!
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-700 font-medium">Nama Terbaru</p>
                    <p className="text-indigo-600 font-semibold">{formData.name}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">Email</p>
                    <p className="text-purple-600 font-semibold">{formData.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default EditProfileModal
