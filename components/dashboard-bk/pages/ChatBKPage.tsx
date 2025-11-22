'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Search, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'counselor'
  content: string
  timestamp: string
}

interface Counselor {
  id: string
  initial: string
  name: string
  role: string
  status: 'online' | 'offline'
  message: string
  time: string
  unread?: number
}

const ChatBKPage: React.FC = () => {
  const [counselors] = useState<Counselor[]>([
    {
      id: '1',
      initial: 'S',
      name: 'Bu Sarah',
      role: 'Konselor BK',
      status: 'online',
      message: 'Terima kasih atas konsultasinya kemarin',
      time: '10:03',
      unread: 0,
    },
    {
      id: '2',
      initial: 'B',
      name: 'Pak Budi',
      role: 'Konselor Karir',
      status: 'offline',
      message: 'Sampai jumpa di sesi berikutnya',
      time: 'Kemarin',
      unread: 2,
    },
    {
      id: '3',
      initial: 'R',
      name: 'Bu Rina',
      role: 'Konselor Akademik',
      status: 'online',
      message: 'Terima kasih atas konsultasinya',
      time: '2 hari lalu',
      unread: 0,
    },
  ])

  const [activeCounselorId, setActiveCounselorId] = useState('1')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'counselor',
      content: 'Hai Andi, saya siap membantu kamu. Apa yang sedang kamu rasakan?',
      timestamp: '10:03',
    },
    {
      id: '2',
      sender: 'user',
      content: 'Terima kasih Bu Sarah. Saya merasa sedikit tertekan dengan ujian yang akan datang',
      timestamp: '10:05',
    },
    {
      id: '3',
      sender: 'counselor',
      content: 'Saya mengerti perasaanmu. Mari kita diskusikan strategi yang bisa membantu kamu menghadapi ujian dengan lebih tenang',
      timestamp: '10:06',
    },
  ])
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeCounselor = counselors.find((c) => c.id === activeCounselorId)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: messageInput,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessageInput('')

    // Simulate counselor response
    setTimeout(() => {
      const counselorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'counselor',
        content: 'Terima kasih atas pertanyaanmu. Saya akan membantu kamu dengan masalah ini.',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setMessages((prev) => [...prev, counselorMessage])
    }, 1000)
  }

  const getInitialBgColor = (initial: string): string => {
    const colors: Record<string, string> = {
      S: 'bg-gradient-to-br from-blue-500 to-blue-600',
      B: 'bg-gradient-to-br from-purple-500 to-purple-600',
      R: 'bg-gradient-to-br from-green-500 to-green-600',
      A: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    }
    return colors[initial] || 'bg-gradient-to-br from-gray-500 to-gray-600'
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Counselor List */}
        <div className="flex-1 overflow-y-auto">
          {counselors.map((counselor) => (
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
                  <div className={`w-12 h-12 ${getInitialBgColor(counselor.initial)} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {counselor.initial}
                  </div>
                  {counselor.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{counselor.name}</h4>
                    <span className="text-xs text-gray-500">{counselor.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{counselor.role}</p>
                  <p className="text-sm text-gray-600 truncate">{counselor.message}</p>
                </div>

                {/* Unread Badge */}
                {counselor.unread && counselor.unread > 0 && (
                  <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold flex-shrink-0">
                    {counselor.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        {activeCounselor && (
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${getInitialBgColor(activeCounselor.initial)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                {activeCounselor.initial}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{activeCounselor.name}</h3>
                <p className={`text-xs ${activeCounselor.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
                  {activeCounselor.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="max-w-3xl mx-auto">
            {/* Date Separator */}
            <div className="text-center mb-6">
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">Hari ini</span>
            </div>

            {/* Messages */}
            {messages.map((message) => (
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
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}

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
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ketik pesan..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              />
              <button className="text-gray-400 hover:text-gray-600 transition p-1">
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBKPage
