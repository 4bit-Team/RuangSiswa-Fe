'use client'

import React, { useState } from 'react'
import { HelpCircle, Send, X } from 'lucide-react'

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  category?: string
  onSubmit?: (data: any) => void
}

const categories = [
  { id: 'personal', label: 'Masalah Pribadi', emoji: '💭' },
  { id: 'academic', label: 'Akademik & Belajar', emoji: '📚' },
  { id: 'social', label: 'Sosial & Pertemanan', emoji: '👥' },
  { id: 'career', label: 'Karir & Masa Depan', emoji: '🎯' },
  { id: 'family', label: 'Keluarga', emoji: '👨‍👩‍👧' },
  { id: 'other', label: 'Lainnya', emoji: '❓' },
]

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  category = 'personal',
  onSubmit,
}) => {
  const [question, setQuestion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (question.trim()) {
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

  const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || 'Umum'

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
          <div className={`${isSubmitted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'} px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isSubmitted ? '✅ Pertanyaan Terkirim' : 'Ajukan Pertanyaan'}
                </h2>
                <p className="text-white/80 text-sm">
                  {isSubmitted ? 'Konselor akan menjawab dalam waktu singkat' : 'Tanyakan apa yang sedang Anda pikirkan'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kategori Pertanyaan
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-lg transition-all duration-300 text-sm font-medium text-center ${
                        selectedCategory === cat.id
                          ? 'bg-orange-500 text-white ring-2 ring-orange-300 shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-lg block mb-1">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pertanyaan Anda
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ceritakan pertanyaan atau masalah Anda dengan detail. Semakin detail, semakin baik kami dapat membantu..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {question.length}/500 karakter
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h5 className="font-semibold text-yellow-900 mb-2">💡 Tips untuk Pertanyaan Terbaik</h5>
                <ul className="text-sm text-yellow-800 space-y-1">
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
                disabled={!question.trim() || question.length > 500}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Kirim Pertanyaan
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-gray-700">
                Terima kasih telah mengajukan pertanyaan! Tim konselor BK kami akan segera meresponnya.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-700 font-medium">Kategori</p>
                  <p className="text-green-600">
                    {categoryLabel}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-700 font-medium">Status</p>
                  <p className="text-blue-600">Menunggu Jawaban</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full mt-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Ajukan Pertanyaan Lagi
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
