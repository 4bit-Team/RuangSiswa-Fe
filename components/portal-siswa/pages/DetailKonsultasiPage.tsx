'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Facebook,
  Instagram,
  Smartphone,
  Flag,
  Eye,
  ThumbsUp,
  CheckCircle,
  Send,
  Bookmark,
  Loader,
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { extractSlug } from '@/lib/slugify'
import { getDisplayAuthorName } from '@/lib/KonsultasiAPI'
import { useAuth } from '@/hooks/useAuth'

interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
}

interface Answer {
  id: string
  authorId: string
  authorName: string
  authorRole: 'siswa' | 'bk' | 'admin'
  avatar: string
  timestamp: string
  content: string
  likes: number
  dislikes: number
  isVerified: boolean
  isAuthorAnswer: boolean
  edited?: string
  parentId?: string | null
  replies?: Answer[]
}

interface DetailKonsultasiPageProps {
  onBack?: () => void
}

const DetailKonsultasiPage: React.FC<DetailKonsultasiPageProps> = ({ onBack }) => {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const slug = extractSlug(pathname)
  const { user } = useAuth()
  
  console.log('=== DetailKonsultasiPage Debug ===')
  console.log('params:', params)
  console.log('pathname:', pathname)
  console.log('slug from extractSlug:', slug)
  
  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [sortByHelpful, setSortByHelpful] = useState(true)
  const [showMoreAnswers, setShowMoreAnswers] = useState(false)
  const [votedAnswers, setVotedAnswers] = useState<Map<string, 1 | -1>>(new Map())
  const [filteredAnswers, setFilteredAnswers] = useState<'all' | 'popular' | 'bk'>('all')

  useEffect(() => {
    // When user selects "Paling Populer", ensure answers are sorted by helpful (likes)
    if (filteredAnswers === 'popular') {
      setSortByHelpful(true)
    }
  }, [filteredAnswers])

  // Persist user's per-answer votes to localStorage so vote state (colors) survive page refresh
  useEffect(() => {
    const key = `konsultasi_votes_${user?.id ?? 'guest'}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const obj = JSON.parse(raw)
        const map = new Map<string, 1 | -1>(Object.entries(obj).map(([k, v]) => [k, v as 1 | -1]))
        setVotedAnswers(map)
      }
    } catch (err) {
      console.error('Error loading persisted votes:', err)
    }
  }, [user?.id])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [questionLiked, setQuestionLiked] = useState(false)
  const [questionLikeLoading, setQuestionLikeLoading] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [replySubmitting, setReplySubmitting] = useState(false)

  // Load persisted question-like state (per-user) from localStorage
  useEffect(() => {
    try {
      const key = `konsultasi_question_likes_${user?.id ?? 'guest'}`
      const raw = localStorage.getItem(key)
      if (raw) {
        const obj = JSON.parse(raw || '{}')
        // use slug as question identifier
        if (slug && obj[slug]) setQuestionLiked(true)
      }
    } catch (err) {
      console.error('Error loading persisted question likes:', err)
    }
  }, [user?.id, slug])

  const handleToggleQuestionLike = async () => {
    if (!slug) return
    setQuestionLikeLoading(true)
    try {
      // optimistic toggle and persist locally
      const next = !questionLiked
      setQuestionLiked(next)
      try {
        const key = `konsultasi_question_likes_${user?.id ?? 'guest'}`
        const raw = localStorage.getItem(key)
        const obj = raw ? JSON.parse(raw) : {}
        if (next) obj[slug] = true
        else delete obj[slug]
        localStorage.setItem(key, JSON.stringify(obj))
      } catch (err) {
        console.error('Error persisting question like:', err)
      }

      // attempt to inform backend if endpoint exists
      try {
        await apiRequest(`/v1/konsultasi/${question?.id}/like`, next ? 'POST' : 'DELETE')
      } catch (err) {
        // ignore backend errors (local persistence kept)
        console.warn('Question like API failed, keeping local state', err)
      }
    } finally {
      setQuestionLikeLoading(false)
    }
  }

  const handleSubmitReply = async (answerId: string) => {
    if (!question) return
    const text = (replyTexts[answerId] || '').trim()
    if (!text) return alert('Isi balasan terlebih dahulu')

    try {
      setReplySubmitting(true)
      const token = localStorage.getItem('token')
      await apiRequest(
        `/v1/konsultasi/${question.id}/answers`,
        'POST',
        { content: text, parentId: answerId },
        token
      )

      // Refresh answers after successful reply
      await fetchDetail()
      setReplyTexts(prev => ({ ...prev, [answerId]: '' }))
      setOpenReplyFor(null)
      alert('Balasan berhasil dikirim')
    } catch (err) {
      console.error('Error submitting reply:', err)
      alert('Gagal mengirim balasan')
    } finally {
      setReplySubmitting(false)
    }
  }

  const categoryMap = {
    personal: 'Pribadi',
    academic: 'Akademik',
    social: 'Sosial',
    development: 'Pengembangan',
  }

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await apiRequest('/consultation-category', 'GET', undefined, token)
        const categoryList = Array.isArray(response) ? response : response?.data || []
        setCategories(categoryList)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch question detail dan answers
  const fetchDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      console.log('Fetching slug:', slug)
      const data = await apiRequest(
        `/v1/konsultasi/slug/${slug}`,
        'GET',
        undefined,
        token
      )

      console.log('Response data:', data)

      const category = categories.find(c => c.id === data.question.categoryId)
      // Prefer topic name when available; fall back to category name or explicit fields from API
      const categoryLabel =
        data.question.topic?.name ||
        data.question.topicName ||
        category?.name ||
        data.question.categoryName ||
        'Umum'
      const authorName = data.question.author?.username || data.question.author?.name || 'Anonymous'
      const authorRole = data.question.author?.role
      const isQuestionCurrentUser = String(user?.id) === String(data.question.authorId)
      const questionDisplayName = getDisplayAuthorName(authorName, data.question.authorId, authorRole, user ? { id: user.id as number, role: user.role } : undefined, isQuestionCurrentUser)
      setQuestion({
        id: data.question.id,
        title: data.question.title,
        category: categoryLabel,
        author: authorName,
        authorId: data.question.authorId,
        authorRole: authorRole,
        avatar: questionDisplayName === 'Anonymous' ? 'A' : (authorName || 'A').substring(0, 2).toUpperCase(),
        timestamp: formatDate(data.question.createdAt),
        content: data.question.content,
        views: data.question.views,
        votes: data.question.votes,
        answers: data.question.answerCount,
        bookmarks: data.question.bookmarkCount || 0,
      })

      // Transform answers and build threaded structure (parentId -> replies)
      const flatAnswers: Answer[] = data.answers.map((ans: any) => {
        const answerAuthorName = ans.author?.username || ans.author?.name || 'Anonymous'
        const isAnswerCurrentUser = String(user?.id) === String(ans.authorId)
        const answerDisplayName = getDisplayAuthorName(answerAuthorName, ans.authorId, ans.author?.role, user ? { id: user.id as number, role: user.role } : undefined, isAnswerCurrentUser)
        return {
          id: ans.id,
          authorId: ans.authorId,
          authorName: answerAuthorName,
          authorRole: ans.author?.role || 'siswa',
          avatar: answerDisplayName === 'Anonymous' ? 'A' : (answerAuthorName || 'A').substring(0, 2).toUpperCase(),
          timestamp: formatDate(ans.createdAt),
          content: ans.content,
          likes: ans.votes || 0,
          dislikes: ans.downvotes || 0,
          isVerified: ans.isVerified,
          isAuthorAnswer: false,
          parentId: ans.parentId ?? null,
          replies: [],
        }
      })

      // Build nested replies (one level deep tree)
      const byId = new Map<string, Answer>()
      flatAnswers.forEach(a => byId.set(a.id, a))
      const rootAnswers: Answer[] = []
      flatAnswers.forEach(a => {
        if (a.parentId) {
          const parent = byId.get(a.parentId)
          if (parent) {
            parent.replies = parent.replies || []
            parent.replies.push(a)
          } else {
            // parent not found, treat as root
            rootAnswers.push(a)
          }
        } else {
          rootAnswers.push(a)
        }
      })

      setAnswers(rootAnswers)
      
      // Check if bookmarked
      const isBookmarkedRes = await apiRequest(
        `/v1/konsultasi/${data.question.id}/is-bookmarked`,
        'GET',
        undefined,
        token
      )
      setIsBookmarked(isBookmarkedRes?.isBookmarked || false)
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching question:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) fetchDetail()
  }, [slug])

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
    if (filteredAnswers === 'bk') return answer.authorRole === 'bk'
    // 'popular' will be handled by sorting (sortByHelpful), so we do not filter out answers here
    return true
  })

  const sortedAnswers = [...displayAnswers].sort((a, b) => {
    if (sortByHelpful) return b.likes - a.likes
    return 0
  })

  const visibleAnswers = showMoreAnswers ? sortedAnswers : sortedAnswers.slice(0, 3)

  const handleSubmitAnswer = async () => {
    if (answerText.trim() && question) {
      try {
        setSubmitting(true)
        const token = localStorage.getItem('token')
        const newAnswer = await apiRequest(
          `/v1/konsultasi/${question.id}/answers`,
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
          dislikes: 0,
          isVerified: false,
          isAuthorAnswer: false,
        }

        setAnswers([transformedAnswer, ...answers])
        setAnswerText('')
        alert('Jawaban berhasil dikirim')
      } catch (error) {
        console.error('Error submitting answer:', error)
        alert('Gagal mengirim jawaban')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleVoteAnswer = async (answerId: string, voteValue: 1 | -1) => {
    if (!question) return
    
    const previousVote = votedAnswers.get(answerId) // 1 | -1 undefined

    try {
      const token = localStorage.getItem('token')
      await apiRequest(
        `/v1/konsultasi/${question.id}/answers/${answerId}/vote`,
        'POST',
        { vote: voteValue },
        token
      )
      
      setAnswers(prev =>
        prev.map(answer => {
        if (answer.id !== answerId) return answer

        let likes = answer.likes
        let dislikes = answer.dislikes

        if (previousVote === voteValue) {
          if (voteValue === 1) likes--
          else dislikes--
        }

        else {
          if (previousVote === 1) likes--
          if (previousVote === -1) dislikes--

          if (voteValue === 1) likes++
          else dislikes++
        }

        return { ...answer, likes, dislikes }
      })
    )


      setVotedAnswers(prev => {
        const newMap = new Map(prev)
        newMap.set(answerId, voteValue)
        try {
          const key = `konsultasi_votes_${user?.id ?? 'guest'}`
          localStorage.setItem(key, JSON.stringify(Object.fromEntries(newMap)))
        } catch (err) {
          console.error('Error persisting vote state:', err)
        }
        return newMap
      })
    } catch (error) {
      console.error('Error voting answer:', error)
      alert('Gagal memberikan vote')
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}`
    const shareText = `${question?.title} - RuangSiswa Konsultasi`
    
    // Check if on mobile (Android/iOS)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile && navigator.share) {
      // Use native share on mobile
      try {
        await navigator.share({
          title: question?.title,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // On desktop, copy to clipboard and show modal
      await navigator.clipboard.writeText(shareUrl)
      setShareModalOpen(true)
    }
  }

  const shareOnPlatform = (platform: 'whatsapp' | 'instagram' | 'facebook') => {
    const shareUrl = `${window.location.origin}${window.location.pathname}`
    const shareText = encodeURIComponent(`${question?.title}\n${shareUrl}`)
    let url = ''
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${shareText}`
        break
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we just copy to clipboard
        navigator.clipboard.writeText(shareUrl)
        alert('Link disalin. Silakan buka Instagram dan paste di caption atau direct message.')
        setShareModalOpen(false)
        return
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
    setShareModalOpen(false)
  }

  const handleBookmark = async () => {
    if (!question) return
    
    try {
      setBookmarkLoading(true)
      const token = localStorage.getItem('token')
      
      if (isBookmarked) {
        await apiRequest(
          `/v1/konsultasi/${question.id}/bookmark`,
          'DELETE',
          undefined,
          token
        )
        setIsBookmarked(false)
        alert('Bookmark dihapus')
      } else {
        await apiRequest(
          `/v1/konsultasi/${question.id}/bookmark`,
          'POST',
          {},
          token
        )
        setIsBookmarked(true)
        alert('Pertanyaan berhasil di-bookmark')
      }
    } catch (error: any) {
      console.error('Error bookmarking:', error)
      // Handle duplicate bookmark error gracefully
      if (error?.message?.includes('sudah di-bookmark')) {
        setIsBookmarked(true)
      } else {
        alert('Gagal memperbarui bookmark')
      }
    } finally {
      setBookmarkLoading(false)
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
    <div className="bg-gray-50 min-h-screen py-6 px-2 sm:px-4">
      {/* Header */}
      <div className="sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3">
          <div className="bg-white border border-gray-100 rounded-md shadow-sm flex items-center gap-3 px-3 py-2">
            <button
              onClick={() => router.push('/home/siswa/konsultasi')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 py-1 rounded-md transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Konsultasi</span>
            </button>
            <div className="flex-1" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {question.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-900">{getDisplayAuthorName(question.author, question.authorId, question.authorRole, user ? { id: user.id as number, role: user.role } : undefined, String(user?.id) === String(question.authorId))}</p>
                <p className="text-xs text-gray-500">{question.timestamp}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-semibold rounded-full">
              {question.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {question.title}
          </h1>

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {question.content}
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-gray-200">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <button
              onClick={handleToggleQuestionLike}
              disabled={questionLikeLoading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${questionLiked ? 'bg-green-50 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              <ThumbsUp className="w-4 h-4" />
              {questionLiked ? `Like (${question.votes + 1})` : `Like (${question.votes})`}
            </button>
            <button 
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
            <button 
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isBookmarked
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}>
              <Bookmark className="w-4 h-4" />
              {isBookmarked ? 'Tersimpan' : 'Simpan'}
            </button>
            {/* Report button intentionally hidden (kept for reference)
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Flag className="w-4 h-4" />
              Laporkan
            </button>
            */}
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
              <option value="popular">Paling Populer</option>
              <option value="bk">Dari Konselor</option>
            </select>
          </div>

          {/* Answer Cards */}
          {visibleAnswers.map((answer) => (
            <div key={answer.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              {/* Author Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                    {answer.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{getDisplayAuthorName(answer.authorName, answer.authorId, answer.authorRole, user ? { id: user.id as number, role: user.role } : undefined, String(user?.id) === String(answer.authorId))}</p>
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
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleVoteAnswer(answer.id, 1)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                    votedAnswers.get(answer.id) === 1
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Setuju ({answer.likes})
                </button>
                <button 
                  onClick={() => handleVoteAnswer(answer.id, -1)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                    votedAnswers.get(answer.id) === -1
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 rotate-180" />
                  Tidak Setuju ({answer.dislikes})
                </button>
                <button
                  onClick={() => setOpenReplyFor(answer.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                  <MessageCircle className="w-4 h-4" />
                  Balas
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                  <Flag className="w-4 h-4" />
                  Laporkan
                </button>
              </div>
              {openReplyFor === answer.id && (
                <div className="mt-4">
                  <textarea
                    value={replyTexts[answer.id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [answer.id]: e.target.value }))}
                    placeholder="Tulis balasan Anda..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                    rows={3}
                  />
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <button
                      onClick={() => handleSubmitReply(answer.id)}
                      disabled={replySubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {replySubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        'Kirim Balasan'
                      )}
                    </button>
                    <button
                      onClick={() => { setOpenReplyFor(null); setReplyTexts(prev => ({ ...prev, [answer.id]: '' })); }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Replies (threaded) */}
              {answer.replies && answer.replies.length > 0 && (
                <div className="mt-4 ml-8 sm:ml-12 pl-3 sm:pl-4 border-l border-gray-200 space-y-4">
                  {answer.replies.map((reply) => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg border border-gray-100 p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                            {reply.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{getDisplayAuthorName(reply.authorName, reply.authorId, reply.authorRole, user ? { id: user.id as number, role: user.role } : undefined, String(user?.id) === String(reply.authorId))}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getRoleColor(reply.authorRole)}`}>
                                {getRoleLabel(reply.authorRole)}
                              </span>
                              <p className="text-xs text-gray-500">{reply.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none mb-2">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                          onClick={() => handleVoteAnswer(reply.id, 1)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            votedAnswers.get(reply.id) === 1
                              ? 'bg-green-50 text-green-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Setuju ({reply.likes})
                        </button>
                        <button
                          onClick={() => handleVoteAnswer(reply.id, -1)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            votedAnswers.get(reply.id) === -1
                              ? 'bg-red-50 text-red-600'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4 rotate-180" />
                          Tidak Setuju ({reply.dislikes})
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                          <Flag className="w-4 h-4" />
                          Laporkan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

        {/* Share Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-lg p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bagikan Pertanyaan</h3>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600 break-all">{window.location.href}</p>
                <p className="text-xs text-gray-500 mt-2">✓ Link sudah disalin ke clipboard</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => shareOnPlatform('whatsapp')}
                    className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => shareOnPlatform('instagram')}
                    className="flex flex-col items-center gap-2 p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Instagram</span>
                  </button>
                  <button
                    onClick={() => shareOnPlatform('facebook')}
                    className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Facebook className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Facebook</span>
                  </button>
              </div>

              <button
                onClick={() => setShareModalOpen(false)}
                className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}

export default DetailKonsultasiPage
