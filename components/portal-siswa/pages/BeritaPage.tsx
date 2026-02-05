'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Heart, MessageCircle, X, Loader, Flame } from 'lucide-react';
import { NewsItemProps, NewsCategory } from '@types';
import NewsDetailModal from '../modals/NewsDetailModal';
import NewsAPI, { getCleanPreview } from '@lib/newsAPI';
import { formatTimeRelative } from '@lib/timeFormat';

interface BeritaPageProps {
  selectedTopic?: string | null;
  setActivePage?: (page: string) => void;
}

const BeritaPage: React.FC<BeritaPageProps> = ({ selectedTopic = null, setActivePage }) => {
  const [allNews, setAllNews] = useState<NewsItemProps[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItemProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(selectedTopic);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch categories and news
  useEffect(() => {
    fetchCategories();
    fetchNews();
  }, [refreshTrigger]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await NewsAPI.getPublishedNews({ limit: 100 });
      // Validate response.data is array and contains valid news items
      if (!response || !response.data) {
        console.warn('Invalid response from getPublishedNews:', response);
        setAllNews([]);
        return;
      }

      const newsData = Array.isArray(response.data) 
        ? response.data.filter((item: any) => item && typeof item === 'object' && item.id && item.title)
        : [];
      
      setAllNews(newsData);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      // Fallback to empty if API fails
      setAllNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoryList = await NewsAPI.getCategories();
      
      // Ensure we have valid category array
      if (Array.isArray(categoryList)) {
        setCategories(categoryList);
      } else {
        console.warn('Invalid categories format:', categoryList);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Build categories dynamically from backend + count from allNews
  const categoriesWithCount = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    return categories
      .map((cat) => {
        // Ensure cat.id is number, cat.name is string
        const categoryId = typeof cat.id === 'number' ? cat.id : parseInt(cat.id as any);
        const categoryName = typeof cat.name === 'string' ? cat.name : String(cat.name);
        
        // Count news matching this category by name (news.category is now string)
        const count = allNews.filter(n => {
          // Ensure news.category is string before comparison
          const newsCategory = typeof n.category === 'string' ? n.category : '';
          return newsCategory === categoryName;
        }).length;
        
        return {
          id: String(categoryId),
          label: categoryName,
          count: count,
        };
      })
      .filter(cat => cat.count > 0);
  }, [categories, allNews]);

  // Filter berita berdasarkan kategori
  const filteredNews = useMemo(() => {
    if (!selectedCategory || !categories) return allNews;
    
    // Find the selected category by ID
    const selectedCat = categories.find(c => String(c.id) === selectedCategory);
    
    if (!selectedCat) return allNews;
    
    // Ensure category name is string
    const categoryName = typeof selectedCat.name === 'string' ? selectedCat.name : String(selectedCat.name);
    
    // Filter by category name (since allNews has category as string)
    return allNews.filter(news => news.category === categoryName);
  }, [selectedCategory, allNews, categories]);

  // Get latest news (first item)
  const latestNews = filteredNews.length > 0 ? filteredNews[0] : null;

  // Get top 3 popular news (sorted by views/likes)
  const topPopularNews = filteredNews
    .filter(n => n.id !== latestNews?.id) // Exclude latest from popular
    .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
    .slice(0, 3);

  // Get remaining news (exclude latest and top 3 popular)
  const excludedIds = new Set([
    latestNews?.id,
    ...topPopularNews.map(n => n.id)
  ]);
  const remainingNews = filteredNews.filter(n => !excludedIds.has(n.id));

  const handleNewsClick = async (news: NewsItemProps) => {
    // Optimistically update views in UI
    setAllNews((prev) =>
      prev.map((n) =>
        n.id === news.id ? { ...n, views: (n.views || 0) + 1 } : n
      )
    );
    setSelectedNews({ ...news, views: (news.views || 0) + 1 });
    setIsModalOpen(true);
    try {
      await NewsAPI.incrementViews(news.id);
    } catch (e) {
      // Optionally handle error, but keep UI responsive
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  // Expose refresh function via window for global updates
  useEffect(() => {
    const handleRefreshNews = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('refreshNews', handleRefreshNews as EventListener);
    return () => {
      window.removeEventListener('refreshNews', handleRefreshNews as EventListener);
    };
  }, []);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Berita & Artikel BK</h2>
            <p className="text-gray-600 mt-1">Baca artikel dan tips dari konselor BK</p>
          </div>
        </div>

        {/* Filter Kategori */}
        <div className="space-y-3 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700">Filter Kategori</h3>
          {loadingCategories ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin text-blue-600" size={20} />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Semua ({allNews.length})
              </button>
              {categoriesWithCount.length > 0 ? (
                categoriesWithCount.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">Tidak ada kategori tersedia</p>
              )}
            </div>
          )}
        </div>

        {/* Hasil Filter Info */}
        {selectedCategory && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <span className="text-sm text-blue-700">
              Menampilkan {filteredNews.length} berita dalam kategori yang dipilih
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* News Grid */}
        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <>
            {/* Latest + Top 3 Popular Section */}
            {(latestNews || topPopularNews.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Latest News - Large Card (Left) */}
                {latestNews && latestNews.id && (
                  <div className="lg:col-span-2">
                    <NewsCard
                      news={latestNews}
                      onViewDetail={handleNewsClick}
                      isLarge={true}
                    />
                  </div>
                )}

                {/* Top 3 Popular News (Right) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Paling Populer
                  </h3>
                  {topPopularNews.map((news) => {
                    if (!news || !news.id) return null;
                    return (
                      <NewsCard
                        key={news.id}
                        news={news}
                        onViewDetail={handleNewsClick}
                        isSmall={true}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Remaining News - All */}
            {remainingNews.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Semua Berita</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingNews.map((news) => {
                    if (!news || !news.id) return null;
                    return (
                      <NewsCard
                        key={news.id}
                        news={news}
                        onViewDetail={handleNewsClick}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* No News */}
            {!latestNews && topPopularNews.length === 0 && remainingNews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">Tidak ada berita dalam kategori ini</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        news={selectedNews}
      />
    </>
  );
};

// News Card Component
const NewsCard: React.FC<{
  news: NewsItemProps;
  onViewDetail: (news: NewsItemProps) => void;
  isLarge?: boolean;
  isSmall?: boolean;
}> = ({ news, onViewDetail, isLarge = false, isSmall = false }) => (
  <div
    onClick={() => onViewDetail(news)}
    className={`bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
      isLarge ? '' : isSmall ? 'h-full' : ''
    }`}
  >
    {/* Image */}
    <div className={`bg-gradient-to-br from-purple-500 to-blue-600 overflow-hidden ${
      isLarge ? 'w-full h-64' : isSmall ? 'w-full h-32' : 'w-full h-48'
    }`}>
      {news.image ? (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-center px-4">
          <span className={isLarge ? 'text-xl font-semibold' : isSmall ? 'text-sm font-semibold' : 'text-lg font-semibold'}>{news.title}</span>
        </div>
      )}
    </div>

    {/* Content */}
    <div className={`space-y-3 ${isLarge ? 'p-6' : isSmall ? 'p-3' : 'p-4'}`}>
      {/* Category & Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-block px-2 py-1 bg-purple-100 text-purple-700 font-semibold rounded ${
          isSmall ? 'text-xs' : 'text-xs'
        }`}>
          {news.category}
        </span>
        <span className={`inline-block px-2 py-1 bg-green-100 text-green-700 font-semibold rounded ${
          isSmall ? 'text-xs' : 'text-xs'
        }`}>
          {news.status}
        </span>
      </div>

      {/* Title */}
      <h3 className={`font-bold text-gray-900 hover:text-blue-600 ${
        isLarge ? 'text-2xl line-clamp-3' : isSmall ? 'text-sm line-clamp-2' : 'line-clamp-2'
      }`}>
        {news.title}
      </h3>

      {/* Description Preview - Only for large */}
      {isLarge && (
        <p className="text-gray-600 line-clamp-3">
          {getCleanPreview(news.description, 150)}
        </p>
      )}

      {/* Author & Date */}
      <div className={`flex items-center gap-2 text-gray-500 border-t border-gray-200 pt-2 ${
        isSmall ? 'text-xs' : 'text-xs'
      }`}>
        <div className={`${isSmall ? 'w-5 h-5' : 'w-6 h-6'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-semibold">
            {news.author.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="line-clamp-1">{news.author}</span>
        {!isSmall && (
          <>
            <span>•</span>
            <span>{formatTimeRelative(news.date)}</span>
          </>
        )}
      </div>

      {/* Stats - Only for large */}
      {isLarge && (
        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
          <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
            <Heart className="w-4 h-4" />
            <span>{news.likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{news.comments}</span>
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <Eye className="w-4 h-4" />
            <span>{news.views}</span>
          </div>
        </div>
      )}

      {/* Stats - Small version */}
      {isSmall && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Eye className="w-3 h-3" />
          <span>{news.views} views</span>
        </div>
      )}
    </div>
  </div>
);

export default BeritaPage;
