'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Search, RefreshCw, Unlock, AlertCircle, Clock } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { API_URL, apiRequest } from '@/lib/api'

interface BlockedUser {
  userId: number
  reason: string
  blockedUntil: number
  remainingMs: number
}

const BlockListPage: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [suspiciousUsers, setSuspiciousUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'blocked' | 'suspicious'>('blocked')
  const [callSocket, setCallSocket] = useState<Socket | null>(null)
  const [unblocking, setUnblocking] = useState<number | null>(null)

  // Fetch blocked users from backend
  const fetchBlockedUsers = async () => {
    try {
      setLoading(true)
      console.log('📥 Fetching blocked users...')
      
      const response = await apiRequest('/admin/blocked-users', 'GET')
      console.log('📊 Blocked users response:', response)
      
      // Backend returns: { status: 'success', data: [...], total: N }
      // or just returns the array directly
      const data = Array.isArray(response) ? response : (response?.data || [])
      
      console.log(`✅ Loaded ${data.length} blocked users`)
      setBlockedUsers(data)
    } catch (error) {
      console.error('❌ Failed to fetch blocked users:', error)
      alert('Gagal mengambil data blocked users')
      setBlockedUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch suspicious users
  const fetchSuspiciousUsers = async () => {
    try {
      console.log('📥 Fetching suspicious users...')
      
      const response = await apiRequest('/admin/suspicious-users', 'GET')
      console.log('📊 Suspicious users response:', response)
      
      // Backend returns: { status: 'success', data: [...], total: N }
      // or just returns the array directly
      const data = Array.isArray(response) ? response : (response?.data || [])
      
      console.log(`✅ Loaded ${data.length} suspicious users`)
      setSuspiciousUsers(data)
    } catch (error) {
      console.error('❌ Failed to fetch suspicious users:', error)
      setSuspiciousUsers([])
    }
  }

  useEffect(() => {
    // Initialize call socket
    const baseUrl = API_URL.replace('/api', '')
    const socket = io(`${baseUrl}/call`, {
      reconnection: true,
    })

    socket.on('connect', () => {
      console.log('✅ Call socket connected for admin')
    })

    setCallSocket(socket)

    // Fetch initial data
    fetchBlockedUsers()
    fetchSuspiciousUsers()

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchBlockedUsers()
      fetchSuspiciousUsers()
    }, 10000)

    return () => {
      socket.disconnect()
      clearInterval(interval)
    }
  }, [])

  const handleUnblockUser = async (userId: number) => {
    if (!confirm(`Apakah Anda yakin ingin unblock user ${userId}?`)) return

    try {
      setUnblocking(userId)
      console.log(`🔓 Attempting to unblock user ${userId} from ${activeTab} list...`)

      // Call REST API to unblock
      const response = await apiRequest(`/admin/unblock/${userId}`, 'POST')
      
      console.log('📡 Unblock response:', response)

      // Check if unblock was actually successful
      // Backend returns: { status: 'success', message: '...', unblocked: true/false }
      // IMPORTANT: Only treat as success if unblocked === true
      if (response && response.unblocked === true) {
        console.log(`✅ User ${userId} unblocked successfully`)
        
        // Immediately remove from current list (blocked atau suspicious)
        if (activeTab === 'blocked') {
          setBlockedUsers(prev => prev.filter((u) => u.userId !== userId))
        } else {
          setSuspiciousUsers(prev => prev.filter((u) => u.userId !== userId))
        }
        
        // Small delay then refresh to ensure backend is updated
        setTimeout(async () => {
          await fetchBlockedUsers()
          await fetchSuspiciousUsers()
        }, 500)
        
        alert('✅ User berhasil di-unblock!')
      } else {
        // Error response - user not found in either blocklist
        const errorMsg = response?.message || 'User tidak ditemukan atau sudah di-unblock'
        console.error(`❌ Failed to unblock: ${errorMsg}`)
        alert(`❌ Gagal unblock: ${errorMsg}`)
        
        // Refresh list anyway to sync with backend
        await fetchBlockedUsers()
        await fetchSuspiciousUsers()
      }
      
      setUnblocking(null)
    } catch (error: any) {
      console.error('❌ Error unblocking user:', error)
      
      const errorMsg = error?.response?.data?.message || 
                      error?.message || 
                      'Terjadi kesalahan saat unblock'
      
      alert(`❌ Gagal unblock user: ${errorMsg}`)
      
      // Refresh list to sync state with backend
      console.log('🔄 Refreshing list to sync with backend...')
      await fetchBlockedUsers()
      await fetchSuspiciousUsers()
      
      setUnblocking(null)
    }
  }

  const handleRefreshList = async () => {
    console.log('🔄 Manually refreshing block list...')
    setLoading(true)
    await fetchBlockedUsers()
    await fetchSuspiciousUsers()
    console.log('✅ Refresh complete')
  }

  const filteredUsers = (activeTab === 'blocked' ? blockedUsers : suspiciousUsers).filter((user: any) =>
    user.userId?.toString().includes(searchQuery.toLowerCase())
  )

  const formatTimeRemaining = (remainingMs: number) => {
    if (remainingMs <= 0) return 'Akan dilepas segera'
    
    const seconds = Math.floor(remainingMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Block List - ICE Candidate Spam</h2>
          <p className="text-gray-600 text-sm mt-1">
            Kelola users yang terblokir karena terlalu banyak ICE candidate ({blockedUsers.length} aktif)
          </p>
        </div>
        <button
          onClick={handleRefreshList}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('blocked')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === 'blocked'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Terblokir ({blockedUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('suspicious')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            activeTab === 'suspicious'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Mencurigakan ({suspiciousUsers.length})
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-blue-900">Tentang Block List</h3>
          <p className="text-sm text-blue-800 mt-1 mb-2">
            Ada 2 kategori user yang dipantau:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>
              <strong>🚫 Terblokir:</strong> User yang sudah officially blocked (tidak bisa send ICE candidate). 
              Otomatis unblock dalam 60 detik atau click "Unblock" untuk immediate removal.
            </li>
            <li>
              <strong>⚠️ Mencurigakan:</strong> User yang detect spam (≥50 ICE candidates dalam 10 detik) 
              tapi belum blocked. Bisa unblock untuk allow mereka lanjut send candidates.
            </li>
          </ul>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            {blockedUsers.length === 0 ? (
              <div className="space-y-2">
                <div className="text-4xl">✨</div>
                <p className="text-gray-600 font-medium">Tidak ada user yang {activeTab === 'blocked' ? 'terblokir' : 'mencurigakan'}</p>
                <p className="text-gray-500 text-sm">Sistem berjalan dengan lancar!</p>
              </div>
            ) : (
              <p className="text-gray-500">User tidak ditemukan</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User ID</th>
                  {activeTab === 'blocked' && (
                    <>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Alasan Blokir</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Waktu Unblock</th>
                    </>
                  )}
                  {activeTab === 'suspicious' && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ICE Candidates</th>
                  )}
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user.userId} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">User #{user.userId}</p>
                    </td>
                    {activeTab === 'blocked' && (
                      <>
                        <td className="px-6 py-3">
                          <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded">
                            {user.reason}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{formatTimeRemaining(user.remainingMs)}</span>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === 'suspicious' && (
                      <td className="px-6 py-3">
                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {user.candidateCount} candidates
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleUnblockUser(user.userId)}
                        disabled={unblocking === user.userId}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition disabled:opacity-50 text-sm font-medium"
                      >
                        <Unlock size={16} />
                        <span>{unblocking === user.userId ? 'Unblocking...' : 'Unblock'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Terblokir</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{blockedUsers.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Mencurigakan</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{suspiciousUsers.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Users di Monitor</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{blockedUsers.length + suspiciousUsers.length}</p>
        </div>
      </div>

      {/* Help Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>✓ <strong>Threshold Spam:</strong> 50+ ICE candidates per 10 detik = Suspicious</li>
          <li>✓ <strong>Threshold Block:</strong> User akan blocked jika terus spam setelah suspicious</li>
          <li>✓ <strong>Block Duration:</strong> 60 detik (otomatis hilang) atau unblock manual</li>
          <li>✓ <strong>Frontend Throttle:</strong> Max 15 candidates per detik</li>
          <li>✓ <strong>Backend Rate Limit:</strong> Max 30 candidates per detik</li>
          <li>✓ Klik "Unblock" untuk remove user dari blocked/suspicious list</li>
        </ul>
      </div>
    </div>
  )
}

export default BlockListPage
