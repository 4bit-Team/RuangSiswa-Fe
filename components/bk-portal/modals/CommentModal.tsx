'use client'

import React, { useState } from 'react'
import { MessageCircle, Send, Smile, X } from 'lucide-react'

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  initialComments?: number
  authorName?: string
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  initialComments = 8,
  authorName = 'Post Update BK',
}) => {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [commentList, setCommentList] = useState([
    {
      id: 1,
      author: 'Andi Pratama',
      initial: 'A',
      text: 'Sangat membantu, terima kasih Bu Sarah! 🙏',
      time: '2 jam lalu',
    },
    {
      id: 2,
      author: 'Dina Kusuma',
      initial: 'D',
      text: 'Saya setuju sekali dengan tips yang dibagikan.',
      time: '1 jam lalu',
    },
    {
      id: 3,
      author: 'Rizki Ramadhan',
      initial: 'R',
      text: 'Kapan ada sesi konseling yang membahas topik ini?',
      time: '30 menit lalu',
    },
  ])

  const handleComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Math.max(...commentList.map((c) => c.id), 0) + 1,
        author: 'Saya',
        initial: 'S',
        text: newComment,
        time: 'baru saja',
      }
      setCommentList([...commentList, newCommentObj])
      setComments(comments + 1)
      setNewComment('')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Komentar</h2>
              <p className="text-blue-100 text-sm">{comments} komentar pada {authorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3 pb-4">
              {commentList.map((comment) => (
                <div
                  key={comment.id}
                  className="group p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {comment.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900 text-sm">{comment.author}</h5>
                        <span className="text-xs text-gray-500 ml-2">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 break-words">{comment.text}</p>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="text-xs text-blue-600 hover:underline">Suka</button>
                        <button className="text-xs text-blue-600 hover:underline">Balas</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  K
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis komentar Anda..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Kirim
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
              <div className="text-center py-2 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{comments}</p>
                <p className="text-xs text-gray-600">Total Komentar</p>
              </div>
              <div className="text-center py-2 bg-purple-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{commentList.length}</p>
                <p className="text-xs text-gray-600">Ditampilkan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentModal
