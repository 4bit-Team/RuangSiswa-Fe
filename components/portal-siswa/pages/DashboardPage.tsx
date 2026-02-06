'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Calendar, Users, ArrowRight, Eye, Loader, CheckCircle, AlertCircle, TrendingUp, Target, Clock, AlertTriangle, Award } from 'lucide-react';
import { StatCardProps } from '@types';
import NewsDetailModal from '../modals/NewsDetailModal';
import { NewsItemProps } from '@types';
import NewsAPI, { getCleanPreview } from '@lib/newsAPI';
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

const GuidanceProgressSection: React.FC<{
  completedSessions: number;
  totalSessions: number;
  guidanceStatus: 'Normal' | 'Peringatan' | 'Perlu Tindak Lanjut';
  currentFocus: string;
  counselor: string;
}> = ({ completedSessions, totalSessions, guidanceStatus, currentFocus, counselor }) => {
  const progress = Math.round((completedSessions / totalSessions) * 100);

  const statusConfig = {
    'Normal': { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', text: 'text-green-700', label: 'Status Baik' },
    'Peringatan': { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', text: 'text-yellow-700', label: 'Perlu Perhatian' },
    'Perlu Tindak Lanjut': { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-700', label: 'Perlu Tindak Lanjut' }
  };

  const config = statusConfig[guidanceStatus];

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-6`}>
      <div className="space-y-5">
        {/* Header dengan Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">📊 Status Bimbingan Anda</h3>
            <p className="text-sm text-gray-600">Progres konseling dengan {counselor}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} border ${config.border}`}>
            {guidanceStatus === 'Normal' && <CheckCircle className={`w-4 h-4 ${config.icon}`} />}
            {guidanceStatus === 'Peringatan' && <AlertCircle className={`w-4 h-4 ${config.icon}`} />}
            {guidanceStatus === 'Perlu Tindak Lanjut' && <AlertCircle className={`w-4 h-4 ${config.icon}`} />}
            <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Progres Sesi Bimbingan</p>
            <span className="text-sm font-bold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {completedSessions} dari {totalSessions} sesi telah selesai
          </p>
        </div>

        {/* Focus & Counselor Info */}
        <div className="grid grid-cols-2 gap-3 border-t border-gray-300 pt-4">
          <div className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${config.icon}`} />
            <div>
              <p className="text-xs text-gray-600">Fokus Utama</p>
              <p className="text-sm font-semibold text-gray-900">{currentFocus}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${config.icon}`} />
            <div>
              <p className="text-xs text-gray-600">Konselor BK</p>
              <p className="text-sm font-semibold text-gray-900">{counselor}</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
          {guidanceStatus === 'Normal' && (
            <p className="text-xs text-green-700">
              ✅ <strong>Bagus!</strong> Anda menunjukkan progress yang baik. Lanjutkan konsistensi dalam mengikuti sesi.
            </p>
          )}
          {guidanceStatus === 'Peringatan' && (
            <p className="text-xs text-yellow-700">
              ⚠️ <strong>Catatan:</strong> Ada beberapa aspek yang perlu ditingkatkan. Diskusikan dengan konselor untuk strategi lebih baik.
            </p>
          )}
          {guidanceStatus === 'Perlu Tindak Lanjut' && (
            <p className="text-xs text-red-700">
              🔴 <strong>Penting!</strong> Ada masalah yang memerlukan perhatian khusus. Segera hubungi konselor untuk pertemuan intensif.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Kesiswaan Integration Component
const KesiswaanIntegrationSection: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const router = useRouter();

  // Sample data from Kesiswaan system
  const kesiswaanData = {
    attendance: {
      percentage: 90,
      status: 'Sangat Baik',
      recentDays: 18,
      totalDays: 20
    },
    tardiness: {
      currentMonth: 2,
      lastMonth: 4,
      trend: 'decreasing' as const,
      status: 'Membaik'
    },
    violations: {
      total: 4,
      pending: 1,
      inProgress: 1,
      resolved: 2
    }
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      router.push(`/home/siswa/${page}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">📋 Data Kesiswaan Anda</h3>
        <p className="text-indigo-50">Pantau kehadiran, keterlambatan, dan pelanggaran Anda di sekolah</p>
      </div>

      {/* Kesiswaan Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Card */}
        <div
          onClick={() => handleNavigate('kehadiran')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kehadiran</p>
                <p className="text-2xl font-bold text-green-600">{kesiswaanData.attendance.percentage}%</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-600">
            {kesiswaanData.attendance.recentDays}/{kesiswaanData.attendance.totalDays} hari hadir
          </p>
          <p className="text-xs font-semibold text-green-700 mt-1">✅ {kesiswaanData.attendance.status}</p>
        </div>

        {/* Tardiness Card */}
        <div
          onClick={() => handleNavigate('keterlambatan')}
          className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Keterlambatan</p>
                <p className="text-2xl font-bold text-orange-600">{kesiswaanData.tardiness.currentMonth}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xs text-gray-600">
            Bulan ini (sebelumnya: {kesiswaanData.tardiness.lastMonth})
          </p>
          <p className="text-xs font-semibold text-green-700 mt-1">↓ {kesiswaanData.tardiness.status}</p>
        </div>

        {/* Violations Card */}
        <div
          onClick={() => handleNavigate('pelanggaran')}
          className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pelanggaran</p>
                <p className="text-2xl font-bold text-red-600">{kesiswaanData.violations.total}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs text-gray-600">
            {kesiswaanData.violations.resolved} selesai, {kesiswaanData.violations.pending} menunggu
          </p>
          {kesiswaanData.violations.pending > 0 ? (
            <p className="text-xs font-semibold text-red-700 mt-1">⚠️ Ada yang perlu diperhatian</p>
          ) : (
            <p className="text-xs font-semibold text-green-700 mt-1">✅ Semua terkelola</p>
          )}
        </div>
      </div>

      {/* Quick Summary */}
      {kesiswaanData.violations.pending > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Ada yang memerlukan perhatian</p>
              <p className="text-sm text-red-700 mt-1">
                Anda memiliki {kesiswaanData.violations.pending} pelanggaran yang menunggu proses bimbingan. 
                Segera hubungi Guru BK untuk memulai sesi bimbingan.
              </p>
              <button
                onClick={() => handleNavigate('pelanggaran')}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Lihat Detail
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
        {getCleanPreview(news.description, 80)}
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
  const router = useRouter();
  const [selectedNews, setSelectedNews] = useState<NewsItemProps | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Guidance Progress State
  const [guidanceData] = useState({
    completedSessions: 7,
    totalSessions: 10,
    guidanceStatus: 'Normal' as const,
    currentFocus: 'Manajemen Stress & Waktu',
    counselor: 'Bu Sarah Wijaya'
  });

  // Fetch latest news
  useEffect(() => {
    fetchLatestNews();
  }, [refreshTrigger]);

  // Listen for refresh events from other components
  useEffect(() => {
    const handleRefreshNews = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('refreshNews', handleRefreshNews as EventListener);
    return () => {
      window.removeEventListener('refreshNews', handleRefreshNews as EventListener);
    };
  }, []);

  const fetchLatestNews = async () => {
    try {
      setLoading(true);
      const response = await NewsAPI.getPublishedNews({ limit: 2, page: 1 });
      // Ensure response.data is valid array of news items
      if (!response || !response.data) {
        console.warn('Invalid response from getPublishedNews:', response);
        setLatestNews([]);
        return;
      }

      const newsData = Array.isArray(response.data) 
        ? response.data.filter((item: any) => item && typeof item === 'object' && item.id)
        : [];
      
      setLatestNews(newsData);
    } catch (err) {
      console.error('Failed to fetch latest news:', err);
      setLatestNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNewsDetail = async (news: NewsItemProps) => {
    // Optimistically update views in UI
    setLatestNews((prev) =>
      prev.map((n) =>
        n.id === news.id ? { ...n, views: (n.views || 0) + 1 } : n
      )
    );
    setSelectedNews({ ...news, views: (news.views || 0) + 1 });
    setIsNewsModalOpen(true);
    try {
      await NewsAPI.incrementViews(news.id);
    } catch (e) {
      // Optionally handle error, but keep UI responsive
    }
  };

  const handleViewAll = () => {
    router.push('/home/siswa/berita/');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Selamat Datang di Portal BK! 👋</h2>
          <p className="text-blue-50">Tempat yang aman untuk berbagi, berkonsultasi, dan berkembang bersama</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard icon={Heart} label="Sesi Konseling" value="12" color="bg-pink-50 text-pink-600" />
          <StatCard icon={MessageCircle} label="Konsultasi Bulan Ini" value="8" color="bg-green-50 text-green-600" />
          <StatCard icon={Calendar} label="Reservasi Aktif" value="3" color="bg-orange-50 text-orange-600" />
        </div>

        <GuidanceProgressSection
          completedSessions={guidanceData.completedSessions}
          totalSessions={guidanceData.totalSessions}
          guidanceStatus={guidanceData.guidanceStatus}
          currentFocus={guidanceData.currentFocus}
          counselor={guidanceData.counselor}
        />

        <KesiswaanIntegrationSection onNavigate={setActivePage} />

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
          ) : latestNews && latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestNews.map((news) => {
                // Ensure news object is valid before rendering
                if (!news || !news.id) return null;
                return (
                  <NewsPreviewCard
                    key={news.id}
                    news={news}
                    onViewDetail={handleViewNewsDetail}
                  />
                );
              })}
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