'use client'

import React, { useState, useEffect } from 'react'
import { HelpCircle, Send, X, Loader } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  category?: string
  onSubmit?: (data: any) => void
}

interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
}) => {
  const [question, setQuestion] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState('')

  // Fetch categories on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true)
          const token = localStorage.getItem('token')
          const response = await apiRequest('/consultation-category', 'GET', undefined, token)
          const categoryList = Array.isArray(response) ? response : response?.data || []
          setCategories(categoryList)
          if (categoryList.length > 0 && !selectedCategory) {
            setSelectedCategory(categoryList[0].id)
          }
        } catch (err) {
          console.error('Error fetching categories:', err)
        } finally {
          setLoadingCategories(false)
        }
      }
      fetchCategories()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (question.trim() && selectedCategory) {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('token')
        
        const data = await apiRequest(
          '/v1/konsultasi',
          'POST',
          {
            title: question.split('\n')[0] || question.substring(0, 100),
            content: question,
            categoryId: selectedCategory,
          },
          token
        )

        onSubmit?.({
          question,
          category: selectedCategory,
        })
        setIsSubmitted(true)
        setTimeout(() => {
          setQuestion('')
          setIsSubmitted(false)
          onClose()
        }, 2000)
      } catch (err: any) {
        console.error('Error creating question:', err)
        setError(err.message || 'Gagal mengirim pertanyaan. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleClose = () => {
    setQuestion('')
    setIsSubmitted(false)
    onClose()
  }

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

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
          <div className={`${isSubmitted ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'} px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isSubmitted ? '✓ Pertanyaan Terkirim' : 'Ajukan Pertanyaan'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isSubmitted ? 'Konselor BK kami akan segera meresponnya' : 'Berbagi pertanyaan atau masalah Anda'}
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
          {!isSubmitted ? (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm font-medium">❌ {error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kategori Pertanyaan
                </label>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                ) : categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-lg transition-all duration-200 text-sm font-medium text-center ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Kategori tidak tersedia</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pertanyaan Anda
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ceritakan pertanyaan atau masalah Anda dengan detail. Semakin detail, semakin baik kami dapat membantu..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {question.length}/500 karakter
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-2">💡 Tips untuk Pertanyaan Terbaik</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Jelaskan situasi dengan detail</li>
                  <li>✓ Sebutkan perasaan atau kekhawatiran Anda</li>
                  <li>✓ Ceritakan apa yang sudah Anda coba</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {question.trim() ? '✓ Siap untuk dikirim' : '← Tulis pertanyaan Anda'}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!question.trim() || question.length > 500 || loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Pertanyaan
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-8 text-center">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-gray-800 font-semibold text-lg">
                Pertanyaan Anda Telah Terkirim
              </p>
              <p className="text-gray-600 text-sm">
                Terima kasih telah mengajukan pertanyaan. Tim konselor BK kami akan segera meresponnya.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-4 text-sm bg-gray-50 rounded-lg p-4">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-gray-600 font-medium text-xs">Kategori</p>
                  <p className="text-blue-600 font-semibold">
                    {categories.find(c => c.id === selectedCategory)?.name || 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-gray-600 font-medium text-xs">Status</p>
                  <p className="text-blue-600 font-semibold">Menunggu Jawaban</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 shadow-sm"
              >
                Tutup
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AskQuestionModal
