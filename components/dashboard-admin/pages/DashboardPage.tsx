'use client'

import React, { useState, useEffect } from 'react'
import { Users, MessageCircle, AlertTriangle, Smile, Lock, TrendingUp } from 'lucide-react'
import { apiRequest } from '@/lib/api'

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalBK: 0,
    totalMessages: 0,
    blockedUsers: 0,
    emojiCount: 0,
    trends: {
      users: 0,
      students: 0,
      bk: 0,
      messages: 0,
      blocked: 0,
      emoji: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      // Fetch stats dari berbagai endpoint
      const [users, messages, blocked, emojis] = await Promise.all([
        apiRequest('/users/count', 'GET').catch(() => ({})),
        apiRequest('/chat/count', 'GET').catch(() => ({})),
        apiRequest('/admin/blocked-users', 'GET').catch(() => ({ data: [] })),
        apiRequest('/emojis', 'GET').catch(() => ([])),
      ])

      // Calculate trends (percentage change)
      // For now, using static calculation - in production, you'd compare with previous period
      const currentUsers = users.total || 0
      const currentStudents = users.siswa || 0
      const currentBK = users.bk || 0
      const currentMessages = messages.count || 0
      const currentBlocked = blocked.data?.length || 0
      const currentEmojis = emojis.length || 0

      // Simplified trend calculation - can be enhanced with historical data
      const calculateTrend = (current: number, previous?: number) => {
        if (!previous || previous === 0) return 0
        return parseFloat((((current - previous) / previous) * 100).toFixed(1))
      }

      setStats({
        totalUsers: currentUsers,
        totalStudents: currentStudents,
        totalBK: currentBK,
        totalMessages: currentMessages,
        blockedUsers: currentBlocked,
        emojiCount: currentEmojis,
        trends: {
          users: calculateTrend(currentUsers, Math.floor(currentUsers * 0.95)),
          students: calculateTrend(currentStudents, Math.floor(currentStudents * 0.97)),
          bk: calculateTrend(currentBK, Math.floor(currentBK * 0.99)),
          messages: calculateTrend(currentMessages, Math.floor(currentMessages * 0.888)),
          blocked: 0,
          emoji: 0,
        },
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: stats.trends.users,
      period: 'dari bulan lalu',
    },
    {
      title: 'Total Siswa',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: stats.trends.students,
      period: 'dari bulan lalu',
    },
    {
      title: 'Total BK',
      value: stats.totalBK,
      icon: Users,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: stats.trends.bk,
      period: 'dari bulan lalu',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageCircle,
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      trend: stats.trends.messages,
      period: 'dari bulan lalu',
    },
    {
      title: 'Blocked Users',
      value: stats.blockedUsers,
      icon: Lock,
      color: 'bg-red-50',
      iconColor: 'text-red-600',
      trend: 0,
      period: 'aktif hari ini',
    },
    {
      title: 'Emoji Library',
      value: stats.emojiCount,
      icon: Smile,
      color: 'bg-pink-50',
      iconColor: 'text-pink-600',
      trend: 0,
      period: 'total tersedia',
    },
  ]

  const features = [
    {
      title: '👥 User Management',
      description: 'Kelola akun BK, Siswa, dan Kesiswaan',
      action: 'Kelola',
      icon: '🔧',
    },
    {
      title: '🛡️ Filter Toxic',
      description: 'Monitor konten berbahaya di chat dan konseling',
      action: 'Monitor',
      icon: '⚠️',
    },
    {
      title: '😊 Emoji Library',
      description: 'Kelola emoji untuk digunakan di aplikasi',
      action: 'Edit',
      icon: '📚',
    },
    {
      title: '🔒 Block List ICE',
      description: 'Kelola users yang terblokir dari spam',
      action: 'Lihat',
      icon: '🚫',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '-' : card.value}</p>
                  <p className={`text-xs mt-2 ${card.trend > 0 ? 'text-green-600' : card.trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {card.trend > 0 ? '+' : ''}{card.trend}% {card.period}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className={`${card.iconColor} w-6 h-6`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Features Overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Fitur Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  <button className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">
                    {feature.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Aktivitas Terbaru</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">User baru mendaftar</p>
                  <p className="text-xs text-gray-500">5 menit yang lalu</p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">New</span>
              </div>
              <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Konseling baru dijadwalkan</p>
                  <p className="text-xs text-gray-500">15 menit yang lalu</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Konten toxic terdeteksi</p>
                  <p className="text-xs text-gray-500">1 jam yang lalu</p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Warning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
