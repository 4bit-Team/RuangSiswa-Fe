/**
 * Helper untuk manage auth storage (localStorage)
 * Digunakan untuk save & retrieve user profile & token
 */

export interface AuthData {
  user: any | null
  token: string | null
}

export const authStorage = {
  // Save token (ada 2 key: access_token & token untuk compatibility)
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
      localStorage.setItem('token', token)
    }
  },

  // Get token (cek access_token dulu, fallback ke token)
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token') || localStorage.getItem('token')
  },

  // Save user profile
  setProfile: (profile: any) => {
    if (typeof window !== 'undefined' && profile) {
      localStorage.setItem('auth_profile', JSON.stringify(profile))
      console.log('✅ [authStorage] Profile saved to localStorage')
    }
  },

  // Get user profile
  getProfile: (): any | null => {
    if (typeof window === 'undefined') return null
    try {
      const profileStr = localStorage.getItem('auth_profile')
      if (profileStr) {
        return JSON.parse(profileStr)
      }
    } catch (error) {
      console.error('❌ [authStorage] Error parsing auth_profile:', error)
    }
    return null
  },

  // Save role
  setRole: (role: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('role', role)
    }
  },

  // Get role
  getRole: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('role')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    const token = authStorage.getToken()
    const profile = authStorage.getProfile()
    return !!token && !!profile
  },

  // Clear all auth data
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('auth_profile')
      localStorage.removeItem('role')
      console.log('🗑️ [authStorage] All auth data cleared')
    }
  },
}
