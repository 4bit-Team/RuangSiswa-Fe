'use client'

import React, { useState } from 'react';
import { Phone, Video, MoreVertical, Send, Search } from 'lucide-react';
import { ChatListItemProps, ChatBubbleProps } from '@types';
import { CallModal } from '../modals';


const ChatListItem: React.FC<ChatListItemProps> = ({
  initial,
  name,
  role,
  message,
  time,
  active,
  unread,
  online,
}) => (
  <div
    className={`
      p-4 border-b border-gray-200 cursor-pointer
      ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}
    `}
  >
    <div className="flex gap-3">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{initial}</span>
        </div>
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900">{name}</h4>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">{role}</p>
            <p className="text-sm text-gray-600 truncate">{message}</p>
          </div>
          {unread && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, time, sender }) => (
  <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`
        max-w-[70%] p-4 rounded-xl mb-4
        ${
          sender === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-50 border border-gray-200'
        }
      `}
    >
      <p className="text-sm">{message}</p>
      <span
        className={`text-xs ${
          sender === 'user' ? 'text-blue-100' : 'text-gray-500'
        }`}
      >
        {time}
      </span>
    </div>
  </div>
);

const ChatPage: React.FC = () => {
  const [callModalOpen, setCallModalOpen] = useState(false);

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
          <ChatListItem
            initial="S"
            name="Bu Sarah"
            role="Konselor BK"
            message="Hai Andi, saya siap membantu kamu"
            time="10:03"
            active={true}
            unread={0}
            online={true}
          />
          <ChatListItem
            initial="B"
            name="Pak Budi"
            role="Konselor Karir"
            message="Sampai jumpa di sesi berikutnya"
            time="Kemarin"
            active={false}
            unread={2}
            online={false}
          />
          <ChatListItem
            initial="R"
            name="Bu Rina"
            role="Konselor Akademik"
            message="Terima kasih atas konsultasinya"
            time="2 hari lalu"
            active={false}
            unread={0}
            online={true}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">S</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Bu Sarah</h4>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setCallModalOpen(true)}
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 p-2 rounded-lg"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCallModalOpen(true)}
              className="text-gray-500 hover:text-purple-600 transition-colors duration-200 hover:bg-purple-50 p-2 rounded-lg"
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
            <div className="text-center mb-6">
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                Hari ini
              </span>
            </div>

            <ChatBubble
              message="Hai Andi, saya siap membantu kamu. Apa yang sedang kamu rasakan?"
              time="10:03"
              sender="counselor"
            />
            <ChatBubble
              message="Terima kasih Bu Sarah. Saya merasa sedikit tertekan dengan ujian yang akan datang"
              time="10:05"
              sender="user"
            />
            <ChatBubble
              message="Saya mengerti perasaanmu. Mari kita diskusikan strategi yang bisa membantu kamu menghadapi ujian dengan lebih tenang"
              time="10:06"
              sender="counselor"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <CallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        counselorName="Bu Sarah Wijaya"
        counselorInitial="S"
      />
    </div>
  );
};

export default ChatPage;