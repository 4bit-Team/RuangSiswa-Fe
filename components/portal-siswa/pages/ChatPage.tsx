'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Search, Phone, Video, MoreVertical, Smile, Paperclip, Loader, Mic, Square, Play, X } from 'lucide-react'
import { ChatListItemProps, ChatBubbleProps } from '@types'
import CallModal from '../modals/CallModal'
import CallUI from '../../call/CallUI'
import { apiRequest, API_URL } from '@lib/api'
import { formatMessageTime, getMessageDateLabel, shouldShowDateSeparator } from '@lib/messageFormatting'
import { handleEmojiClick, startRecording, stopRecording, sendVoiceMessage, cancelRecording, getInitialBgColor, formatRecordingTime, formatCallDuration, formatTime, emojis, fetchEmojisFromAPI } from '@lib/chatUtils'
import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/lib/context/SocketContext'
import { io, Socket } from 'socket.io-client'
import {
  createPeerConnection,
  createOffer,
  createAnswer,
  handleRemoteOffer,
  handleRemoteAnswer,
  addIceCandidate,
  getLocalAudioStream,
  getLocalVideoStream,
  stopMediaStream,
  addLocalStreamToPeerConnection,
  onIceCandidate,
  onRemoteStream,
  onConnectionStateChange,
  onIceConnectionStateChange,
  onNegotiationNeeded,
  IceCandidateThrottler,
} from '@lib/webrtc'
import { startRTPMonitoring, stopRTPMonitoring } from '@lib/rtpDiagnostics'

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
  fileUrl?: string
  fileName?: string
  fileSize?: number
  duration?: number
}

interface APIConversation {
  id: number
  sender: { id: number; fullName: string; username?: string; photoUrl?: string }
  receiver: { id: number; fullName: string; username?: string; photoUrl?: string }
  lastMessage?: APIMessage
  messages?: APIMessage[]
  unreadCount?: number
  lastMessageAt: string
  status?: 'active' | 'in_counseling' | 'completed'
  subject?: string
  topic?: string
}

interface Message {
  id: number
  sender: 'user' | 'counselor'
  content: string
  timestamp: string // Formatted time only (e.g., "16:24")
  originalDate: string // ISO date string for date detection
  isEdited: boolean
  isDeleted: boolean
  messageType?: 'text' | 'voice'
  voiceUrl?: string
  duration?: number
}

interface Reservasi {
  id: number
  studentId: number
  counselorId: number
  preferredDate: string
  preferredTime: string
  type: 'chat' | 'tatap-muka'
  topic?: { id: number; name: string; description?: string } | null
  topicId?: number | null
  notes?: string
  status: 'pending' | 'approved' | 'rejected' | 'in_counseling' | 'completed' | 'cancelled'
  conversationId?: number
  completedAt?: Date
  createdAt: string
}

const ChatPage: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<APIConversation[]>([])
  const [activeCounselorId, setActiveCounselorId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [dynamicEmojis, setDynamicEmojis] = useState<string[]>(emojis) // Dynamic emojis from API
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<any>(null)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [incomingCallModalOpen, setIncomingCallModalOpen] = useState(false)
  const [activeCall, setActiveCall] = useState<any>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [hasRemoteStream, setHasRemoteStream] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const callSocketRef = useRef<Socket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const callIdRef = useRef<string | null>(null) // ✅ Track callId immediately when call starts (not from state which updates async)
  const rtpMonitoringRef = useRef<boolean>(false) // ✅ Track if RTP monitoring is active
  const iceThrottlerRef = useRef<IceCandidateThrottler>(new IceCandidateThrottler()) // ✅ Throttle ICE candidates to prevent spam
  
  // Pinned topics state
  const [pinnedTopics, setPinnedTopics] = useState<Array<{ id: string; topic: string; subject: string; timestamp: number }>>([])
  const [showPinnedModal, setShowPinnedModal] = useState(false)
  const [reservasiHistory, setReservasiHistory] = useState<Reservasi[]>([])
  const topicSeparatorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch reservasi history from backend
  useEffect(() => {
    if (!activeCounselorId) return

    const fetchReservasiHistory = async () => {
      try {
        const response = await apiRequest('/reservasi/student/my-reservations')
        
        console.log('Response received:', response, 'Type:', typeof response)
        
        let data = response
        // Check if response has .ok property (it's a Response object)
        if (response && typeof response === 'object' && 'ok' in response) {
          if (!response.ok) {
            console.warn('Failed to fetch reservasi:', response.status)
            return
          }
          data = await response.json()
        }
        // Otherwise assume response is already the data
        
        console.log('All reservasi data fetched:', data)
        setReservasiHistory(data)
        
        // Generate pinned topics from reservasi history - only chat type with topics
        const pinned = (Array.isArray(data) ? data : [])
          .filter((r: Reservasi) => r && r.type === 'chat' && r.topic && typeof r.topic === 'object')
          .map((r: Reservasi) => ({
            id: `${r.id}`,
            topic: `📚 Sesi chat: ${r.topic?.name || 'Konseling'}${r.notes ? ` | ${r.notes}` : ''}`,
            subject: '',
            timestamp: new Date(r.createdAt).getTime()
          }))
        
        console.log('Pinned topics:', pinned)
        setPinnedTopics(pinned)
      } catch (error) {
        console.error('Failed to fetch reservasi history:', error)
      }
    }

    fetchReservasiHistory()
  }, [activeCounselorId])

  // Fetch emojis from API on mount
  useEffect(() => {
    const loadEmojis = async () => {
      const fetchedEmojis = await fetchEmojisFromAPI()
      setDynamicEmojis(fetchedEmojis)
    }
    loadEmojis()
  }, [])

  // Subscribe to context sockets and register event handlers
  const { chatSocket, callSocket } = useSocket()

  useEffect(() => {
    if (!callSocket) return

    console.log('✅ [ChatPage] Call Socket from context ready, registering handlers')
    callSocketRef.current = callSocket as any

    const handleConnectCall = () => {
      console.log('✅ [ChatPage Call Socket] Connected to /call namespace')
      setIsReconnecting(false)
    }

    const handleDisconnectCall = (reason: string) => {
      console.log('❌ [ChatPage Call Socket] Disconnected - Reason:', reason)
    }

    const handleConnectErrorCall = (error: any) => {
      console.error('❌ [ChatPage Call] Connection error:', error)
    }

    const handleIncomingCall = (data: any) => {
      console.log('📞 [ChatPage] Incoming call received:', data)
      setIncomingCall(data)
      setIncomingCallModalOpen(true)
    }

    const handleCallOffer = (data: any) => {
      console.log('📞 [ChatPage] Call offer received:', { callId: data.callId, hasOffer: !!data.offer })
      setIncomingCall((prev: any) => ({ ...(prev || {}), ...data, offer: data.offer }))
    }

    const handleCallAnswer = async (data: any) => {
      console.log('📞 [ChatPage] Call answer received:', data)
      try {
        if (!peerConnectionRef.current) {
          console.warn('⚠️ [ChatPage] Peer connection not ready for answer, ignoring')
          return
        }

        if (peerConnectionRef.current.remoteDescription) {
          console.warn('⚠️ [ChatPage] Remote description already set, ignoring duplicate answer')
          return
        }

        const state = peerConnectionRef.current.signalingState
        console.log(`📡 [ChatPage] Current signaling state: ${state}`)
        
        if (state !== 'have-local-offer') {
          console.warn(`⚠️ [ChatPage] Cannot set remote answer in state ${state}, expected have-local-offer`)
          return
        }

        if (data.answer) {
          await handleRemoteAnswer(peerConnectionRef.current, data.answer)
          
          if (Array.isArray(data.iceCandidates)) {
            for (const c of data.iceCandidates) {
              try {
                await addIceCandidate(peerConnectionRef.current, c)
              } catch (e) {
                console.warn('Failed to add remote ICE candidate', e)
              }
            }
          }

          setActiveCall((prev: any) => ({ ...(prev || {}), callId: data.callId }))
        }
      } catch (error) {
        console.error('Error handling remote answer:', error)
      }
    }

    const handleIceCandidate = async (data: any) => {
      console.log('📞 [ChatPage] ICE candidate received:', data)
      try {
        if (peerConnectionRef.current && data.candidate) {
          await addIceCandidate(peerConnectionRef.current, data)
        }
      } catch (error) {
        console.error('Error adding remote ICE candidate:', error)
      }
    }

    const handleCallRejected = (data: any) => {
      console.log('📞 [ChatPage] Call rejected:', data)
      setIncomingCall(null)
      setIncomingCallModalOpen(false)
      setActiveCall(null)
    }

    const handleCallEnded = (data: any) => {
      console.log('📞 [ChatPage] Call ended:', data)
      if (localStreamRef.current) stopMediaStream(localStreamRef.current)
      if (peerConnectionRef.current) peerConnectionRef.current.close()
      setActiveCall(null)
      setCallDuration(0)
    }

    callSocket.on('connect', handleConnectCall)
    callSocket.on('disconnect', handleDisconnectCall)
    callSocket.on('connect_error', handleConnectErrorCall)
    callSocket.on('call-incoming', handleIncomingCall)
    callSocket.on('call-offer', handleCallOffer)
    callSocket.on('call-answer', handleCallAnswer)
    callSocket.on('ice-candidate', handleIceCandidate)
    callSocket.on('call-rejected', handleCallRejected)
    callSocket.on('call-ended', handleCallEnded)

    return () => {
      callSocket.off('connect', handleConnectCall)
      callSocket.off('disconnect', handleDisconnectCall)
      callSocket.off('connect_error', handleConnectErrorCall)
      callSocket.off('call-incoming', handleIncomingCall)
      callSocket.off('call-offer', handleCallOffer)
      callSocket.off('call-answer', handleCallAnswer)
      callSocket.off('ice-candidate', handleIceCandidate)
      callSocket.off('call-rejected', handleCallRejected)
      callSocket.off('call-ended', handleCallEnded)
    }
  }, [callSocket])

  useEffect(() => {
    if (!chatSocket) return

    console.log('✅ [ChatPage] Chat Socket from context ready, registering handlers')
    socketRef.current = chatSocket as any

    const handleMessageReceived = (data: any) => {
      console.log('📨 [ChatPage] Message received via WebSocket:', data)
      
      setMessages((prev: Message[]) => {
        const messageExists = prev.some((msg) => msg.id === data.message.id)
        if (messageExists) {
          console.log('⚠️ [ChatPage] Message already exists, skipping duplicate:', data.message.id)
          return prev
        }
        
        let validCreatedAt = data.message.createdAt
        if (!validCreatedAt || typeof validCreatedAt !== 'string' || (!validCreatedAt.includes('T') && !validCreatedAt.includes(' '))) {
          console.warn('⚠️ Invalid createdAt from WebSocket:', validCreatedAt, 'for message:', data.message.id)
          validCreatedAt = new Date().toISOString()
        }
        
        const newMessage: Message = {
          id: data.message.id,
          sender: data.message.sender.id === user?.id ? 'user' : 'counselor',
          content: data.message.isDeleted ? '[Pesan dihapus]' : data.message.content,
          timestamp: formatMessageTime(validCreatedAt),
          originalDate: validCreatedAt,
          isEdited: data.message.isEdited,
          isDeleted: data.message.isDeleted,
          messageType: (data.message.messageType as 'text' | 'voice') || 'text',
          voiceUrl: data.message.fileUrl,
          duration: data.message.duration,
        }
        
        return [...prev, newMessage]
      })
      
      fetchConversations()
    }

    chatSocket.on('message-received', handleMessageReceived)

    return () => {
      chatSocket.off('message-received', handleMessageReceived)
    }
  }, [chatSocket, user])

  // Restore call state from sessionStorage on mount
  useEffect(() => {
    const savedCallState = sessionStorage.getItem('activeCallState')
    if (savedCallState) {
      try {
        const callState = JSON.parse(savedCallState)
        setActiveCall(callState)
        setIsReconnecting(true) // Mark as reconnecting since socket might not be ready yet
        console.log('✅ [Chat] Restored call state from sessionStorage:', callState)
      } catch (error) {
        console.error('❌ [Chat] Error restoring call state:', error)
        sessionStorage.removeItem('activeCallState')
      }
    }
  }, [])

  // Save activeCall state to sessionStorage
  useEffect(() => {
    if (activeCall) {
      sessionStorage.setItem('activeCallState', JSON.stringify(activeCall))
      console.log('💾 [Chat] Saved call state to sessionStorage')
    } else {
      sessionStorage.removeItem('activeCallState')
    }
  }, [activeCall])

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
        const calculateUnreadMessages = (messages: APIMessage[]): number => {
          return messages.filter((message) => {
            const readStatus = message.readStatuses?.find((status) => status.isRead);
            return !readStatus;
          }).length;
        };

        // Update unread count display logic
        const formattedConversations = response.map((conversation: APIConversation) => {
          const unreadCount = calculateUnreadMessages(conversation.messages || []);
          const otherUser = conversation.sender.id === user?.id ? conversation.receiver : conversation.sender;
          const lastMessageContent = conversation.lastMessage?.isDeleted 
            ? '[Pesan dihapus]' 
            : conversation.lastMessage?.content || '';
          
          return {
            id: conversation.id,
            sender: conversation.sender,
            receiver: conversation.receiver,
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            otherUserId: otherUser.id,
            initial: otherUser.fullName?.charAt(0).toUpperCase() || 'U',
            name: otherUser.fullName || otherUser.username || 'Unknown',
            message: lastMessageContent,
            time: conversation.lastMessage ? formatMessageTime(conversation.lastMessage.createdAt) : formatMessageTime(conversation.lastMessageAt),
            unread: unreadCount > 0 ? unreadCount : undefined,
            photoUrl: otherUser.photoUrl,
            status: conversation.status,
          };
        });

        setConversations(formattedConversations)
        
        // Don't auto-select first conversation anymore
        // User must manually click to open a conversation
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
        
        const formattedMessages = apiMessages.map((msg: APIMessage) => {
          // Validate createdAt is a proper date string, not accidentally the duration value
          let validCreatedAt = msg.createdAt
          // Accept both ISO format (with T) and backend format (with space)
          if (!validCreatedAt || typeof validCreatedAt !== 'string' || (!validCreatedAt.includes('T') && !validCreatedAt.includes(' '))) {
            console.warn('⚠️ Invalid createdAt value:', validCreatedAt, 'for message:', msg.id)
            validCreatedAt = new Date().toISOString() // Fallback to current time
          }
          
          return {
            id: msg.id,
            sender: msg.sender.id === user?.id ? 'user' : 'counselor',
            content: msg.isDeleted ? '[Pesan dihapus]' : msg.content,
            timestamp: formatMessageTime(validCreatedAt),
            originalDate: validCreatedAt,
            isEdited: msg.isEdited,
            isDeleted: msg.isDeleted,
            messageType: (msg.messageType as 'text' | 'voice') || 'text',
            voiceUrl: msg.fileUrl,
            duration: msg.duration,
          }
        })
        
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

    // Check if session is completed
    if (activeConversation.status === 'completed') {
      alert('Sesi telah selesai. Anda tidak dapat mengirim pesan.')
      return
    }

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
      // Validate createdAt is a proper date string
      let validCreatedAt = response.createdAt
      // Accept both ISO format (with T) and backend format (with space)
      if (!validCreatedAt || typeof validCreatedAt !== 'string' || (!validCreatedAt.includes('T') && !validCreatedAt.includes(' '))) {
        console.warn('⚠️ Invalid createdAt from send response:', validCreatedAt)
        validCreatedAt = new Date().toISOString() // Fallback to current time
      }
      
      const userMessage: Message = {
        id: response.id,
        sender: 'user',
        content: messageContent,
        timestamp: formatMessageTime(validCreatedAt),
        originalDate: validCreatedAt,
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

  const handleEmojiInsert = (emoji: string) => {
    handleEmojiClick(emoji, messageInput, setMessageInput, setShowEmojiPicker)
  }

  const handleStartRecording = async () => {
    await startRecording(
      mediaRecorderRef,
      recordingIntervalRef,
      setIsRecording,
      setRecordingTime,
      setRecordedChunks
    )
  }

  const handleStopRecording = () => {
    stopRecording(mediaRecorderRef, recordingIntervalRef, setIsRecording)
  }

  const handleSendVoiceMessage = async () => {
    await sendVoiceMessage(
      recordedChunks,
      recordingTime,
      activeCounselorId,
      token || '',
      setSendingMessage,
      setRecordedChunks,
      setRecordingTime
    )
  }

  const handleCancelRecording = () => {
    cancelRecording(mediaRecorderRef, recordingIntervalRef, setIsRecording, setRecordedChunks, setRecordingTime)
  }

  const getAvatarBgColor = (initial: string): string => {
    return getInitialBgColor(initial)
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
    if (!callSocketRef.current || !activeCounselorId) return

    try {
      console.log(`✅ Confirmed ${callType} call`)
      
      const activeConversation = conversations.find((c: APIConversation) => c.id === activeCounselorId)
      if (!activeConversation) return

      const receiverId = activeConversation.sender.id === user?.id 
        ? activeConversation.receiver.id 
        : activeConversation.sender.id

      // Initialize peer connection
      peerConnectionRef.current = createPeerConnection()

      // ✅ CRITICAL: Use call socket namespace for ICE candidates, not chat socket
      // Handle ICE candidates with detailed logging
      onIceCandidate(peerConnectionRef.current, (candidate) => {
        if (!candidate) {
          console.log('✅ [ChatPage ICE] ICE gathering complete for caller')
          return
        }
        
        // Enqueue candidate for throttled sending
        iceThrottlerRef.current.enqueue(candidate)
        
        // Try to send pending candidates (batch of max 5)
        const batch = iceThrottlerRef.current.getNextBatch()
        
        for (const candidateToSend of batch) {
          const candidateObj = {
            callId: callIdRef.current, // ✅ USE CALLID REF (will be set when call-initiate emitted)
            candidate: candidateToSend.candidate, // Send just the candidate string
            sdpMLineIndex: candidateToSend.sdpMLineIndex,
            sdpMid: candidateToSend.sdpMid,
          }
          
          // Validate candidate object
          if (!candidateObj.candidate || candidateObj.callId === null) {
            console.warn('⚠️ [ChatPage ICE] ICE candidate incomplete - missing candidate or callId', candidateObj)
            continue
          }
          
          console.log('📤 [ChatPage ICE] Sending ICE candidate via /call socket (throttled):', {
            callId: candidateObj.callId,
            candidateType: candidateObj.candidate.includes('typ host') ? 'HOST' : 
                          candidateObj.candidate.includes('typ srflx') ? 'SRFLX' : 'RELAY',
            sdpMLineIndex: candidateObj.sdpMLineIndex,
            sdpMid: candidateObj.sdpMid,
            socketConnected: callSocketRef.current?.connected,
          })
          
          // ✅ CRITICAL: Use callSocketRef (call namespace) not socketRef (chat namespace)
          if (!callSocketRef.current?.connected) {
            console.error('❌ [ChatPage ICE] Call socket not connected! Cannot send candidate')
            continue
          }
          
          // Send via call socket with confirmation
          callSocketRef.current?.emit('ice-candidate', candidateObj, (response: any) => {
            if (response?.status === 'ice-candidate-sent') {
              console.log(`✅ [ChatPage ICE] Backend confirmed ICE candidate sent`)
            } else if (response?.status === 'error') {
              console.error(`❌ [ChatPage ICE] Backend rejected candidate: ${response?.message}`)
            } else {
              console.log(`ℹ️ [ChatPage ICE] Backend response:`, response)
            }
          })
        }
      })

      // Handle remote stream
      onRemoteStream(peerConnectionRef.current, (stream) => {
        console.log('✅ Remote stream received in ChatPage (initiator), updating state:', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          streamId: stream.id,
        })
        remoteStreamRef.current = stream
        setRemoteStream(stream)  // ✅ Set state - CallUI effect will handle attachment
        setHasRemoteStream(true)
      })

      // Handle connection state with improved detection
      onConnectionStateChange(peerConnectionRef.current, (state) => {
        console.log('Peer connection state:', state)
        if (state === 'connected') {
          console.log('✅ Peer connection established')
          setIsConnected(true)
          
          // ✅ NEW: Start RTP monitoring to diagnose media flow
          if (!rtpMonitoringRef.current) {
            console.log('🚀 Starting RTP monitoring...')
            startRTPMonitoring(peerConnectionRef.current!, 2000)
            rtpMonitoringRef.current = true
          }
        } else if (state === 'failed' || state === 'closed') {
          console.error('❌ Peer connection failed/closed:', state)
          setIsConnected(false)
          setHasRemoteStream(false)
          // ✅ Stop RTP monitoring on disconnect
          if (rtpMonitoringRef.current) {
            stopRTPMonitoring()
            rtpMonitoringRef.current = false
          }
          handleHangup()
        } else if (state === 'disconnected') {
          console.warn('⚠️ Peer connection disconnected, but not calling hangup (ICE may reconnect)')
          setIsConnected(false)
        }
      })

      // Also listen to ICE connection state as fallback
      onIceConnectionStateChange(peerConnectionRef.current, (state) => {
        console.log('ICE connection state:', state)
        if (state === 'connected' || state === 'completed') {
          console.log('✅ ICE connection established')
          setIsConnected(true)
        } else if (state === 'failed') {
          console.error('❌ ICE connection failed')
          setIsConnected(false)
          setHasRemoteStream(false)
          handleHangup()
        } else if (state === 'disconnected') {
          console.warn('⚠️ ICE disconnected (may be temporary)')
          setIsConnected(false)
        }
      })

      // Get local media stream
      try {
        const stream = callType === 'audio' 
          ? await getLocalAudioStream()
          : await getLocalVideoStream()
        
        console.log('📹 [ChatPage] Got local stream:', {
          videoTracks: (stream as MediaStream).getVideoTracks().length,
          audioTracks: (stream as MediaStream).getAudioTracks().length,
          streamId: (stream as MediaStream).id,
        })
        
        // ✅ NEW: Validate stream IMMEDIATELY after getting it
        const videoTracks = (stream as MediaStream).getVideoTracks()
        const audioTracks = (stream as MediaStream).getAudioTracks()
        
        if (callType === 'video' && videoTracks.length === 0) {
          console.error('❌ [ChatPage] CRITICAL: Got stream but NO VIDEO TRACKS!')
          alert('Gagal mendapatkan akses kamera. Pastikan kamera tersambung dan izin diberikan.')
          throw new Error('Video stream has no video tracks')
        }
        
        if (audioTracks.length === 0) {
          console.error('❌ [ChatPage] CRITICAL: Got stream but NO AUDIO TRACKS!')
          alert('Gagal mendapatkan akses mikrofon. Pastikan mikrofon tersambung dan izin diberikan.')
          throw new Error('Stream has no audio tracks')
        }
        
        console.log('✅ [ChatPage] Stream validation PASSED:', {
          hasVideo: videoTracks.length > 0,
          hasAudio: audioTracks.length > 0,
        })
        
        // ✅ CRITICAL: Store the EXACT same stream reference
        // Don't create copies - WebRTC needs the original MediaStream object
        localStreamRef.current = stream
        setLocalStream(stream)
        console.log('📹 [ChatPage] Stream references set:', {
          localStreamRefId: localStreamRef.current?.id,
          localStreamStateId: localStream?.id,
          areSame: localStreamRef.current === stream,
        })
        
        // ✅ CRITICAL: Add local stream to peer connection BEFORE negotiation
        // Use localStreamRef.current to ensure we keep the reference
        console.log('✅ [ChatPage] Adding local stream to peer connection NOW (before activeCall set)')
        addLocalStreamToPeerConnection(peerConnectionRef.current, localStreamRef.current as MediaStream)
        
        // ✅ CRITICAL: Verify stream is still alive after PC operations
        console.log('📹 [ChatPage] Stream health check AFTER adding to PC:', {
          streamId: localStreamRef.current?.id,
          streamActive: localStreamRef.current?.active,
          videoTracks: localStreamRef.current?.getVideoTracks().length,
          audioTracks: localStreamRef.current?.getAudioTracks().length,
          videoTrackStates: localStreamRef.current?.getVideoTracks().map(t => ({id: t.id, state: t.readyState, enabled: t.enabled})),
          audioTrackStates: localStreamRef.current?.getAudioTracks().map(t => ({id: t.id, state: t.readyState, enabled: t.enabled}))
        })
        console.log('✅ [ChatPage] Local stream added to peer connection BEFORE offer creation')

        // ✅ NEW: Handle negotiation needed events for proper SDP renegotiation
        let initialOfferSent = false
        if (peerConnectionRef.current) {
          onNegotiationNeeded(peerConnectionRef.current, async () => {
            if (!initialOfferSent) {
              console.log('📋 [ChatPage] Initial negotiation needed')
              return
            }
            // For subsequent negotiations (if track changes)
            if (peerConnectionRef.current) {
              const offer = await createOffer(peerConnectionRef.current)
              callSocketRef.current?.emit('call-renegotiate', {
                callId: activeCall?.callId,
                offer: offer,
              })
            }
          })
        }

        // Create offer
        const offerSDP = await createOffer(peerConnectionRef.current)
        console.log('Offer SDP created:', offerSDP)
        initialOfferSent = true

        // Emit call-initiate event via WebSocket WITH OFFER
        if (callSocketRef.current) {
          callSocketRef.current.emit('call-initiate', {
            callerId: user?.id,
            receiverId: receiverId,
            callType: callType,
            conversationId: activeCounselorId,
            offer: offerSDP, // ✅ Include offer immediately
          }, async (response: any) => {
            if (response?.status === 'initiated') {
              const callId = response.callId
              console.log(`📞 ${callType} call initiated successfully, callId:`, callId)
              
              // ✅ CRITICAL: Set callIdRef IMMEDIATELY so ICE candidates use it
              callIdRef.current = callId
              
              setActiveCall({
                callId,
                receiverId,
                callType,
                conversationId: activeCounselorId,
                isInitiator: true,
                remoteUserName: activeConversation.receiver.fullName,
              })
            } else {
              alert('Gagal memulai panggilan')
            }
          })
        }

        handleCloseCall()
      } catch (error: any) {
        console.error('Error getting media:', error)
        const errorMessage = error?.message || 'Gagal mengakses kamera/mikrofon'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error initiating call:', error)
      alert('Gagal memulai panggilan')
    }
  }

  const handleCloseCall = () => {
    setCallModalOpen(false)
    setCallType(null)
  }

  const handleHangup = async () => {
    if (!activeCall) return

    try {
      // Emit call-end event
      callSocketRef.current?.emit('call-end', {
        callId: activeCall.callId,
        duration: callDuration,
      })
    } catch (error) {
      console.error('Error ending call:', error)
    } finally {
      // Cleanup
      if (localStreamRef.current) {
        stopMediaStream(localStreamRef.current)
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      setActiveCall(null)
      setCallDuration(0)
      setIsConnected(false)
    }
  }

  const handleAcceptIncomingCall = async () => {
    if (!callSocketRef.current || !incomingCall) return

    try {
      console.log('📞 Accepting incoming call:', incomingCall.callId)
      
      // Initialize peer connection
      peerConnectionRef.current = createPeerConnection()

      // ✅ CRITICAL: Use call socket namespace for ICE candidates, not chat socket
      // Handle ICE candidates with detailed logging
      onIceCandidate(peerConnectionRef.current, (candidate) => {
        if (!candidate) {
          console.log('✅ [ChatPage ICE Receiver] ICE gathering complete for receiver')
          return
        }
        
        // Enqueue candidate for throttled sending
        iceThrottlerRef.current.enqueue(candidate)
        
        // Try to send pending candidates (batch of max 5)
        const batch = iceThrottlerRef.current.getNextBatch()
        
        for (const candidateToSend of batch) {
          const candidateObj = {
            callId: incomingCall.callId,
            candidate: candidateToSend.candidate, // Send just the candidate string
            sdpMLineIndex: candidateToSend.sdpMLineIndex,
            sdpMid: candidateToSend.sdpMid,
          }
          
          // Validate candidate object
          if (!candidateObj.candidate || !candidateObj.callId) {
            console.warn('⚠️ [ChatPage ICE Receiver] ICE candidate incomplete - missing candidate or callId', candidateObj)
            continue
          }
          
          console.log('📤 [ChatPage ICE Receiver] Sending ICE candidate via /call socket (throttled):', {
            callId: candidateObj.callId,
            candidateType: candidateObj.candidate.includes('typ host') ? 'HOST' : 
                          candidateObj.candidate.includes('typ srflx') ? 'SRFLX' : 'RELAY',
            sdpMLineIndex: candidateObj.sdpMLineIndex,
            sdpMid: candidateObj.sdpMid,
            socketConnected: callSocketRef.current?.connected,
          })
          
          // ✅ CRITICAL: Use callSocketRef (call namespace) not socketRef (chat namespace)
          if (!callSocketRef.current?.connected) {
            console.error('❌ [ChatPage ICE Receiver] Call socket not connected! Cannot send candidate')
            continue
          }
          
          // Send via call socket with confirmation
          callSocketRef.current?.emit('ice-candidate', candidateObj, (response: any) => {
            if (response?.status === 'ice-candidate-sent') {
              console.log(`✅ [ChatPage ICE Receiver] Backend confirmed ICE candidate sent`)
            } else if (response?.status === 'error') {
              console.error(`❌ [ChatPage ICE Receiver] Backend rejected candidate: ${response?.message}`)
            } else {
              console.log(`ℹ️ [ChatPage ICE Receiver] Backend response:`, response)
            }
          })
        }
      })

      // Handle remote stream
      onRemoteStream(peerConnectionRef.current, (stream) => {
        console.log('✅ Remote stream received in ChatPage (receiver), updating state:', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          streamId: stream.id,
        })
        remoteStreamRef.current = stream
        setRemoteStream(stream)  // ✅ Set state - CallUI effect will handle attachment
        setHasRemoteStream(true)
      })

      // Handle connection state
      onConnectionStateChange(peerConnectionRef.current, (state) => {
        console.log('Peer connection state (receiver):', state)
        if (state === 'connected') {
          console.log('✅ Peer connection established')
          setIsConnected(true)
          
          // ✅ NEW: Start RTP monitoring to diagnose media flow
          if (!rtpMonitoringRef.current) {
            console.log('🚀 Starting RTP monitoring...')
            startRTPMonitoring(peerConnectionRef.current!, 2000)
            rtpMonitoringRef.current = true
          }
        } else if (state === 'failed' || state === 'closed') {
          console.error('❌ Peer connection failed/closed:', state)
          setIsConnected(false)
          setHasRemoteStream(false)
          // ✅ Stop RTP monitoring on disconnect
          if (rtpMonitoringRef.current) {
            stopRTPMonitoring()
            rtpMonitoringRef.current = false
          }
          handleHangup()
        } else if (state === 'disconnected') {
          console.warn('⚠️ Peer connection disconnected, but not calling hangup (ICE may reconnect)')
          setIsConnected(false)
        }
      })

      // Also listen to ICE connection state as fallback
      onIceConnectionStateChange(peerConnectionRef.current, (state) => {
        console.log('ICE connection state (receiver):', state)
        if (state === 'connected' || state === 'completed') {
          console.log('✅ ICE connection established')
          setIsConnected(true)
        } else if (state === 'failed') {
          console.error('❌ ICE connection failed')
          setIsConnected(false)
          setHasRemoteStream(false)
          handleHangup()
        } else if (state === 'disconnected') {
          console.warn('⚠️ ICE disconnected (may be temporary)')
          setIsConnected(false)
        }
      })

      // Get local media stream
      try {
        // ✅ CRITICAL FIX: Handle remote offer FIRST before adding local tracks
        // This is the correct WebRTC negotiation order
        if (!incomingCall?.offer) {
          console.error('❌ Tidak ada SDP offer pada incomingCall:', incomingCall)
          alert('Panggilan tidak valid: offer SDP tidak ditemukan.')
          return
        }

        console.log('📋 [ChatPage] Setting remote offer FIRST (before local tracks)')
        await handleRemoteOffer(peerConnectionRef.current, incomingCall.offer)
        console.log('✅ [ChatPage] Remote offer set')

        // NOW get local stream
        const stream = incomingCall.callType === 'audio'
          ? await getLocalAudioStream()
          : await getLocalVideoStream()
        
        console.log('📹 [ChatPage] Got local stream (accept):', {
          videoTracks: (stream as MediaStream).getVideoTracks().length,
          audioTracks: (stream as MediaStream).getAudioTracks().length,
        })
        
        localStreamRef.current = stream
        setLocalStream(stream)  // ✅ Set state so CallUI gets the stream
        console.log('📹 [ChatPage] Local stream stored in state & ref')
        
        // ✅ Add local stream to peer connection AFTER remote offer is set
        addLocalStreamToPeerConnection(peerConnectionRef.current, stream)
        console.log('✅ [ChatPage] Local stream added to peer connection')

        // ✅ NEW: Handle negotiation needed events
        onNegotiationNeeded(peerConnectionRef.current, async () => {
          console.log('📋 [ChatPage] Negotiation needed on receiver side')
          // Receiver side renegotiation - usually not needed for initial setup
        })

        // Create answer from received offer
        const answerSDP = await createAnswer(peerConnectionRef.current, incomingCall.offer)
        console.log('Answer SDP created:', answerSDP)

        // ✅ CRITICAL: Set callIdRef IMMEDIATELY for ICE candidates
        callIdRef.current = incomingCall.callId

        // Send answer via WebSocket
        if (callSocketRef.current) {
          callSocketRef.current.emit('call-accept', {
            callId: incomingCall.callId,
            answer: answerSDP,
          }, (response: any) => {
            if (response?.status === 'accepted') {
              console.log('✅ Call accepted successfully')
              setActiveCall({
                callId: incomingCall.callId,
                callerId: incomingCall.callerId,
                callType: incomingCall.callType,
                isInitiator: false,
                remoteUserName: incomingCall.callerName,
              })
            } else {
              alert('Gagal menerima panggilan')
            }
          })
        }

        setIncomingCallModalOpen(false)
        setIncomingCall(null)
      } catch (error: any) {
        console.error('Error getting media:', error)
        const errorMessage = error?.message || 'Gagal mengakses kamera/mikrofon'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error accepting call:', error)
      alert('Gagal menerima panggilan')
    }
  }

  const handleRejectIncomingCall = async () => {
    if (!callSocketRef.current || !incomingCall) return

    try {
      console.log('❌ Rejecting incoming call:', incomingCall.callId)
      
      // ✅ CRITICAL: Stop camera/microphone BEFORE rejecting
      if (localStreamRef.current) {
        console.log('🛑 Stopping local media stream...')
        stopMediaStream(localStreamRef.current)
        localStreamRef.current = null
        setLocalStream(null)
        console.log('✅ Local media stream stopped')
      }
      
      // Close peer connection if opened
      if (peerConnectionRef.current) {
        console.log('🔌 Closing peer connection...')
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
        console.log('✅ Peer connection closed')
      }
      
      if (callSocketRef.current) {
        callSocketRef.current.emit('call-reject', {
          callId: incomingCall.callId,
          reason: 'User declined',
        }, (response: any) => {
          if (response?.status === 'rejected') {
            console.log('✅ Call rejected successfully')
          } else {
            alert('Gagal menolak panggilan')
          }
        })
      }

      setIncomingCallModalOpen(false)
      setIncomingCall(null)
    } catch (error) {
      console.error('Error rejecting call:', error)
      alert('Gagal menolak panggilan')
    }
  }

  // Call UI handles all stream attachment now - no need to attach here
  // Just ensure refs are passed correctly to CallUI

  // Manage call duration timer - only increment when connected
  useEffect(() => {
    let timer: any = null
    if (activeCall && isConnected) {
      timer = setInterval(() => {
        setCallDuration((d) => d + 1)
      }, 1000)
    } else if (!activeCall) {
      setCallDuration(0)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [activeCall, isConnected])

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
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari percakapan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-hide">
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
                      <div className={`w-12 h-12 ${getAvatarBgColor(initial)} rounded-full flex items-center justify-center`}>
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
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          </div>
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
            <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${getAvatarBgColor(activeCounselorInitial)} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-semibold text-sm">{activeCounselorInitial}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{activeCounselorName}</h4>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleVoiceCall}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 p-2 rounded-lg"
                  title="Mulai panggilan suara"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={handleVideoCall}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 p-2 rounded-lg"
                  title="Mulai video call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <div className="relative group">
                  <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {/* Kebab Menu Dropdown */}
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-200">
                    {pinnedTopics.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowPinnedModal(true)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 border-b border-gray-200 first:rounded-t-lg flex items-center gap-2"
                        >
                          📌 Riwayat Sesi ({pinnedTopics.length})
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Bubble / Pill */}
            {activeConversation?.topic && (
              <div className="px-4 pb-3 bg-white border-b border-gray-100">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span>📚 {activeConversation.topic}</span>
                </div>
              </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col">
              <div className="w-full">
                {messages.map((message: Message, index: number) => {
                  const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1])
                  
                  // Helper: Get reservasi active at message time
                  const getReservatiForMessage = (msg: Message): Reservasi | null => {
                    const matchingReservasi = reservasiHistory.filter((r: Reservasi) => r.conversationId === activeCounselorId)
                    if (matchingReservasi.length === 0) return null
                    // Find reservasi created before or at message time
                    const msgTime = new Date(msg.originalDate)
                    return matchingReservasi
                      .filter(r => new Date(r.createdAt) <= msgTime)
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null
                  }
                  
                  const currentReservasi = getReservatiForMessage(message)
                  const previousReservasi = index > 0 ? getReservatiForMessage(messages[index - 1]) : null
                  // Check if reservasi changed
                  const showSessionSeparator = currentReservasi && (index === 0 || currentReservasi.id !== previousReservasi?.id)
                  const topicDisplay = currentReservasi?.topic ? `📚 Sesi chat: ${currentReservasi.topic?.name || 'Konseling'}${currentReservasi.notes ? ` | ${currentReservasi.notes}` : ''}` : (activeConversation?.topic ? `📚 Sesi chat: ${activeConversation.topic}` : null)
                  const topicId = currentReservasi ? `sesi-${currentReservasi.id}` : 'conversation'
                  
                  return (
                    <div key={message.id} className="flex flex-col w-full">
                      {showDateSeparator && (
                        <div className="text-center mb-4 mt-2">
                          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                            {getMessageDateLabel(message.originalDate)}
                          </span>
                        </div>
                      )}
                      
                      {/* Topic Separator - Show when session changes */}
                      {showSessionSeparator && topicDisplay && (
                        <div 
                          ref={el => {
                            if (el && topicId) topicSeparatorRefs.current[topicId] = el
                          }}
                          className="text-center mb-4 mt-2 cursor-pointer hover:bg-blue-100 transition-colors rounded-full px-3 py-1.5"
                        >
                          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium inline-block">
                            {topicDisplay}
                          </span>
                        </div>
                      )}
                      <div className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`
                            px-4 py-3 rounded-xl mb-2
                            ${
                              message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }
                            break-words max-w-xs sm:max-w-md
                          `}
                        >
                          {message.messageType === 'voice' ? (
                            <div className="flex items-center gap-2">
                              <audio
                                src={message.voiceUrl}
                                controls
                                className="h-8 flex-1"
                                onContextMenu={(e) => e.preventDefault()}
                              />
                              {message.duration && (
                                <span className="text-xs whitespace-nowrap">
                                  {Math.floor(message.duration / 60)}:{String(message.duration % 60).padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">{message.content}</p>
                              {message.isEdited && (
                                <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                  (disunting)
                                </span>
                              )}
                            </>
                          )}
                          <span
                            className={`text-xs block mt-1 ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-600'
                            }`}
                          >
                            {message.timestamp}
                          </span>
                          {message.sender === 'user' && (
                            <span className="text-xs text-gray-500 mt-1">dibaca</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Show separator for latest reservasi if not already shown in messages */}
                {reservasiHistory.length > 0 && activeCounselorId && (
                  (() => {
                    // Get latest reservasi for this conversation
                    const matchingReservasi = reservasiHistory
                      .filter((r: Reservasi) => r.conversationId === activeCounselorId && r.type === 'chat')
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    
                    if (matchingReservasi.length > 0) {
                      const latestReservasi = matchingReservasi[0]
                      
                      // Check if latest reservasi is already shown in messages
                      const lastMessageReservasi = messages.length > 0 
                        ? (() => {
                            const lastMsg = messages[messages.length - 1]
                            const msgTime = new Date(lastMsg.originalDate)
                            return matchingReservasi
                              .filter(r => new Date(r.createdAt) <= msgTime)
                              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                          })()
                        : null
                      
                      // Show separator if latest reservasi is different from last message's reservasi
                      if (latestReservasi.id !== lastMessageReservasi?.id) {
                        const topicDisplay = `📚 Sesi chat: ${latestReservasi.topic?.name || 'Konseling'}${latestReservasi.notes ? ` | ${latestReservasi.notes}` : ''}`
                        const topicId = `sesi-${latestReservasi.id}`
                        
                        return (
                          <div key={`latest-separator-${latestReservasi.id}`} className="flex flex-col w-full mt-4">
                            <div 
                              ref={el => {
                                if (el && topicId) topicSeparatorRefs.current[topicId] = el
                              }}
                              className="text-center mb-4 cursor-pointer hover:bg-blue-100 transition-colors rounded-full px-3 py-1.5"
                            >
                              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium inline-block">
                                {topicDisplay}
                              </span>
                            </div>
                          </div>
                        )
                      }
                    }
                    return null
                  })()
                )}

                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Mulai percakapan dengan {activeCounselorName}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              {activeConversation!.status === 'completed' ? (
                <div className="p-3 bg-gray-100 text-gray-700 rounded-lg text-center text-sm font-medium">
                  ✓ Sesi telah selesai. Riwayat pesan tersedia untuk dilihat.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {isRecording ? (
                    <div className="flex gap-2 items-center justify-between bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-600">
                          Merekam... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelRecording}
                          className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleStopRecording}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition flex items-center gap-1"
                        >
                          <Square className="w-3 h-3" />
                          Selesai
                        </button>
                      </div>
                    </div>
                  ) : recordedChunks.length > 0 ? (
                    <div className="flex flex-col gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600">
                          Pesan suara siap dikirim ({Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')})
                        </span>
                      </div>
                      <div className="bg-white rounded p-2 border border-blue-200">
                        <audio
                          src={URL.createObjectURL(recordedChunks[0])}
                          controls
                          className="w-full h-8"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelRecording}
                          className="flex-1 px-3 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={handleSendVoiceMessage}
                          disabled={sendingMessage}
                          className="flex-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded transition flex items-center justify-center gap-1"
                        >
                          {sendingMessage ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          Kirim
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-end">
                      <button
                        onClick={handleStartRecording}
                        disabled={sendingMessage}
                        className="px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <div className="flex-1 flex gap-2 items-end bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200">
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
                          disabled={sendingMessage || (activeConversation as APIConversation).status === 'completed'}
                          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 disabled:text-gray-400"
                        />
                        <div className="relative group">
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-400 hover:text-gray-600 transition p-1"
                          >
                            <Smile className="w-5 h-5" />
                          </button>
                          {showEmojiPicker && (
                            <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 w-56">
                              <div className="grid grid-cols-5 gap-3 justify-items-center">
                                {dynamicEmojis.map((emoji, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleEmojiInsert(emoji)}
                                    className="text-2xl hover:bg-gray-100 p-2 rounded transition hover:scale-110 duration-200"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendingMessage || (activeConversation as APIConversation).status === 'completed'}
                        className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2"
                      >
                        {sendingMessage ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
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

      {/* Incoming Call Modal */}
      {incomingCallModalOpen && incomingCall && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="mb-6">
              <div className={`w-20 h-20 ${incomingCall.callType === 'video' ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {incomingCall.callType === 'video' ? (
                  <Video className="w-10 h-10 text-red-600" />
                ) : (
                  <Phone className="w-10 h-10 text-green-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {incomingCall.callType === 'video' ? 'Panggilan Video Masuk' : 'Panggilan Suara Masuk'}
              </h3>
              <p className="text-gray-600 mb-4">{incomingCall.callerName} menelepon Anda</p>
              <div className="text-4xl mb-4 animate-pulse">
                {incomingCall.callType === 'video' ? '📹' : '📞'}
              </div>
            </div>

            <div className="space-y-3 flex gap-3 justify-center">
              <button
                onClick={handleAcceptIncomingCall}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                ✓ Terima
              </button>
              <button
                onClick={handleRejectIncomingCall}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                ✕ Tolak
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reconnecting Modal */}
      {isReconnecting && activeCall && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg p-8 text-center max-w-md mx-4">
            <div className="mb-6">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-500"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Menghubungkan Kembali</h2>
            <p className="text-gray-300 mb-4">Tunggu sebentar, kami sedang memulihkan koneksi panggilan Anda...</p>
            <p className="text-sm text-gray-400">Jangan tutup halaman ini</p>
          </div>
        </div>
      )}

      {/* Active Call UI */}
      {activeCall && !isReconnecting && (
        <CallUI
          callId={activeCall.callId}
          callType={activeCall.callType}
          remoteUserName={activeCall.remoteUserName || incomingCall?.callerName || ''}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          remoteAudioRef={remoteAudioRef}
          localStream={localStream}
          remoteStream={remoteStream}
          onHangup={handleHangup}
          isConnected={isConnected}
          callDuration={callDuration}
          hasRemoteStream={hasRemoteStream}
          isRemoteMuted={isRemoteMuted}
          isRemoteVideoOff={isRemoteVideoOff}
        />
      )}

      {/* Pinned Topics Modal */}
      {showPinnedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full sm:w-96 rounded-t-lg sm:rounded-lg sm:max-h-96 overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-lg">
              <h3 className="font-semibold text-gray-900">📌 Riwayat Sesi</h3>
              <button
                onClick={() => setShowPinnedModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {pinnedTopics.map((pinnedTopic) => (
                <div key={pinnedTopic.id} className="relative group">
                  <button
                    onClick={() => {
                      const ref = topicSeparatorRefs.current[pinnedTopic.id]
                      if (ref) {
                        setShowPinnedModal(false)
                        setTimeout(() => {
                          ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }, 100)
                      }
                    }}
                    className="w-full text-left p-4 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {pinnedTopic.topic}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(pinnedTopic.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Click untuk ke pin ini
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage