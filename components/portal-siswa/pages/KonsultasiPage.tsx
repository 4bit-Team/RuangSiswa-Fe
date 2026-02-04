'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Search,
  MessageCircle,
  Calendar,
  Users,
  BookOpen,
  Lightbulb,
  ChevronDown,
  TrendingUp,
  Clock,
  Eye,
  Share2,
  Filter,
  Plus,
  Loader,
  Bookmark,
  Award
} from 'lucide-react'
import { CategoryCardProps, QuestionItemProps } from '@types'
import AskQuestionModal from '../modals/AskQuestionModal'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import { generateSlug } from '@/lib/slugify'
import { useAuth } from '@/hooks/useAuth'

interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
}

interface PostCardProps {
  id: string
  title: string
  category: string
  author: string
  authorId?: number
  authorRole?: string
  avatar: string
  timestamp: string
  content: string
  votes: number
  answers: number
  views: number
  bookmarks: number
  isVerified?: boolean
  categoryColor?: string
  onClick?: () => void
}

const PostCard: React.FC<PostCardProps & { currentUserId?: number }> = ({
  id,
  title,
  category,
  author,
  authorId,
  authorRole,
  avatar,
  timestamp,
  content,
  votes,
  answers,
  views,
  bookmarks,
  isVerified,
  categoryColor = 'bg-blue-50',
  onClick,
  currentUserId
}) => {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [voteCount, setVoteCount] = useState(votes);

  // Logika menampilkan nama author
  const getDisplayAuthorName = () => {
    // Debug info
    console.log(`🎯 getDisplayAuthorName called:`, {
      author,
      authorId,
      currentUserId,
      authorRole,
      isOwnPost: authorId === currentUserId,
    });

    // Jika author adalah user yang sedang login, tampilkan nama sebenarnya
    if (authorId === currentUserId) {
      console.log('✅ Showing own name:', author);
      return author;
    }
    
    // Jika author adalah konselor/BK, tampilkan nama sebenarnya dengan label
    if (authorRole) {
      const roleStr = String(authorRole).toLowerCase().trim();
      console.log('🔎 Checking role:', roleStr);
      // Check berbagai kemungkinan format role dari API
      if (
        roleStr === 'konselor' ||
        roleStr === 'bk' ||
        roleStr === 'bk_staff' ||
        roleStr === 'counselor' ||
        roleStr === 'guidance_counselor' ||
        roleStr.includes('konselor') ||
        roleStr.includes('bk') ||
        roleStr.includes('counselor')
      ) {
        console.log('👨‍💼 Showing counselor:', author);
        return `${author} (Konselor)`;
      }
    }
    
    // Jika author adalah siswa lain, anonymize nama
    console.log('👤 Showing anonymized name');
    return 'Siswa Lain';
  };

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUpvoted) {
      setVoteCount(voteCount + 1);
      setIsUpvoted(true);
    } else {
      setVoteCount(voteCount - 1);
      setIsUpvoted(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-2 py-1">
          <button
            onClick={handleVote}
            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
              isUpvoted ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ChevronRight className="w-5 h-5 transform -rotate-90" />
          </button>
          <span className={`text-sm font-semibold ${isUpvoted ? 'text-orange-500' : 'text-gray-600'}`}>
            {voteCount}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Category & Author */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-block ${categoryColor} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
              {category}
            </span>
            <span className="text-xs text-gray-500">
              dibuat oleh <span className="font-medium text-gray-700">{getDisplayAuthorName()}</span>
            </span>
            {isVerified && (
              <div title="Jawaban terverifikasi" className="flex items-center">
                <Award className="w-3.5 h-3.5 text-green-500" />
              </div>
            )}
            <span className="text-xs text-gray-400 ml-auto">{timestamp}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-blue-600">
            {title}
          </h3>

          {/* Preview */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {content}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{answers} jawaban</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{views} dilihat</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              <span>{bookmarks} bookmark</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

const KonsultasiPage: React.FC<{ setActivePage?: (page: string) => void }> = ({ setActivePage }) => {
  const router = useRouter()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'unanswered'>('trending')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [posts, setPosts] = useState<PostCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [userAnswerCount, setUserAnswerCount] = useState(0)
  const [userBookmarkCount, setUserBookmarkCount] = useState(0)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const token = localStorage.getItem('token')
        const response = await apiRequest('/consultation-category', 'GET', undefined, token)
        const categoryList = Array.isArray(response) ? response : response?.data || []
        setCategories(categoryList)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch data dari API
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const category = filterCategory !== 'all' ? filterCategory : undefined;
        const params = new URLSearchParams({
          sort: sortBy,
          page: page.toString(),
          limit: '10',
          ...(category && { category }),
          ...(searchQuery && { search: searchQuery }),
        });

        const token = localStorage.getItem('token');
        const data = await apiRequest(
          `/v1/konsultasi?${params}`,
          'GET',
          undefined,
          token
        );

        const transformedPosts = data.data.map((item: any) => {
          const category = categories.find(c => c.id === item.categoryId);
          console.log('🔍 Debug post item:', {
            id: item.id,
            authorName: item.author?.name,
            authorRole: item.author?.role,
            authorId: item.author?.id,
          });
          return {
            id: item.id,
            title: item.title,
            category: category?.name || 'Umum',
            author: item.author?.name || 'Anonymous',
            authorId: item.author?.id,
            authorRole: item.author?.role,
            avatar: (item.author?.name || 'A').substring(0, 2).toUpperCase(),
            timestamp: formatDate(item.createdAt),
            content: item.content,
            votes: item.votes || 0,
            answers: item.answerCount || 0,
            views: item.views || 0,
            bookmarks: item.bookmarkCount || 0,
            categoryColor: 'bg-blue-50',
            isVerified: false,
          };
        });

        setPosts(transformedPosts);
        setTotalPages(data.pagination.pages);

        // Fetch user's answer count and bookmarks if user is logged in
        if (user?.id) {
          try {
            const userAnswersData = await apiRequest(
              `/v1/konsultasi/answers?userId=${user.id}`,
              'GET',
              undefined,
              token
            );
            const totalAnswers = userAnswersData.data ? userAnswersData.data.length : 0;
            setUserAnswerCount(totalAnswers);

            // Fetch user's bookmarks
            const userBookmarksData = await apiRequest(
              `/v1/konsultasi/user/bookmarks`,
              'GET',
              undefined,
              token
            );
            const totalBookmarks = userBookmarksData.data ? userBookmarksData.data.length : 0;
            setUserBookmarkCount(totalBookmarks);
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUserAnswerCount(0);
            setUserBookmarkCount(0);
          }
        }
      } catch (error) {
        console.error('Error fetching consultations:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingCategories) {
      fetchConsultations();
    }
  }, [sortBy, filterCategory, searchQuery, page, loadingCategories, categories, user]);

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return postDate.toLocaleDateString('id-ID');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category.toLowerCase() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = posts;

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Konsultasi Terbuka</h1>
            <p className="text-gray-600">Tanya jawab dengan komunitas siswa dan konselor BK</p>
          </div>
          <button
            onClick={() => router.push('/home/siswa/konsultasi/bookmarks')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Bookmark className="w-5 h-5" />
            Bookmark Saya
          </button>
        </div>

        {/* Search & Action */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tanya
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              filterCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id.toString())}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                filterCategory === cat.id.toString()
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Posts Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sort Options */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="trending">Trending</option>
                <option value="newest">Terbaru</option>
                <option value="unanswered">Belum Terjawab</option>
              </select>
            </div>

            {/* Posts */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Memuat pertanyaan...</p>
                  </div>
                </div>
              ) : sortedPosts.length > 0 ? (
                sortedPosts.map(post => (
                  <Link key={post.id} href={`/home/siswa/konsultasi/${generateSlug(post.title)}`}>
                    <PostCard
                      {...post}
                      currentUserId={user?.id}
                      onClick={() => {
                        // Navigate handled by Link
                      }}
                    />
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-600">Tidak ada pertanyaan yang cocok</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-lg ${
                        page === p
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info Box */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Tips Bertanya
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Jelaskan masalah secara detail</li>
                <li>• Pilih kategori yang tepat</li>
                <li>• Hormati jawaban dari konselor</li>
                <li>• Gunakan bahasa yang sopan</li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Statistik Anda</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pertanyaan Saya</span>
                  <span className="font-semibold text-blue-600">
                    {posts.filter(p => p.authorId === user?.id).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Terjawab</span>
                  <span className="font-semibold text-green-600">
                    {posts.filter(p => p.authorId === user?.id && p.answers > 0).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Lihat</span>
                  <span className="font-semibold text-purple-600">
                    {posts.filter(p => p.authorId === user?.id).reduce((sum, p) => sum + p.views, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Menjawab</span>
                  <span className="font-semibold text-indigo-600">
                    {userAnswerCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Bookmark</span>
                  <span className="font-semibold text-blue-600">
                    {userBookmarkCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Butuh Bantuan Langsung?</h3>
              <p className="text-sm text-gray-600 mb-4">Chat dengan konselor BK kami atau buat reservasi konseling</p>
              <div className="space-y-2">
                <button onClick={() => router.push('/home/siswa/chat')}
                  className="w-full px-3 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Chat BK
                </button>
                <button onClick={() => router.push('/home/siswa/reservasi')}
                  className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Reservasi Saya
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AskQuestionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default KonsultasiPage;