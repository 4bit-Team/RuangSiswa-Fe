'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Calendar, Users, ArrowRight, Eye, Loader, CheckCircle, AlertCircle, TrendingUp, Target, Clock, AlertTriangle, Award } from 'lucide-react';
import { StatCardProps } from '@types';
import NewsDetailModal from '../modals/NewsDetailModal';
import { NewsItemProps } from '@types';
import NewsAPI, { getCleanPreview } from '@lib/newsAPI';
import { formatTimeRelative } from '@lib/timeFormat';
import { useAuth } from '@hooks/useAuth';
import { apiRequest } from '@lib/api';


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



// Kesiswaan Integration Component - DEPRECATED: Cards now integrated in main dashboard

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
  const { user, token } = useAuth();
  const [selectedNews, setSelectedNews] = useState<NewsItemProps | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Stats State
  const [stats, setStats] = useState({
    totalCounselingSessions: 0,
    thisMonthConsultations: 0,
    activeReservations: 0
  });
  
  // Kesiswaan Data State
  const [kesiswaanData, setKesiswaanData] = useState({
    attendance: {
      percentage: 0,
      recentDays: 0,
      totalDays: 0
    },
    tardiness: {
      currentMonth: 0,
      lastMonth: 0,
      trend: 'decreasing' as 'decreasing' | 'increasing',
    },
    violations: {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0
    }
  });

  // Fetch data on component mount
  useEffect(() => {
    if (user && token) {
      fetchLatestNews();
      fetchStats();
      fetchKesiswaanData();
    }
  }, [user, token, refreshTrigger]);

  const fetchStats = async () => {
    try {
      // Fetch total counseling sessions
      const sessionsRes = await apiRequest('/reservasi/student/my-reservations', 'GET', undefined, token);
      const totalSessions = Array.isArray(sessionsRes) ? sessionsRes.length : 0;
      
      // Fetch group reservations
      const groupRes = await apiRequest('/reservasi/group/student/my-group-reservations', 'GET', undefined, token);
      const thisMonthConsultations = Array.isArray(groupRes) ? groupRes.length : 0;
      
      // Fetch active reservations (approved status)
      const allRes = Array.isArray(sessionsRes) ? sessionsRes : [];
      const activeReservations = allRes.filter((r: any) => r.status === 'approved').length;
      
      setStats({
        totalCounselingSessions: totalSessions,
        thisMonthConsultations: thisMonthConsultations,
        activeReservations: activeReservations
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const fetchKesiswaanData = async () => {
    try {
      // Fetch attendance data
      const attendanceRes = await apiRequest('/attendance', 'GET', undefined, token);
      const tardinessRes = await apiRequest('/tardiness', 'GET', undefined, token);
      const violationsRes = await apiRequest('/violations', 'GET', undefined, token);
      
      // Process attendance
      let attendanceData = {
        percentage: 0,
        status: 'Tidak Ada Data',
        recentDays: 0,
        totalDays: 0
      };
      
      if (attendanceRes && attendanceRes.percentage !== undefined) {
        attendanceData = {
          percentage: Math.round(attendanceRes.percentage),
          status: attendanceRes.percentage >= 90 ? 'Sangat Baik' : attendanceRes.percentage >= 80 ? 'Baik' : 'Perlu Ditingkatkan',
          recentDays: attendanceRes.presentDays || 0,
          totalDays: attendanceRes.totalDays || 0
        };
      }
      
      // Process tardiness
      let tardinessData = {
        currentMonth: 0,
        lastMonth: 0,
        trend: 'decreasing' as 'decreasing' | 'increasing',
        status: 'Tidak Ada Data'
      };
      
      if (tardinessRes && tardinessRes.currentMonth !== undefined) {
        tardinessData = {
          currentMonth: tardinessRes.currentMonth || 0,
          lastMonth: tardinessRes.lastMonth || 0,
          trend: (tardinessRes.currentMonth || 0) < (tardinessRes.lastMonth || 0) ? 'decreasing' : 'increasing',
          status: (tardinessRes.currentMonth || 0) < (tardinessRes.lastMonth || 0) ? 'Membaik' : 'Meningkat'
        };
      }
      
      // Process violations
      let violationsData = {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
      };
      
      if (violationsRes && Array.isArray(violationsRes)) {
        violationsData = {
          total: violationsRes.length,
          pending: violationsRes.filter((v: any) => v.status === 'pending').length,
          inProgress: violationsRes.filter((v: any) => v.status === 'in_progress').length,
          resolved: violationsRes.filter((v: any) => v.status === 'resolved').length
        };
      }
      
      setKesiswaanData({
        attendance: attendanceData,
        tardiness: tardinessData,
        violations: violationsData
      });
    } catch (error) {
      console.error('Error fetching kesiswaan data:', error);
    }
  };

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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">🏠 Dashboard Siswa</h3>
          <p className="text-blue-50">Pantau aktivitas konseling, kehadiran, dan berita terbaru dari BK</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-pink-600" />
              <p className="text-sm sm:text-xs text-gray-600 font-medium">Sesi Konseling</p>
            </div>
            <p className="text-2xl font-bold text-pink-700">{stats.totalCounselingSessions}</p>
            <p className="text-sm sm:text-xs text-pink-600 mt-1">Total</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm sm:text-xs text-gray-600 font-medium">Konsultasi Bulan Ini</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.thisMonthConsultations}</p>
            <p className="text-sm sm:text-xs text-green-600 mt-1">Bulan Ini</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-sm sm:text-xs text-gray-600 font-medium">Reservasi Aktif</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">{stats.activeReservations}</p>
            <p className="text-sm sm:text-xs text-orange-600 mt-1">Aktif</p>
          </div>

          {/* Attendance Card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm sm:text-xs text-gray-600 font-medium">Kehadiran</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{kesiswaanData.attendance.percentage}%</p>
            <p className="text-sm sm:text-xs text-green-600 mt-1">Persentase</p>
          </div>

          {/* Tardiness Card */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="text-sm sm:text-xs text-gray-600 font-medium">Keterlambatan</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">{kesiswaanData.tardiness.currentMonth}</p>
            <p className="text-sm sm:text-xs text-orange-600 mt-1">Bulan Ini</p>
          </div>

          {/* Violations Card */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm sm:text-xs text-gray-600 font-medium">Pelanggaran</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{kesiswaanData.violations.total}</p>
            <p className="text-sm sm:text-xs text-red-600 mt-1">Total</p>
          </div>
        </div>

        {/* Quick Summary */}
        {kesiswaanData.violations.pending > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">
              ⚠️ <strong>Perhatian:</strong> Anda memiliki {kesiswaanData.violations.pending} pelanggaran yang menunggu proses bimbingan. 
              Segera hubungi Guru BK untuk memulai sesi bimbingan.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Berita Terbaru dari BK
              </h3>
              <button
                onClick={handleViewAll}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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

        {/* News Detail Modal */}
        <NewsDetailModal
          isOpen={isNewsModalOpen}
          onClose={() => setIsNewsModalOpen(false)}
          news={selectedNews}
        />
      </div>
    </>
  );
};

export default DashboardPage;