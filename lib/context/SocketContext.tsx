import React, { createContext, useContext, useEffect, useRef, ReactNode, useCallback } from 'react'
import { Socket, io } from 'socket.io-client'
import { useAuth } from '@/hooks/useAuth'

interface SocketContextType {
  chatSocket: Socket | null
  callSocket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth()
  const chatSocketRef = useRef<Socket | null>(null)
  const callSocketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)

  useEffect(() => {
    if (user && token && !authLoading) {
      // Extract base URL from API_URL (remove /api suffix)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const baseUrl = API_URL.replace('/api', '')

      // Initialize Chat Socket
      if (!chatSocketRef.current) {
        const chatSocket = io(`${baseUrl}/chat`, {
          auth: {
            token: token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        })

        chatSocket.on('connect', () => {
          console.log('✅ [SocketProvider] Chat Socket connected to /chat namespace')
          setIsConnected(true)
        })

        chatSocket.on('disconnect', (reason: string) => {
          console.log('❌ [SocketProvider] Chat Socket disconnected from /chat namespace - Reason:', reason)
          if (reason === 'io server disconnect') {
            console.log('📡 Server disconnected, attempting to reconnect...')
          } else if (reason === 'ping timeout') {
            console.log('⏱️ Ping timeout detected')
          }
        })

        chatSocket.on('connect_error', (error: any) => {
          console.error('❌ [SocketProvider] Chat Socket connection error:', error)
        })

        chatSocketRef.current = chatSocket
      }

      // Initialize Call Socket
      if (!callSocketRef.current) {
        const callSocket = io(`${baseUrl}/call`, {
          auth: {
            token: token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        })

        callSocket.on('connect', () => {
          console.log('✅ [SocketProvider] Call Socket connected to /call namespace')
        })

        callSocket.on('disconnect', (reason: string) => {
          console.log('❌ [SocketProvider] Call Socket disconnected from /call namespace - Reason:', reason)
        })

        callSocket.on('connect_error', (error: any) => {
          console.error('❌ [SocketProvider] Call Socket connection error:', error)
        })

        callSocketRef.current = callSocket
      }

      return () => {
        // Cleanup on unmount
        if (chatSocketRef.current) {
          chatSocketRef.current.disconnect()
          chatSocketRef.current = null
        }
        if (callSocketRef.current) {
          callSocketRef.current.disconnect()
          callSocketRef.current = null
        }
      }
    }
  }, [user, token, authLoading])

  const value: SocketContextType = {
    chatSocket: chatSocketRef.current,
    callSocket: callSocketRef.current,
    isConnected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export default SocketContext
