import { useState, useEffect } from 'react'
import { authStorage } from '@/lib/authStorage'

interface User {
  id: number
  fullName: string
  email: string
  role: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      console.log('🔐 [useAuth] Initializing auth...')
      
      // Get token from authStorage
      const storedToken = authStorage.getToken()
      console.log('🔑 [useAuth] Token found:', !!storedToken)
      
      if (storedToken) {
        setToken(storedToken)
        
        // Get user from authStorage
        const storedProfile = authStorage.getProfile()
        if (storedProfile) {
          console.log('👤 [useAuth] User from localStorage:', storedProfile)
          setUser(storedProfile)
        } else {
          console.warn('⚠️ [useAuth] No auth_profile in localStorage')
        }
      } else {
        console.warn('⚠️ [useAuth] No token found in localStorage')
      }
    } catch (error) {
      console.error('❌ [useAuth] Error in useAuth:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, token, loading }
}
