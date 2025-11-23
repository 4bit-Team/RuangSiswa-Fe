'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Phone, Video, MoreVertical, Send, Search, Loader } from 'lucide-react'
import { ChatListItemProps, ChatBubbleProps } from '@types'
import CallModal from '../modals/CallModal'
import { apiRequest, API_URL } from '@lib/api'
import { useAuth } from '@/hooks/useAuth'
import { io, Socket } from 'socket.io-client'

interface APIMessage {
  id: number
  content: string
  messageType: string
  sender: { id: number; fullName: string }
  receiver: { id: number; fullName: string }
  createdAt: string
  isEdited: boolean
  isDeleted: boolean
}

interface APIConversation {
  id: number
  sender: { id: number; fullName: string; username?: string; profile?: { photoUrl?: string } }
  receiver: { id: number; fullName: string; username?: string; profile?: { photoUrl?: string } }
  lastMessage?: APIMessage
  messages?: APIMessage[]
  unreadCount?: number
  lastMessageAt: string
}

interface Message {
  id: number
  sender: 'user' | 'counselor'
  content: string
  timestamp: string
  isEdited: boolean
  isDeleted: boolean
}

const ChatPage: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<APIConversation[]>([])
  const [activeCounselorId, setActiveCounselorId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && token && !authLoading) {
      // Extract base URL from API_URL (remove /api suffix)
      const baseUrl = API_URL.replace('/api', '')
      const socket = io(`${baseUrl}/chat`, {
        auth: {
          token: token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      socket.on('connect', () => {
        console.log('✅ [ChatPage] WebSocket connected')
      })

      socket.on('disconnect', () => {
        console.log('❌ [ChatPage] WebSocket disconnected')
      })

      socket.on('message-received', (data: any) => {
        console.log('📨 [ChatPage] Message received via WebSocket:', data)
        
        setMessages((prev: Message[]) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some((msg) => msg.id === data.message.id)
          if (messageExists) {
            console.log('⚠️ [ChatPage] Message already exists, skipping duplicate:', data.message.id)
            return prev
          }
          
          const newMessage: Message = {
            id: data.message.id,
            sender: data.message.sender.id === user?.id ? 'user' : 'counselor',
            content: data.message.isDeleted ? '[Pesan dihapus]' : data.message.content,
            timestamp: formatMessageTime(data.message.createdAt),
            isEdited: data.message.isEdited,
            isDeleted: data.message.isDeleted,
          }
          
          return [...prev, newMessage]
        })
        
        // Refresh conversation list to update last message (don't await)
        fetchConversations()
      })

      socketRef.current = socket

      return () => {
        socket.disconnect()
      }
    }
  }, [user, token, authLoading])

  // Fetch conversations on mount
  useEffect(() => {
    if (user && token && !authLoading) {
      fetchConversations()
    }
  }, [user, token, authLoading])

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeCounselorId && token) {
      fetchMessages(activeCounselorId)
      markConversationAsRead(activeCounselorId)
      
      // Join conversation room in WebSocket
      if (socketRef.current) {
        socketRef.current.emit('join-conversation', { conversationId: activeCounselorId })
        console.log('🚪 [ChatPage] Joined conversation:', activeCounselorId)
      }
    }
  }, [activeCounselorId, token])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      console.log('🔄 [Chat] Fetching conversations...')
      console.log('🔑 [Chat] Token exists:', !!token)
      console.log('👤 [Chat] User:', user)
      
      const response = await apiRequest('/chat/conversations', 'GET', undefined, token || undefined)
      
      console.log('✅ [Chat] Conversations response:', response)
      
      if (Array.isArray(response)) {
        setConversations(response)
        
        // Set first conversation as active
        if (response.length > 0 && !activeCounselorId) {
          setActiveCounselorId(response[0].id)
        }
      } else {
        console.warn('❌ [Chat] Response is not an array:', response)
        setConversations([])
      }
    } catch (error: any) {
      console.error('❌ [Chat] Error fetching conversations:', error)
      console.error('❌ [Chat] Error details:', error?.message, error?.response?.data)
      alert(`Error loading conversations: ${error?.message || 'Unknown error'}`)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      console.log('Fetching messages for conversation:', conversationId)
      const response = await apiRequest(
        `/chat/conversations/${conversationId}`,
        'GET',
        undefined,
        token || undefined
      )
      
      console.log('Messages response:', response)
      
      if (response && response.messages) {
        const apiMessages = response.messages
        
        const formattedMessages = apiMessages.map((msg: APIMessage) => ({
          id: msg.id,
          sender: msg.sender.id === user?.id ? 'user' : 'counselor',
          content: msg.isDeleted ? '[Pesan dihapus]' : msg.content,
          timestamp: formatMessageTime(msg.createdAt),
          isEdited: msg.isEdited,
          isDeleted: msg.isDeleted,
        }))
        
        console.log('Formatted messages:', formattedMessages)
        setMessages(formattedMessages)
      } else {
        console.warn('No messages in response')
        setMessages([])
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      console.error('Error details:', error?.message, error?.response?.data)
      alert(`Error loading messages: ${error?.message || 'Unknown error'}`)
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeCounselorId) return

    const activeConversation = conversations.find((c: APIConversation) => c.id === activeCounselorId)
    if (!activeConversation) return

    setSendingMessage(true)
    const messageContent = messageInput
    setMessageInput('')
    
    try {
      const receiverId = activeConversation.sender.id === user?.id ? 
        activeConversation.receiver.id : activeConversation.sender.id
      
      const payload = {
        conversationId: activeCounselorId,
        receiverId: receiverId,
        content: messageContent,
        messageType: 'text',
      }

      console.log('Sending message with payload:', payload)
      const response = await apiRequest('/chat/messages', 'POST', payload, token || undefined)
      
      console.log('Message sent response:', response)

      // Add user message locally
      const userMessage: Message = {
        id: response.id,
        sender: 'user',
        content: messageContent,
        timestamp: formatMessageTime(response.createdAt),
        isEdited: false,
        isDeleted: false,
      }

      setMessages((prev: Message[]) => {
        // Only add if not already present
        const exists = prev.some((msg) => msg.id === response.id)
        return exists ? prev : [...prev, userMessage]
      })
    } catch (error: any) {
      console.error('Error sending message:', error)
      console.error('Error details:', error?.message, error?.response?.data)
      alert(`Error sending message: ${error?.message || 'Unknown error'}`)
      // Restore input on error
      setMessageInput(messageContent)
    } finally {
      setSendingMessage(false)
    }
  }

  const markConversationAsRead = async (conversationId: number) => {
    try {
      await apiRequest(
        `/chat/conversations/${conversationId}/mark-read`,
        'PUT',
        undefined,
        token || undefined
      )
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const getInitialBgColor = (initial: string): string => {
    const colors: Record<string, string> = {
      S: 'bg-gradient-to-br from-blue-500 to-purple-600',
      B: 'bg-gradient-to-br from-purple-500 to-purple-600',
      R: 'bg-gradient-to-br from-green-500 to-green-600',
      A: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      C: 'bg-gradient-to-br from-rose-500 to-rose-600',
    }
    return colors[initial] || 'bg-gradient-to-br from-gray-500 to-gray-600'
  }

  const getCounselorInitial = (conversation: APIConversation): string => {
    const otherUser = conversation.sender.id === user?.id ? conversation.receiver : conversation.sender
    return otherUser.fullName?.charAt(0).toUpperCase() || 'U'
  }

  const getCounselorName = (conversation: APIConversation): string => {
    const otherUser = conversation.sender.id === user?.id ? conversation.receiver : conversation.sender
    return otherUser.fullName || otherUser.username || 'Unknown'
  }

  const handleVoiceCall = () => {
    setCallType('audio')
    setCallModalOpen(true)
    console.log('🎙️ Initiating voice call')
  }

  const handleVideoCall = () => {
    setCallType('video')
    setCallModalOpen(true)
    console.log('📹 Initiating video call')
  }

  const handleConfirmCall = async () => {
    if (!socketRef.current || !activeCounselorId) return

    try {
      console.log(`✅ Confirmed ${callType} call`)
      
      const activeConversation = conversations.find((c: APIConversation) => c.id === activeCounselorId)
      if (!activeConversation) return

      const receiverId = activeConversation.sender.id === user?.id 
        ? activeConversation.receiver.id 
        : activeConversation.sender.id

      // Emit call-initiate event via WebSocket
      socketRef.current.emit('call-initiate', {
        callerId: user?.id,
        receiverId: receiverId,
        callType: callType,
        conversationId: activeCounselorId,
      }, (response: any) => {
        if (response?.status === 'initiated') {
          console.log(`📞 ${callType} call initiated successfully, callId:`, response.callId)
          // TODO: Open call video/audio UI here
        } else {
          alert('Gagal memulai panggilan')
        }
      })

      handleCloseCall()
    } catch (error) {
      console.error('Error initiating call:', error)
      alert('Gagal memulai panggilan')
    }
  }

  const handleCloseCall = () => {
    setCallModalOpen(false)
    setCallType(null)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-72px)] bg-white">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-72px)] bg-white">
        <p className="text-gray-600">Silahkan login terlebih dahulu</p>
      </div>
    )
  }

  const activeConversation = conversations.find((c: APIConversation) => c.id === activeCounselorId)
  const activeCounselorInitial = activeConversation ? getCounselorInitial(activeConversation) : ''
  const activeCounselorName = activeConversation ? getCounselorName(activeConversation) : ''

  return (
    <div className="flex h-[calc(100vh-72px)]">
      {/* Chat List */}
      <div className="w-96 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari percakapan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conversation: APIConversation) => {
              const initial = getCounselorInitial(conversation)
              const name = getCounselorName(conversation)
              const message = conversation.lastMessage?.content || 'Mulai percakapan'
              const isActive = conversation.id === activeCounselorId

              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveCounselorId(conversation.id)}
                  className={`w-full p-4 border-b border-gray-200 cursor-pointer ${
                    isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 ${getInitialBgColor(initial)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-semibold">{initial}</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{name}</h4>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 truncate">{message}</p>
                        </div>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Tidak ada percakapan</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${getInitialBgColor(activeCounselorInitial)} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-semibold">{activeCounselorInitial}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{activeCounselorName}</h4>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleVoiceCall}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 p-2 rounded-lg"
                  title="Mulai panggilan suara"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 p-2 rounded-lg"
                  title="Mulai video call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="max-w-3xl mx-auto">
                {messages.length > 0 && (
                  <div className="text-center mb-6">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                      Hari ini
                    </span>
                  </div>
                )}

                {messages.map((message: Message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`
                        max-w-[70%] p-4 rounded-xl mb-4
                        ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-50 border border-gray-200'
                        }
                      `}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span
                        className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp}
                      </span>
                      {message.isEdited && (
                        <span className={`text-xs ml-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                          (disunting)
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Mulai percakapan dengan {activeCounselorName}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={messageInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageInput(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                >
                  {sendingMessage ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Pilih percakapan untuk memulai</p>
          </div>
        )}
      </div>

      {/* Call Confirmation Modal */}
      {callModalOpen && callType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="mb-6">
              <div className={`w-20 h-20 ${callType === 'video' ? 'bg-red-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {callType === 'video' ? (
                  <Video className="w-10 h-10 text-red-600" />
                ) : (
                  <Phone className="w-10 h-10 text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi {callType === 'video' ? 'Panggilan Video' : 'Panggilan Suara'}
              </h3>
              <p className="text-gray-600 mb-4">Anda akan memanggil {activeCounselorName}</p>
              <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                {callType === 'video' 
                  ? 'Pastikan kamera dan mikrofon Anda aktif sebelum melanjutkan' 
                  : 'Pastikan mikrofon Anda aktif sebelum melanjutkan'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmCall}
                className={`w-full px-4 py-3 text-white rounded-lg font-semibold transition ${
                  callType === 'video'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {callType === 'video' ? '📹 Mulai Video Call' : '🎙️ Mulai Panggilan Suara'}
              </button>
              <button
                onClick={handleCloseCall}
                className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage