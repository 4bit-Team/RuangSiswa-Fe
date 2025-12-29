'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Search, AlertTriangle } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface ToxicWord {
  id: number
  word: string
  severity: 'low' | 'medium' | 'high'
  replacement: string
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

interface Statistics {
  totalFilters: number
  activeFilters: number
  bySeveity: {
    low: number
    medium: number
    high: number
  }
}

const FilterToxicPage: React.FC = () => {
  const [toxicWords, setToxicWords] = useState<ToxicWord[]>([])
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'keywords' | 'chat' | 'konseling'>('keywords')
  const [newWord, setNewWord] = useState({
    word: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    replacement: '***',
    description: '',
    isActive: true,
  })

  // Fetch toxic filters
  const fetchToxicFilters = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/toxic-filters`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setToxicWords(data)
    } catch (error) {
      console.error('Error fetching toxic filters:', error)
      alert('Gagal mengambil data filter')
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/toxic-filters/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchToxicFilters()
    fetchStats()
  }, [])

  const handleAddWord = async () => {
    if (!newWord.word.trim()) {
      alert('Kata tidak boleh kosong')
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
        // Update existing
        response = await fetch(`${API_URL}/toxic-filters/${editingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(newWord),
        })
      } else {
        // Create new
        response = await fetch(`${API_URL}/toxic-filters`, {
          method: 'POST',
          headers,
          body: JSON.stringify(newWord),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Gagal menyimpan kata')
      }

      alert(editingId ? 'Kata berhasil diperbarui' : 'Kata berhasil ditambahkan')
      setNewWord({ word: '', severity: 'medium', replacement: '***', description: '', isActive: true })
      setShowAddModal(false)
      setEditingId(null)
      fetchToxicFilters()
      fetchStats()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Gagal menyimpan kata')
    }
  }

  const handleEditWord = (word: ToxicWord) => {
    setNewWord({
      word: word.word,
      severity: word.severity,
      replacement: word.replacement,
      description: word.description || '',
      isActive: word.isActive,
    })
    setEditingId(word.id)
    setShowAddModal(true)
  }

  const handleDeleteWord = async (id: number) => {
    if (!confirm('Hapus kata ini dari filter?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/toxic-filters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to delete')
      alert('Kata berhasil dihapus')
      fetchToxicFilters()
      fetchStats()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Gagal menghapus kata')
    }
  }

  const handleToggleActive = async (word: ToxicWord) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_URL}/toxic-filters/${word.id}`,
        {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: !word.isActive })
        }
      )
      if (!response.ok) throw new Error('Failed to update')
      fetchToxicFilters()
      fetchStats()
    } catch (error) {
      console.error('Error toggling:', error)
      alert('Gagal mengubah status')
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingId(null)
    setNewWord({ word: '', severity: 'medium', replacement: '***', description: '', isActive: true })
  }

  const filteredWords = toxicWords.filter((w) =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const severityColors: Record<string, string> = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Filter Konten Toxic</h2>
          <p className="text-gray-600 text-sm mt-1">Pantau dan filter konten berbahaya</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          <span>Tambah Kata</span>
        </button>
      </div>

      {/* Statistics */}
      {stats && activeTab === 'keywords' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">Total Filter</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalFilters}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">Filter Aktif</p>
            <p className="text-3xl font-bold text-green-600">{stats.activeFilters}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">Tingkat Tinggi</p>
            <p className="text-3xl font-bold text-red-600">{stats.bySeveity.high}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">Tingkat Sedang</p>
            <p className="text-3xl font-bold text-orange-600">{stats.bySeveity.medium}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'keywords'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Keyword Filter ({toxicWords.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'chat'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Chat Monitor
        </button>
        <button
          onClick={() => setActiveTab('konseling')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'konseling'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Konseling Monitor
        </button>
      </div>

      {activeTab === 'keywords' && (
        <>
          {/* Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Toxic Words Grid */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredWords.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>Tidak ada kata ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((word) => (
                <div key={word.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900 break-words">{word.word}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${severityColors[word.severity]}`}>
                          {word.severity.charAt(0).toUpperCase() + word.severity.slice(1)}
                        </span>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${word.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {word.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      {word.description && (
                        <p className="text-xs text-gray-600 mt-2">{word.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Pengganti: <code className="bg-gray-100 px-1">{word.replacement}</code></p>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditWord(word)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleActive(word)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title={word.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {word.isActive ? '✓' : '✗'}
                      </button>
                      <button
                        onClick={() => handleDeleteWord(word.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'chat' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Monitoring</h3>
          <p className="text-gray-600">
            Sistem secara otomatis mendeteksi dan mengganti pesan yang mengandung kata-kata toxic di tab "Keyword Filter" di atas.
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900">
              ✓ Fitur monitoring chat sudah aktif dan terintegrasi dengan sistem chat secara real-time.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'konseling' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Konseling Monitoring</h3>
          <p className="text-gray-600">
            Fitur monitoring sesi konseling akan segera diimplementasikan. Admin dapat memantau interaksi konseling untuk memastikan kualitas layanan.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 Fitur ini membantu dalam quality assurance dan training konselor.
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Toxic Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Kata Toxic' : 'Tambah Kata Toxic'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kata Kunci *</label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Masukkan kata yang ingin difilter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Keparahan</label>
                <select
                  value={newWord.severity}
                  onChange={(e) => setNewWord({ ...newWord, severity: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teks Pengganti</label>
                <input
                  type="text"
                  value={newWord.replacement}
                  onChange={(e) => setNewWord({ ...newWord, replacement: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="***"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi (opsional)</label>
                <input
                  type="text"
                  value={newWord.description}
                  onChange={(e) => setNewWord({ ...newWord, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Alasan filter kata ini..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newWord.isActive}
                  onChange={(e) => setNewWord({ ...newWord, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktifkan filter ini
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
                onClick={handleAddWord}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {editingId ? 'Update Kata' : 'Tambah Kata'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterToxicPage
