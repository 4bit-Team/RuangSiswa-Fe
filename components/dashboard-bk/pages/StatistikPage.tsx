'use client'

import React from 'react';
import { Calendar, Users, FileText, BarChart3 } from 'lucide-react';

// Interfaces
interface MetricCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Statistik & Analytics</h2>
        <p className="text-sm text-gray-600">Analisis performa dan tren konseling</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard 
          icon={Calendar} 
          label="Avg. Konseling/Bulan" 
          value="54" 
          trend="+12% dari bulan lalu"
          trendUp={true}
        />
        <MetricCard 
          icon={Users} 
          label="Siswa Aktif" 
          value="156" 
          trend="+8% dari bulan lalu"
          trendUp={true}
        />
        <MetricCard 
          icon={FileText} 
          label="Laporan Dibuat" 
          value="248" 
          trend="+15% dari bulan lalu"
          trendUp={true}
        />
        <MetricCard 
          icon={BarChart3} 
          label="Success Rate" 
          value="89%" 
          trend="+5% dari bulan lalu"
          trendUp={true}
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
              {[
                { height: 30, label: 'Jan', color: 'from-blue-500 to-blue-400' },
                { height: 35, label: 'Feb', color: 'from-blue-600 to-blue-500' },
                { height: 32, label: 'Mar', color: 'from-blue-500 to-blue-400' },
                { height: 38, label: 'Apr', color: 'from-indigo-600 to-indigo-500' },
                { height: 45, label: 'Mei', color: 'from-indigo-600 to-indigo-500' },
                { height: 42, label: 'Jun', color: 'from-indigo-600 to-indigo-500' },
                { height: 50, label: 'Jul', color: 'from-purple-600 to-purple-500' },
                { height: 48, label: 'Agu', color: 'from-purple-600 to-purple-500' },
                { height: 55, label: 'Sep', color: 'from-pink-600 to-pink-500' },
                { height: 58, label: 'Okt', color: 'from-pink-600 to-pink-500' },
                { height: 62, label: 'Nov', color: 'from-red-600 to-red-500' },
                { height: 73, label: 'Des', color: 'from-red-600 to-red-500' },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div 
                    className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-300 hover:opacity-90 cursor-pointer relative group`}
                    style={{ height: `${item.height}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.round(item.height * 2)} siswa
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 mt-3 font-medium">{item.label}</span>
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
                points="100,130 200,110 300,125 400,95 500,60 600,75 700,40 800,55 900,25 1000,20 1100,10 1200,5"
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Line 2: Kepuasan (Green - Dashed) */}
              <polyline 
                points="100,80 200,78 300,82 400,72 500,65 600,70 700,62 800,66 900,58 1000,62 1100,68 1200,72"
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8,4"
              />
              
              {/* Line 3: Penyelesaian (Orange - Solid) */}
              <polyline 
                points="100,110 200,98 300,108 400,82 500,65 600,72 700,55 800,62 900,42 1000,48 1100,55 1200,62"
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
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
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-amber-500 rounded"></div>
              <span className="text-sm text-gray-600">Penyelesaian Kasus</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">648</p>
              <p className="text-xs text-gray-600 mt-1">Total Konseling</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">89%</p>
              <p className="text-xs text-gray-600 mt-1">Kepuasan Siswa</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">92%</p>
              <p className="text-xs text-gray-600 mt-1">Penyelesaian Kasus</p>
            </div>
          </div>
        </div>

        {/* Category Distribution - Enhanced Pie Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi Kategori Konseling</h3>
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-56 h-56">
              {/* Donut Chart using SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="20"/>
                
                {/* Akademik - 35% (pink) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="20" 
                  strokeDasharray="87.96 251.33" strokeDashoffset="0" strokeLinecap="round"/>
                
                {/* Sosial - 28% (green) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" 
                  strokeDasharray="70.37 251.33" strokeDashoffset="-87.96" strokeLinecap="round"/>
                
                {/* Karir - 22% (orange) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" 
                  strokeDasharray="55.29 251.33" strokeDashoffset="-158.33" strokeLinecap="round"/>
                
                {/* Keluarga - 15% (purple) */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="20" 
                  strokeDasharray="37.70 251.33" strokeDashoffset="-213.62" strokeLinecap="round"/>
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-2xl font-bold text-gray-900">226</p>
                <p className="text-xs text-gray-600">Kasus</p>
              </div>
            </div>
          </div>
          
          {/* Legend with percentages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Akademik</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">79</span>
                <span className="text-xs text-pink-600 font-semibold">35%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Sosial</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">63</span>
                <span className="text-xs text-green-600 font-semibold">28%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Karir</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">50</span>
                <span className="text-xs text-orange-600 font-semibold">22%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Keluarga</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">34</span>
                <span className="text-xs text-purple-600 font-semibold">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Distribution and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi per Kelas</h3>
          <div className="space-y-4">
            {[
              { class: 'X', active: 45, total: 100 },
              { class: 'XI', active: 65, total: 130 },
              { class: 'XII', active: 46, total: 120 }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Kelas {item.class}</span>
                  <span className="text-sm text-gray-600">{item.active} / {item.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all" 
                    style={{ width: `${(item.active / item.total) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Metrik Performa</h3>
          <div className="space-y-4">
            {[
              { label: 'Response Time', value: 92, color: 'bg-indigo-600' },
              { label: 'Satisfaction', value: 88, color: 'bg-purple-600' },
              { label: 'Completion', value: 89, color: 'bg-pink-600' },
              { label: 'Follow-up', value: 85, color: 'bg-blue-600' }
            ].map((metric, i) => (
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

export default StatistikPage;
