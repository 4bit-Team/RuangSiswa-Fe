'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  Tag,
  Newspaper,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { authStorage } from '@/lib/authStorage'

type CategoryType = 'news' | 'consultation' | 'counseling'

interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
  usageCount: number
  createdAt: string
}

const CategoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryType>('news')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  // Map category types to API endpoints
  const getEndpoint = (type: CategoryType) => {
    switch (type) {
      case 'news':
        return 'news-category'
      case 'consultation':
        return 'consultation-category'
      case 'counseling':
        return 'counseling-category'
    }
  }

  // Load categories
  const loadCategories = async (type: CategoryType = activeTab) => {
    try {
      setLoading(true)
      const token = authStorage.getToken()
      const response = await apiRequest(`/${getEndpoint(type)}`, 'GET', undefined, token)
      setCategories(Array.isArray(response) ? response : response?.data || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      setMessage({ type: 'error', text: 'Gagal memuat kategori' })
    } finally {
      setLoading(false)
    }
  }

  // Load categories when tab changes
  useEffect(() => {
    loadCategories(activeTab)
    resetForm()
  }, [activeTab])

  // Create or update category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Nama kategori tidak boleh kosong' })
      return
    }

    try {
      const token = authStorage.getToken()
      const endpoint = getEndpoint(activeTab)

      if (editingId) {
        await apiRequest(`/${endpoint}/${editingId}`, 'PUT', formData, token)
        setMessage({ type: 'success', text: 'Kategori berhasil diperbarui' })
      } else {
        await apiRequest(`/${endpoint}`, 'POST', formData, token)
        setMessage({ type: 'success', text: 'Kategori berhasil ditambahkan' })
      }

      await loadCategories(activeTab)
      resetForm()
      setIsFormOpen(false)
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Gagal menyimpan kategori' })
    }
  }

  // Delete category
  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return

    try {
      const token = authStorage.getToken()
      await apiRequest(`/${getEndpoint(activeTab)}/${id}`, 'DELETE', undefined, token)
      setMessage({ type: 'success', text: 'Kategori berhasil dihapus' })
      await loadCategories(activeTab)
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'Gagal menghapus kategori' })
    }
  }

  // Edit category
  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({ name: category.name, description: category.description || '' })
    setIsFormOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setEditingId(null)
    setFormData({ name: '', description: '' })
    setIsFormOpen(false)
  }

  const getTabIcon = (type: CategoryType) => {
    switch (type) {
      case 'news':
        return <Newspaper className="w-5 h-5" />
      case 'consultation':
        return <MessageSquare className="w-5 h-5" />
      case 'counseling':
        return <Zap className="w-5 h-5" />
    }
  }

  const getTabLabel = (type: CategoryType) => {
    switch (type) {
      case 'news':
        return 'Kategori Berita'
      case 'consultation':
        return 'Kategori Konsultasi'
      case 'counseling':
        return 'Kategori Konseling'
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-blue-600" />
          Manajemen Kategori
        </h2>
        <p className="text-sm text-gray-600 mt-1">Kelola semua kategori untuk berita, konsultasi, dan konseling</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['news', 'consultation', 'counseling'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium ${
              activeTab === type
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {getTabIcon(type)}
            {getTabLabel(type)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{getTabLabel(activeTab)}</h3>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} />
            Tambah Kategori
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada kategori</p>
            <p className="text-sm text-gray-400">Klik tombol "Tambah Kategori" untuk membuat kategori baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {category.isActive ? '✓ Aktif' : 'Nonaktif'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Digunakan: {category.usageCount} kali
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={resetForm}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama kategori"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi kategori (opsional)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingId ? 'Perbarui' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CategoryPage
