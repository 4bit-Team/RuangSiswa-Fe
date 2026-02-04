'use client'

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, User, Calendar, BookOpen, X, Loader, AlertCircle } from 'lucide-react';
import NewsAPI, { getCleanPreview } from '@lib/newsAPI';
import { useAuth } from '@hooks/useAuth';
import { formatTimeRelative } from '@lib/timeFormat';
import NewsModal from '../modals/NewsModal';

// Interfaces
interface ArticleCardProps {
  id: number;
  title: string;
  categories: string[];
  status: 'published' | 'draft' | 'scheduled';
  views: number;
  author: string;
  date: string;
  summary: string;
  imageUrl?: string;
}

// Article Card Component
const ArticleCard: React.FC<ArticleCardProps & { onEdit: () => void; onDelete: () => void }> = ({ 
  id, title, categories, status, views, author, date, summary, imageUrl, onEdit, onDelete 
}) => (
  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    {imageUrl && (
      <div className="w-32 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex-shrink-0 overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    )}
    {!imageUrl && (
      <div className="w-32 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex-shrink-0"></div>
    )}
    <div className="flex-1">
      <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
        {categories.map((cat) => (
          <span key={cat} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
            {cat}
          </span>
        ))}
        <span className={`text-xs px-2 py-1 rounded ${
          status === 'published' ? 'bg-green-100 text-green-700' :
          status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {status === 'published' ? 'Published' : status === 'scheduled' ? 'Scheduled' : 'Draft'}
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{getCleanPreview(summary, 150)}</p>
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center"><User size={12} className="mr-1" /> {author}</span>
        <span className="flex items-center"><Calendar size={12} className="mr-1" /> {formatTimeRelative(date)}</span>
        <span className="flex items-center"><Eye size={12} className="mr-1" /> {views} views</span>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button onClick={onEdit} className="p-2 hover:bg-gray-200 rounded-lg" title="Edit">
        <Edit size={18} className="text-gray-600" />
      </button>
      <button onClick={onDelete} className="p-2 hover:bg-gray-200 rounded-lg" title="Hapus">
        <Trash2 size={18} className="text-red-600" />
      </button>
    </div>
  </div>
);

// Stats Card Component
const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <h3 className="text-sm text-gray-600 mb-2">{label}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const BeritaPage: React.FC = () => {
  const { token, user } = useAuth();
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Akademik',
    'Kesehatan Mental',
    'Karir',
    'Pengembangan Diri',
    'Sosial',
    'Pengumuman',
  ];

  // Fetch news
  useEffect(() => {
    if (!token || !user?.id) return;
    fetchNews();
  }, [token, user?.id, filterStatus, filterCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await NewsAPI.getUserNews(user!.id, 1, 100, token || undefined);
      
      // Map transformed data to ArticleCardProps format
      const mapped = response.data.map((item: any) => {
        // Extract category objects and ensure they have id property
        let categories: any[] = [];
        if (Array.isArray(item.categories)) {
          categories = item.categories.map((cat: any) => {
            // If category has name property, it's a full category object
            if (cat.name) {
              return cat.name;
            }
            return cat;
          });
        }
        
        return {
          id: item.id,
          title: item.title,
          summary: item.summary,
          categories: Array.isArray(categories) ? categories : [],
          status: item.status || 'draft',
          views: item.views || item.viewCount || 0,
          author: item.author?.fullName || item.author?.username || item.author || 'Unknown',
          date: item.publishedDate || item.date || item.createdAt || new Date().toISOString(),
          imageUrl: item.image || item.imageUrl,
          content: item.description || item.content, // Keep description from transformNewsData
        };
      });
      
      setArticles(mapped);
      setError('');
    } catch (err) {
      setError('Failed to fetch news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (!formData.title || !formData.summary || !formData.content || !formData.categoryIds || formData.categoryIds.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      // Ensure proper format for API
      const submitData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        imageUrl: formData.imageUrl,
        categoryIds: formData.categoryIds,
        status: formData.status,
        scheduledDate: formData.scheduledDate,
      };

      if (modalMode === 'create') {
        await NewsAPI.createNews(submitData, token!);
      } else if (selectedArticle) {
        await NewsAPI.updateNews(selectedArticle.id, submitData, token!);
      }
      
      setModalOpen(false);
      setSelectedArticle(null);
      await fetchNews();
      setError('');
    } catch (err) {
      setError('Failed to save news');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (article: any) => {
    // Fetch full article data to get category IDs
    const fetchFullArticle = async () => {
      try {
        const fullData = await NewsAPI.getNews(article.id);
        const enrichedArticle = {
          ...article,
          ...fullData,
          categoryIds: Array.isArray(fullData.categories) 
            ? fullData.categories.map((cat: any) => cat.id || cat)
            : [],
        };
        setSelectedArticle(enrichedArticle);
        setModalMode('edit');
        setModalOpen(true);
      } catch (err) {
        console.error('Failed to fetch full article:', err);
        // Fallback to article without full data
        setSelectedArticle(article);
        setModalMode('edit');
        setModalOpen(true);
      }
    };
    
    fetchFullArticle();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    
    try {
      await NewsAPI.deleteNews(id, token!);
      await fetchNews();
    } catch (err) {
      setError('Failed to delete news');
      console.error(err);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await NewsAPI.uploadNewsImage(file, token!);
      return response;
    } catch (err) {
      setError('Failed to upload image');
      throw err;
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || article.status === filterStatus;
    const matchesCategory = !filterCategory || (article.categories && article.categories.includes(filterCategory));
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === 'published').length,
    draft: articles.filter((a) => a.status === 'draft').length,
    scheduled: articles.filter((a) => a.status === 'scheduled').length,
    views: articles.reduce((sum, a) => sum + a.views, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Berita & Artikel BK</h2>
          <p className="text-sm text-gray-600">Kelola dan publikasikan artikel untuk siswa</p>
        </div>
        <button 
          onClick={() => {
            setModalMode('create');
            setSelectedArticle(null);
            setModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors">
          <Plus size={20} />
          <span>Buat Berita</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError('')} className="ml-auto">
            <X size={18} className="text-red-600" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard label="Total Artikel" value={stats.total} />
        <StatCard label="Dipublikasikan" value={stats.published} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="Terjadwal" value={stats.scheduled} />
        <StatCard label="Total Views" value={stats.views} />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6 flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari berita atau artikel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Articles List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                {...article}
                onEdit={() => handleEdit(article)}
                onDelete={() => handleDelete(article.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
            <p>Belum ada berita. Mulai buat berita baru!</p>
          </div>
        )}
      </div>

      {/* Modal: Buat/Edit Berita */}
      <NewsModal 
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedArticle(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={selectedArticle}
        mode={modalMode}
        loading={submitting}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default BeritaPage;
