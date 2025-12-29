'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Copy, Check } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface Emoji {
  id: number
  emoji: string
  name: string
  category: string
  keywords?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const EmojiLibraryPage: React.FC = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [newEmoji, setNewEmoji] = useState({ emoji: '', name: '', category: 'smileys', keywords: '', isActive: true })

  const categoryLabels: Record<string, string> = {
    all: 'Semua',
    smileys: '😊 Senyuman & Wajah',
    hand: '👋 Tangan',
    heart: '❤️ Hati & Cinta',
    food: '🍕 Makanan',
    activity: '⚽ Aktivitas',
    travel: '🚀 Travel & Tempat',
    objects: '📚 Objek',
    symbols: '🔣 Simbol',
    other: '➕ Lainnya',
  }

  // Fetch emojis
  const fetchEmojis = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/emojis`) // Fetch ALL emojis (active and inactive)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setEmojis(data)
    } catch (error) {
      console.error('Error fetching emojis:', error)
      alert('Gagal mengambil emoji')
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/emojis/categories`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setAllCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchEmojis()
    fetchCategories()
  }, [])

  const handleAddEmoji = async () => {
    if (!newEmoji.emoji.trim() || !newEmoji.name.trim()) {
      alert('Emoji dan nama tidak boleh kosong')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      let response: Response
      if (editingId) {
        // Update
        response = await fetch(`${API_URL}/emojis/${editingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(newEmoji),
        })
      } else {
        // Create
        response = await fetch(`${API_URL}/emojis`, {
          method: 'POST',
          headers,
          body: JSON.stringify(newEmoji),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Gagal menyimpan emoji')
      }

      alert(editingId ? 'Emoji berhasil diperbarui' : 'Emoji berhasil ditambahkan')
      setNewEmoji({ emoji: '', name: '', category: 'smileys', keywords: '', isActive: true })
      setShowAddModal(false)
      setEditingId(null)
      fetchEmojis()
      fetchCategories()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Gagal menyimpan emoji')
    }
  }

  const handleEditEmoji = (emoji: Emoji) => {
    setNewEmoji({
      emoji: emoji.emoji,
      name: emoji.name,
      category: emoji.category,
      keywords: emoji.keywords || '',
      isActive: emoji.isActive,
    })
    setEditingId(emoji.id)
    setShowAddModal(true)
  }

  const handleDeleteEmoji = async (id: number) => {
    if (!confirm('Hapus emoji ini?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/emojis/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete')
      alert('Emoji berhasil dihapus')
      fetchEmojis()
      fetchCategories()
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menghapus emoji')
    }
  }

  const handleCopyEmoji = (emoji: string, id: number) => {
    navigator.clipboard.writeText(emoji)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingId(null)
    setNewEmoji({ emoji: '', name: '', category: 'smileys', keywords: '', isActive: true })
  }

  const categories = ['all', ...allCategories]

  const filteredEmojis = emojis.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.emoji.includes(searchQuery) ||
      (e.keywords && e.keywords.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Emoji Library</h2>
          <p className="text-gray-600 text-sm mt-1">Kelola emoji untuk digunakan di chat dan aplikasi ({emojis.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          <span>Tambah Emoji</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari emoji atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-max"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Emoji Grid */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : filteredEmojis.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Tidak ada emoji ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredEmojis.map((emoji) => (
            <div
              key={emoji.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition group relative"
            >
              {/* Status Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-3 h-3 rounded-full ${emoji.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={emoji.isActive ? 'Aktif' : 'Nonaktif'} />
              </div>

              <div className="aspect-square flex items-center justify-center text-4xl mb-2 rounded-lg bg-gray-50 group-hover:bg-indigo-50">
                {emoji.emoji}
              </div>
              <p className="text-xs font-medium text-gray-900 truncate text-center">{emoji.name}</p>
              <p className="text-xs text-gray-500 text-center mb-2">{categoryLabels[emoji.category] || emoji.category}</p>
              <div className="flex gap-1">
                <button
                  onClick={() => handleCopyEmoji(emoji.emoji, emoji.id)}
                  className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition"
                  title="Copy emoji"
                >
                  {copiedId === emoji.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleEditEmoji(emoji)}
                  className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition"
                  title="Edit emoji"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteEmoji(emoji.id)}
                  className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  title="Delete emoji"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Emoji Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Emoji' : 'Tambah Emoji'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEmoji.emoji}
                    onChange={(e) => setNewEmoji({ ...newEmoji, emoji: e.target.value })}
                    maxLength={2}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-2xl text-center"
                    placeholder="😀"
                  />
                  <div className="text-4xl flex items-center">{newEmoji.emoji || '—'}</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Salin emoji dari internet dan paste di sini</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama *</label>
                <input
                  type="text"
                  value={newEmoji.name}
                  onChange={(e) => setNewEmoji({ ...newEmoji, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Grinning Face"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={newEmoji.category}
                  onChange={(e) => setNewEmoji({ ...newEmoji, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="smileys">😊 Senyuman & Wajah</option>
                  <option value="hand">👋 Tangan</option>
                  <option value="heart">❤️ Hati & Cinta</option>
                  <option value="food">🍕 Makanan</option>
                  <option value="activity">⚽ Aktivitas</option>
                  <option value="travel">🚀 Travel & Tempat</option>
                  <option value="objects">📚 Objek</option>
                  <option value="symbols">🔣 Simbol</option>
                  <option value="other">➕ Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kata Kunci (opsional)</label>
                <input
                  type="text"
                  value={newEmoji.keywords}
                  onChange={(e) => setNewEmoji({ ...newEmoji, keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="bahagia, senyum"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newEmoji.isActive}
                  onChange={(e) => setNewEmoji({ ...newEmoji, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktifkan emoji ini
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddEmoji}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {editingId ? 'Update Emoji' : 'Tambah Emoji'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiLibraryPage