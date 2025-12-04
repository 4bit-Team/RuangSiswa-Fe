'use client'

import React, { useState } from 'react';
import { Heart, MessageCircle, Calendar, Users, ArrowRight, Eye } from 'lucide-react';
import { StatCardProps } from '@types';
import NewsDetailModal from '../modals/NewsDetailModal';
import { NewsItemProps } from '@types';
import { useRouter } from 'next/navigation';


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
        <span>{news.date}</span>
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
  const router = useRouter();

  // Sample news data
  const latestNews: NewsItemProps[] = [
    {
      id: 1,
      title: 'Tips Menghadapi Ujian Akhir Semester',
      description: 'Persiapan yang matang adalah kunci sukses menghadapi ujian. Berikut beberapa tips yang bisa membantu siswa-siswi...',
      author: 'Bu Sarah Wijaya',
      date: '15 Nov 2025',
      category: 'Akademik',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1434582881033-aaf475b8e6ad?w=500&h=300&fit=crop',
      likes: 42,
      comments: 8,
      views: 234,
    },
    {
      id: 2,
      title: 'Mengatasi Stress dan Kecemasan',
      description: 'Stress adalah bagian normal dari kehidupan, namun penting untuk mengelolanya dengan baik...',
      author: 'Pak Budi',
      date: '12 Nov 2025',
      category: 'Kesehatan Mental',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop',
      likes: 28,
      comments: 12,
      views: 189,
    },
  ];

  const handleViewNewsDetail = (news: NewsItemProps) => {
    setSelectedNews(news);
    setIsNewsModalOpen(true);
  };

  const handleViewAll = () => {
    // Prioritize parent-controlled navigation if provided
    if (setActivePage) {
      setActivePage('berita');
      return;
    }
    // Fallback: client-side route push (sesuaikan path jika berbeda)
    router.push('/berita');
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
          <h3 className="font-bold text-gray-900 text-lg mb-6">Status Progress Bimbingan</h3>
          
          <div className="space-y-6">
            {/* Main Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Penyelesaian Program Bimbingan</p>
                  <p className="text-xs text-gray-600 mt-1">Anda telah menyelesaikan 7 dari 10 sesi yang direncanakan</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">70%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>

            {/* Progress Details */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Selesai</p>
                <p className="text-2xl font-bold text-green-600">7</p>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Dalam Proses</p>
                <p className="text-2xl font-bold text-orange-600">2</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Akan Datang</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
            </div>

            {/* Current Focus */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Fokus Utama Saat Ini</p>
              <p className="text-sm font-semibold text-gray-900">Manajemen Stress dan Waktu</p>
              <p className="text-xs text-gray-600 mt-2">Konselor: Bu Sarah Wijaya</p>
            </div>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestNews.map((news) => (
              <NewsPreviewCard
                key={news.id}
                news={news}
                onViewDetail={handleViewNewsDetail}
              />
            ))}
          </div>
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