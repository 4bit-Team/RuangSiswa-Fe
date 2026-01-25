'use client'

import React, { useEffect, useState } from 'react';
import { Calendar, Users, FileText, BarChart3 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { authStorage } from '@/lib/authStorage';

// Interfaces
interface MetricCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
}

interface DashboardStatistics {
  keyMetrics: {
    avgKonselingPerMonth: { value: number; trend: string; trendUp: boolean };
    siswaAktif: { value: number; trend: string; trendUp: boolean };
    laporanDibuat: { value: number; trend: string; trendUp: boolean };
  };
  trends: {
    konselingBulanan: Array<{ month: string; value: number }>;
    kepuasanBulanan: Array<{ month: string; value: number }>;
  };
  distribution: {
    perKelas: Array<{ class: string; active: number; total: number }>;
  };
  performance: Array<{ label: string; value: number; color: string }>;
}

// Key Metric Card
const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, trend, trendUp }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
        <Icon className="text-red-600" size={24} />
      </div>
    </div>
    <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
    <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
    <p className={`text-xs flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
      <span className="mr-1">{trendUp ? '↗' : '↘'}</span> {trend}
    </p>
  </div>
);

const StatistikPage: React.FC = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = authStorage.getToken();
        
        if (!token) {
          throw new Error('Token tidak ditemukan. Silakan login kembali.');
        }

        console.log('Fetching statistics with token:', token.substring(0, 20) + '...');
        
        const response = await apiRequest('/statistics/dashboard', 'GET', undefined, token);
        console.log('Statistics response:', response);
        
        // Response langsung berisi data, bukan response.data
        if (response && typeof response === 'object') {
          setStatistics(response);
        } else {
          throw new Error('Response format tidak valid');
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        const errorMessage = err instanceof Error ? err.message : 'Gagal memuat statistik';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Memuat statistik...</p>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Gagal memuat data statistik'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Validasi struktur data
  if (!statistics.keyMetrics || !statistics.trends || !statistics.distribution || !statistics.performance) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Format data statistik tidak sesuai</p>
          <details className="mt-4 text-left max-w-md mx-auto bg-gray-100 p-4 rounded">
            <summary className="cursor-pointer font-semibold">Debug Info</summary>
            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(statistics, null, 2)}</pre>
          </details>
        </div>
      </div>
    );
  }

  const { keyMetrics, trends, distribution, performance } = statistics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Statistik & Analytics</h2>
        <p className="text-sm text-gray-600">Analisis performa dan tren konseling</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={Calendar} 
          label="Avg. Konseling/Bulan" 
          value={keyMetrics.avgKonselingPerMonth.value} 
          trend={keyMetrics.avgKonselingPerMonth.trend}
          trendUp={keyMetrics.avgKonselingPerMonth.trendUp}
        />
        <MetricCard 
          icon={Users} 
          label="Siswa Aktif" 
          value={keyMetrics.siswaAktif.value} 
          trend={keyMetrics.siswaAktif.trend}
          trendUp={keyMetrics.siswaAktif.trendUp}
        />
        <MetricCard 
          icon={FileText} 
          label="Laporan Dibuat" 
          value={keyMetrics.laporanDibuat.value} 
          trend={keyMetrics.laporanDibuat.trend}
          trendUp={keyMetrics.laporanDibuat.trendUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart - Bar & Line Combined */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tren Konseling Bulanan</h3>
          
          {/* Bar Chart */}
          <div className="mb-24">
            <div className="flex items-end justify-between space-x-1.5">
              {trends.konselingBulanan.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div 
                    className={`w-full bg-gradient-to-t from-red-600 to-red-500 rounded-t-lg transition-all duration-300 hover:opacity-90 cursor-pointer relative group`}
                    style={{ height: `${(item.value / 100) * 100}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.value} sesi
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 mt-3 font-medium">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart Overlay */}
          <div className="mb-6 relative -mt-8">
            <svg viewBox="0 0 1200 200" className="w-full h-48" preserveAspectRatio="none">
              {/* Y-axis labels background */}
              <defs>
                <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal grid lines */}
              <line x1="80" y1="20" x2="1200" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="80" y1="60" x2="1200" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="80" y1="100" x2="1200" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="80" y1="140" x2="1200" y2="140" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Y-axis */}
              <line x1="80" y1="10" x2="80" y2="140" stroke="#d1d5db" strokeWidth="2" />
              
              {/* X-axis */}
              <line x1="80" y1="140" x2="1200" y2="140" stroke="#d1d5db" strokeWidth="2" />
              
              {/* Y-axis labels */}
              <text x="70" y="35" fontSize="12" fill="#6b7280" textAnchor="end">100</text>
              <text x="70" y="85" fontSize="12" fill="#6b7280" textAnchor="end">50</text>
              <text x="70" y="135" fontSize="12" fill="#6b7280" textAnchor="end">25</text>
              <text x="70" y="185" fontSize="12" fill="#6b7280" textAnchor="end">0</text>
              
              {/* Line 1: Konseling (Blue - Solid) */}
              <polyline 
                points={generateLinePoints(trends.konselingBulanan)} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Line 2: Kepuasan (Green - Dashed) */}
              <polyline 
                points={generateLinePoints(trends.kepuasanBulanan)} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8,4"
              />
              
              {/* X-axis labels */}
              <text x="100" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Jan</text>
              <text x="200" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Feb</text>
              <text x="300" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Mar</text>
              <text x="400" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Apr</text>
              <text x="500" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Mei</text>
              <text x="600" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Jun</text>
              <text x="700" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Jul</text>
              <text x="800" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Agu</text>
              <text x="900" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Sep</text>
              <text x="1000" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Okt</text>
              <text x="1100" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Nov</text>
              <text x="1200" y="200" fontSize="12" fill="#6b7280" textAnchor="middle">Des</text>
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Konseling</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex gap-1">
                <div className="w-2 h-1 bg-green-500 rounded"></div>
                <div className="w-2 h-1 bg-white"></div>
              </div>
              <span className="text-sm text-gray-600">Kepuasan Siswa</span>
            </div>
            {/* NOTE: Penyelesaian Kasus per bulan - dihapus sementara menunggu tracking feature */}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{trends.konselingBulanan.reduce((sum, item) => sum + item.value, 0)}</p>
              <p className="text-xs text-gray-600 mt-1">Total Konseling</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(trends.kepuasanBulanan.reduce((sum, item) => sum + item.value, 0) / trends.kepuasanBulanan.length)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Kepuasan Siswa</p>
            </div>
          </div>
        </div>

        {/* Category Distribution - Enhanced Pie Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi Kategori Konseling</h3>
          {/* NOTE: Distribusi kategori konseling - menunggu implementasi tracking kategori di reservasi */}
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Fitur sedang dalam pengembangan</p>
          </div>
        </div>
      </div>

      {/* Class Distribution and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi per Kelas</h3>
          <div className="space-y-4">
            {distribution.perKelas.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Kelas {item.class}</span>
                  <span className="text-sm text-gray-600">{item.active} / {item.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all" 
                    style={{ width: `${item.total > 0 ? (item.active / item.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Metrik Performa</h3>
          <div className="space-y-4">
            {performance.map((metric, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className="text-sm font-bold text-gray-900">{metric.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${metric.color} h-2 rounded-full transition-all`} 
                    style={{ width: `${metric.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate SVG line points
function generateLinePoints(data: Array<{ month: string; value: number }>): string {
  const maxValue = Math.max(...data.map(d => d.value)) || 100;
  const startX = 100;
  const endX = 1200;
  const height = 140;
  const points: string[] = [];

  data.forEach((item, index) => {
    const x = startX + (index / (data.length - 1)) * (endX - startX);
    const y = height - (item.value / maxValue) * 120;
    points.push(`${x},${y}`);
  });

  return points.join(' ');
}

export default StatistikPage;
