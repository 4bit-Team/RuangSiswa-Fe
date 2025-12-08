'use client'

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Calendar, Users, ArrowRight, Eye, Loader } from 'lucide-react';
import { StatCardProps } from '@types';
import NewsDetailModal from '../modals/NewsDetailModal';
import { NewsItemProps } from '@types';
import NewsAPI from '@lib/newsAPI';
import { formatTimeRelative } from '@lib/timeFormat';


const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

// Wrapper component untuk konten
const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pt-16 px-8">
    {children}
  </div>
);

const NewsPreviewCard: React.FC<{
  news: NewsItemProps;
  onViewDetail: (news: NewsItemProps) => void;
}> = ({ news, onViewDetail }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
    {/* Image */}
    <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-blue-600 overflow-hidden flex-shrink-0">
      {news.image ? (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-center px-4">
          <span className="text-sm font-semibold">{news.title}</span>
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-4 flex-1 flex flex-col">
      {/* Category */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
          {news.category}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-bold text-gray-900 line-clamp-2 mb-2">
        {news.title}
      </h4>

      {/* Description Preview */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
        {news.description.substring(0, 80)}...
      </p>

      {/* Author & Date */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 border-t border-gray-100 pt-3">
        <span>{news.author}</span>
        <span>•</span>
        <span>{formatTimeRelative(news.date || new Date())}</span>
      </div>

      {/* Stats & Button */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
            <Heart className="w-4 h-4" />
            <span>{news.likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{news.comments}</span>
          </button>
        </div>
        <button
          onClick={() => onViewDetail(news)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors"
        >
          Baca
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC<{ setActivePage?: (page: string) => void }> = ({ setActivePage }) => {
  const [selectedNews, setSelectedNews] = useState<NewsItemProps | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest news
  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      setLoading(true);
      const response = await NewsAPI.getPublishedNews({ limit: 2, page: 1 });
      setLatestNews(response.data);
    } catch (err) {
      console.error('Failed to fetch latest news:', err);
      setLatestNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNewsDetail = (news: NewsItemProps) => {
    setSelectedNews(news);
    setIsNewsModalOpen(true);
  };

  const handleViewAll = () => {
    if (setActivePage) {
      setActivePage('berita');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Selamat Datang di Portal BK! 👋</h2>
          <p className="text-blue-50">Tempat yang aman untuk berbagi, berkonsultasi, dan berkembang bersama</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Heart} label="Sesi Konseling" value="12" color="bg-pink-50 text-pink-600" />
          <StatCard icon={MessageCircle} label="Konsultasi Bulan Ini" value="8" color="bg-green-50 text-green-600" />
          <StatCard icon={Calendar} label="Reservasi Aktif" value="3" color="bg-orange-50 text-orange-600" />
          <StatCard icon={Users} label="Progres Pribadi" value="85%" color="bg-blue-50 text-blue-600" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Berita Terbaru dari BK</h3>
            <button
              onClick={handleViewAll}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin text-blue-600" size={32} />
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestNews.map((news) => (
                <NewsPreviewCard
                  key={news.id}
                  news={news}
                  onViewDetail={handleViewNewsDetail}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-lg font-medium">Tidak ada berita saat ini</p>
            </div>
          )}
        </div>
      </div>

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        news={selectedNews}
      />
    </>
  );
};

export default DashboardPage;