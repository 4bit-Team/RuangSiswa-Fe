'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Eye,
  Trash2,
  Bookmark,
  Loader,
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { generateSlug } from '@/lib/slugify'

interface BookmarkedQuestion {
  id: string
  konsultasiId: string
  title: string
  category: { name: string }
  author: { name: string }
  content: string
  views: number
  answerCount: number
  votes: number
  createdAt: string
  bookmarkedAt?: string
}

const BookmarksPageBK: React.FC = () => {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Fetch bookmarks
  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await apiRequest('/v1/konsultasi/user/bookmarks', 'GET', undefined, token)
      setBookmarks(response?.data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      alert('Gagal mengambil daftar bookmark')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (bookmarkId: string, konsultasiId: string) => {
    try {
      setRemovingId(bookmarkId)
      const token = localStorage.getItem('token')
      await apiRequest(
        `/v1/konsultasi/${konsultasiId}/bookmark`,
        'DELETE',
        undefined,
        token
      )
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId))
      alert('Bookmark dihapus')
    } catch (error) {
      console.error('Error removing bookmark:', error)
      alert('Gagal menghapus bookmark')
    } finally {
      setRemovingId(null)
    }
  }

  const handleQuestionClick = (konsultasiId: string, title: string) => {
    const slug = generateSlug(title)
    router.push(`/home/bk/konsultasi/${slug}`)
  }

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/home/bk/konsultasi')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Bookmark Saya</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Cari bookmark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600">Memuat bookmark...</p>
            </div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Belum ada bookmark</p>
            <p className="text-sm text-gray-500 mb-4">
              Mulai menambahkan pertanyaan favorit Anda ke bookmark
            </p>
            <button
              onClick={() => router.push('/home/bk/konsultasi')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Jelajahi Konsultasi
            </button>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Tidak ada hasil pencarian</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleQuestionClick(bookmark.konsultasiId, bookmark.title)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {bookmark.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                        {bookmark.category?.name || 'Umum'}
                      </span>
                      <span className="text-xs text-gray-500">
                        oleh {bookmark.author?.name || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveBookmark(bookmark.id, bookmark.konsultasiId)
                    }}
                    disabled={removingId === bookmark.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Hapus bookmark"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {bookmark.content}
                </p>

                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{bookmark.views} dilihat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{bookmark.answerCount} jawaban</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookmarksPageBK
