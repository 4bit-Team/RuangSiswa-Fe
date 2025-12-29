'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface User {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
  status: string
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'siswa',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await apiRequest('/users', 'GET')
      const usersArray = Array.isArray(data) ? data : data.data || []
      
      // Ensure all users have required fields with defaults
      const validatedUsers = usersArray.map((user: any) => ({
        id: user.id || 0,
        username: user.username || 'Unknown',
        email: user.email || 'unknown@example.com',
        role: user.role || 'siswa',
        createdAt: user.createdAt || new Date().toISOString(),
        status: user.status || 'active',
      }))
      
      setUsers(validatedUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      if (!formData.username || !formData.email || !formData.password) {
        alert('Semua field harus diisi')
        return
      }

      await apiRequest('/auth/register', 'POST', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      setShowCreateModal(false)
      setFormData({ username: '', email: '', password: '', role: 'siswa' })
      await loadUsers()
      alert('User berhasil dibuat!')
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Gagal membuat user')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return

    try {
      await apiRequest(`/users/${userId}`, 'DELETE')
      await loadUsers()
      alert('User berhasil dihapus!')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Gagal menghapus user')
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || (user.role || '').toLowerCase() === filterRole
    return matchesSearch && matchesRole
  })

  const roleColors: Record<string, string> = {
    bk: 'bg-purple-100 text-purple-800',
    siswa: 'bg-blue-100 text-blue-800',
    kesiswaan: 'bg-green-100 text-green-800',
    admin: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Create Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 text-sm mt-1">Kelola akun pengguna di sistem</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={20} />
          <span>Tambah User</span>
        </button>
      </div>

      {/* Filter dan Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="bk">BK (Counselor)</option>
            <option value="siswa">Siswa</option>
            <option value="kesiswaan">Kesiswaan</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <p>Memuat data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada user ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Terdaftar</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{user.username || '-'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-600">{user.email || '-'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${roleColors[user.role?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800'}`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tambah User Baru</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPasswordField ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordField(!showPasswordField)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    {showPasswordField ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="siswa">Siswa</option>
                  <option value="bk">BK (Counselor)</option>
                  <option value="kesiswaan">Kesiswaan</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Buat User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage