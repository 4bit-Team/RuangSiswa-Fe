'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Flag,
  Eye,
  Clock,
  ThumbsUp,
  CheckCircle,
  Send,
  Bookmark,
  MoreVertical,
  Loader,
} from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface Answer {
  id: string
  authorId: string
  authorName: string
  authorRole: 'siswa' | 'bk' | 'admin'
  avatar: string
  timestamp: string
  content: string
  likes: number
  isVerified: boolean
  isAuthorAnswer: boolean
  edited?: string
}

interface DetailKonsultasiPageProps {
  onBack?: () => void
}

const DetailKonsultasiPage: React.FC<DetailKonsultasiPageProps> = ({ onBack }) => {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const questionId = params.id as string
  
  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [sortByHelpful, setSortByHelpful] = useState(true)
  const [showMoreAnswers, setShowMoreAnswers] = useState(false)
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set())
  const [filteredAnswers, setFilteredAnswers] = useState<'all' | 'verified' | 'bk'>('all')

  const categoryMap = {
    personal: 'Pribadi',
    academic: 'Akademik',
    social: 'Sosial',
    development: 'Pengembangan',
  }

  // Fetch question detail dan answers
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const data = await apiRequest(
          `/v1/konsultasi/${questionId}`,
          'GET',
          undefined,
          token
        )

        const questionCategory = data.question.category as keyof typeof categoryMap
        setQuestion({
          id: data.question.id,
          title: data.question.title,
          category: categoryMap[questionCategory] || data.question.category,
          author: data.question.author?.name || 'Anonymous',
          authorId: data.question.authorId,
          avatar: (data.question.author?.name || 'A').substring(0, 2).toUpperCase(),
          timestamp: formatDate(data.question.createdAt),
          content: data.question.content,
          views: data.question.views,
          likes: data.question.votes,
          answers: data.question.answerCount,
          bookmarks: 0,
        })

        const transformedAnswers = data.answers.map((ans: any) => ({
          id: ans.id,
          authorId: ans.authorId,
          authorName: ans.author?.name || 'Anonymous',
          authorRole: ans.author?.role || 'siswa',
          avatar: (ans.author?.name || 'A').substring(0, 2).toUpperCase(),
          timestamp: formatDate(ans.createdAt),
          content: ans.content,
          likes: ans.votes,
          isVerified: ans.isVerified,
          isAuthorAnswer: false,
        }))

        setAnswers(transformedAnswers)
      } catch (error) {
        console.error('Error fetching question:', error)
      } finally {
        setLoading(false)
      }
    }

    if (questionId) {
      fetchDetail()
    }
  }, [questionId])

  const formatDate = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffMs = now.getTime() - postDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return postDate.toLocaleDateString('id-ID')
  }

  const displayAnswers = answers.filter(answer => {
    if (filteredAnswers === 'verified') return answer.isVerified
    if (filteredAnswers === 'bk') return answer.authorRole === 'bk'
    return true
  })

  const sortedAnswers = [...displayAnswers].sort((a, b) => {
    if (sortByHelpful) return b.likes - a.likes
    return 0
  })

  const visibleAnswers = showMoreAnswers ? sortedAnswers : sortedAnswers.slice(0, 3)

  const handleLike = (answerId: string) => {
    const newLiked = new Set(likedAnswers)
    if (newLiked.has(answerId)) {
      newLiked.delete(answerId)
    } else {
      newLiked.add(answerId)
    }
    setLikedAnswers(newLiked)
    
    // TODO: Call API to save vote
  }

  const handleSubmitAnswer = async () => {
    if (answerText.trim() && question) {
      try {
        setSubmitting(true)
        const token = localStorage.getItem('token')
        const newAnswer = await apiRequest(
          `/v1/konsultasi/${questionId}/answers`,
          'POST',
          { content: answerText },
          token
        )

        const transformedAnswer: Answer = {
          id: newAnswer.id,
          authorId: newAnswer.authorId,
          authorName: 'Anda',
          authorRole: 'siswa',
          avatar: 'YO',
          timestamp: 'baru saja',
          content: newAnswer.content,
          likes: 0,
          isVerified: false,
          isAuthorAnswer: false,
        }

        setAnswers([transformedAnswer, ...answers])
        setAnswerText('')
      } catch (error) {
        console.error('Error submitting answer:', error)
        alert('Gagal mengirim jawaban')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'bk':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'admin':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'bk':
        return 'Konselor BK'
      case 'admin':
        return 'Admin'
      default:
        return 'Siswa'
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/home/siswa/konsultasi')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <span className="text-sm text-gray-500">← Kembali ke Konsultasi</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600">Memuat pertanyaan...</p>
            </div>
          </div>
        ) : !question ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Pertanyaan tidak ditemukan</p>
          </div>
        ) : (
          <>
        {/* Question Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {question.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-900">{question.author}</p>
                <p className="text-xs text-gray-500">{question.timestamp}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-semibold rounded-full">
              {question.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {question.title}
          </h1>

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {question.content}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{question.views} dilihat</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{question.answers} jawaban</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Bookmark className="w-4 h-4" />
              <span className="text-sm">{question.bookmarks} bookmark</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Heart className="w-4 h-4" />
              Suka ({question.likes})
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Bookmark className="w-4 h-4" />
              Bookmark
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Flag className="w-4 h-4" />
              Laporkan
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Jawaban ({sortedAnswers.length})
            </h2>
            <select
              value={filteredAnswers}
              onChange={(e) => setFilteredAnswers(e.target.value as any)}
              className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Jawaban</option>
              <option value="verified">Terverifikasi</option>
              <option value="bk">Dari Konselor</option>
            </select>
          </div>

          {/* Answer Cards */}
          {visibleAnswers.map((answer) => (
            <div key={answer.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Author Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                    {answer.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{answer.authorName}</p>
                      {answer.isVerified && (
                        <div title="Jawaban terverifikasi">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getRoleColor(answer.authorRole)}`}>
                        {getRoleLabel(answer.authorRole)}
                      </span>
                      <p className="text-xs text-gray-500">{answer.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {answer.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLike(answer.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                    likedAnswers.has(answer.id)
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {answer.likes + (likedAnswers.has(answer.id) ? 1 : 0)}
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                  <MessageCircle className="w-4 h-4" />
                  Balas
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                  <Flag className="w-4 h-4" />
                  Laporkan
                </button>
              </div>
            </div>
          ))}

          {/* Load More */}
          {sortedAnswers.length > 3 && !showMoreAnswers && (
            <button
              onClick={() => setShowMoreAnswers(true)}
              className="w-full py-3 text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
            >
              Tampilkan {sortedAnswers.length - 3} jawaban lainnya
            </button>
          )}
        </div>

        {/* Answer Form */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Berikan Jawaban Anda</h3>
          <div className="space-y-4">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Tulis jawaban Anda di sini. Pastikan jawaban jelas, membantu, dan menghormati komunitas..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={!answerText.trim() || submitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Jawaban
                  </>
                )}
              </button>
              <button
                onClick={() => setAnswerText('')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
            <p className="text-xs text-gray-500">
              💡 Tip: Jawaban yang membantu dan jelas akan mendapat upvote lebih tinggi
            </p>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DetailKonsultasiPage
