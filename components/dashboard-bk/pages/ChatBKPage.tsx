'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Search, Phone, Video, MoreVertical, Smile, Paperclip, Loader } from 'lucide-react'
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
  readStatuses?: Array<{ isRead: boolean }>
}

interface APIConversation {
  id: number
  sender: { id: number; fullName: string; username?: string; photoUrl?: string }
  receiver: { id: number; fullName: string; username?: string; photoUrl?: string }
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

interface FormattedConversation {
  id: number
  sender: { id: number; fullName: string }
  receiver: { id: number; fullName: string }
  lastMessage?: APIMessage
  otherUserId: number
  initial: string
  name: string
  message: string
  time: string
  unread?: number
  photoUrl?: string
}

const ChatBKPage: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<FormattedConversation[]>([])
  const [activeCounselorId, setActiveCounselorId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)
  const [showCallModal, setShowCallModal] = useState(false)
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
        console.log('✅ [ChatBKPage] WebSocket connected')
      })

      socket.on('disconnect', () => {
        console.log('❌ [ChatBKPage] WebSocket disconnected')
      })

      socket.on('message-received', (data: any) => {
        console.log('📨 [ChatBKPage] Message received via WebSocket:', data)
        
        setMessages((prev: Message[]) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some((msg) => msg.id === data.message.id)
          if (messageExists) {
            console.log('⚠️ [ChatBKPage] Message already exists, skipping duplicate:', data.message.id)
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
        console.log('🚪 [ChatBKPage] Joined conversation:', activeCounselorId)
      }
    }
  }, [activeCounselorId, token])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      console.log('🔄 [ChatBK] Fetching conversations...')
      console.log('🔑 [ChatBK] Token exists:', !!token)
      console.log('👤 [ChatBK] User:', user)
      
      const response = await apiRequest('/chat/conversations', 'GET', undefined, token || undefined)
      
      console.log('✅ [ChatBK] Conversations response:', response)
      
      if (Array.isArray(response)) {
        const formattedConversations = response.map((conv: APIConversation) => {
          const otherUser = conv.sender.id === user?.id ? conv.receiver : conv.sender
          const lastMsg = conv.lastMessage
          const time = formatTime(conv.lastMessageAt)
          
          return {
            ...conv,
            otherUserId: otherUser.id,
            initial: otherUser.fullName?.charAt(0).toUpperCase() || 'U',
            name: otherUser.fullName || otherUser.username || 'Unknown',
            message: lastMsg?.content || 'Mulai percakapan',
            time,
            unread: conv.unreadCount || 0,
            photoUrl: otherUser.photoUrl,
          }
        })
        
        console.log('Formatted conversations:', formattedConversations)
        setConversations(formattedConversations)
        
        // Set first conversation as active
        if (formattedConversations.length > 0 && !activeCounselorId) {
          setActiveCounselorId(formattedConversations[0].id)
        }
      } else {
        console.warn('❌ [ChatBK] Response is not an array:', response)
        setConversations([])
      }
    } catch (error: any) {
      console.error('❌ [ChatBK] Error fetching conversations:', error)
      console.error('❌ [ChatBK] Error details:', error?.message, error?.response?.data)
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

    const activeCounselor = conversations.find((c: FormattedConversation) => c.id === activeCounselorId)
    if (!activeCounselor) return

    setSendingMessage(true)
    const messageContent = messageInput
    setMessageInput('')
    
    try {
      const receiverId = activeCounselor.sender.id === user?.id ? 
        activeCounselor.receiver.id : activeCounselor.sender.id
      
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

  const getInitialBgColor = (initial: string): string => {
    const colors: Record<string, string> = {
      S: 'bg-gradient-to-br from-blue-500 to-blue-600',
      B: 'bg-gradient-to-br from-purple-500 to-purple-600',
      R: 'bg-gradient-to-br from-green-500 to-green-600',
      A: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      C: 'bg-gradient-to-br from-rose-500 to-rose-600',
      D: 'bg-gradient-to-br from-amber-500 to-amber-600',
      E: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      F: 'bg-gradient-to-br from-lime-500 to-lime-600',
    }
    return colors[initial] || 'bg-gradient-to-br from-gray-500 to-gray-600'
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'Baru saja'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInDays === 1) return 'Kemarin'
    if (diffInDays < 7) return `${diffInDays}d`
    
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
  }

  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const filteredConversations = conversations.filter((conv: FormattedConversation) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCounselor = conversations.find((c: FormattedConversation) => c.id === activeCounselorId) as FormattedConversation | undefined

  const handleVoiceCall = () => {
    if (!activeCounselor) return
    setCallType('audio')
    setShowCallModal(true)
    console.log('🎙️ Initiating voice call with', activeCounselor.name)
  }

  const handleVideoCall = () => {
    if (!activeCounselor) return
    setCallType('video')
    setShowCallModal(true)
    console.log('📹 Initiating video call with', activeCounselor.name)
  }

  const handleConfirmCall = async () => {
    if (!activeCounselor || !socketRef.current || !activeCounselorId) return

    try {
      console.log(`✅ Confirmed ${callType} call with ${activeCounselor.name}`)
      
      // Get active conversation to get receiver ID
      const activeConversation = conversations.find(c => c.id === activeCounselorId)
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
    setShowCallModal(false)
    setCallType(null)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <p className="text-gray-600">Silahkan login terlebih dahulu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header with Search */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pesan</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Counselor List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((counselor: FormattedConversation) => (
              <button
                key={counselor.id}
                onClick={() => setActiveCounselorId(counselor.id)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                  activeCounselorId === counselor.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {counselor.photoUrl ? (
                      <img
                        src={counselor.photoUrl}
                        alt={counselor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 ${getInitialBgColor(counselor.initial)} rounded-full flex items-center justify-center text-white font-semibold`}>
                        {counselor.initial}
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{counselor.name}</h4>
                      <span className="text-xs text-gray-500">{counselor.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{counselor.message}</p>
                  </div>

                  {/* Unread Badge */}
                  {counselor.unread && counselor.unread > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold flex-shrink-0">
                      {counselor.unread > 99 ? '99+' : counselor.unread}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                {searchQuery ? 'Tidak ada percakapan yang cocok' : 'Mulai percakapan baru'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        {activeCounselor ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {activeCounselor.photoUrl ? (
                  <img
                    src={activeCounselor.photoUrl}
                    alt={activeCounselor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-10 h-10 ${getInitialBgColor(activeCounselor.initial)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {activeCounselor.initial}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{activeCounselor.name}</h3>
                  <p className="text-xs text-gray-500">
                    Online
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={handleVoiceCall}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-blue-600"
                  title="Mulai panggilan suara"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleVideoCall}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-blue-600"
                  title="Mulai video call"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="max-w-3xl mx-auto">
                {messages.length > 0 && (
                  <div className="text-center mb-6">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                      Hari ini
                    </span>
                  </div>
                )}

                {/* Messages */}
                {messages.length > 0 ? (
                  messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-xl ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className={`text-sm leading-relaxed ${message.isDeleted ? 'italic text-gray-400' : ''}`}>
                          {message.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <p
                            className={`text-xs ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp}
                          </p>
                          {message.isEdited && (
                            <p className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                              (disunting)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Mulai percakapan dengan {activeCounselor.name}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3 items-end">
                <button className="text-gray-400 hover:text-gray-600 transition p-2">
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 flex gap-2 items-end bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageInput(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ketik pesan..."
                    disabled={sendingMessage}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 disabled:text-gray-400"
                  />
                  <button className="text-gray-400 hover:text-gray-600 transition p-1">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2"
                >
                  {sendingMessage ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
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

      {/* Simple Call Alert Modal */}
      {showCallModal && activeCounselor && callType && (
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
              <p className="text-gray-600 mb-4">Anda akan memanggil {activeCounselor.name}</p>
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

export default ChatBKPage
