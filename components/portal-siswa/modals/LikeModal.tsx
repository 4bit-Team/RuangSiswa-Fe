'use client'

import React, { useState } from 'react'
import { Heart, Share2, X } from 'lucide-react'

interface LikeModalProps {
  isOpen: boolean
  onClose: () => void
  initialLikes?: number
  authorName?: string
}

const LikeModal: React.FC<LikeModalProps> = ({
  isOpen,
  onClose,
  initialLikes = 42,
  authorName = 'Post Update BK',
}) => {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = () => {
    setIsAnimating(true)
    if (liked) {
      setLikes(likes - 1)
    } else {
      setLikes(likes + 1)
    }
    setLiked(!liked)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const likers = [
    { name: 'Ahmad Rizki', initial: 'A' },
    { name: 'Siti Nurhaliza', initial: 'S' },
    { name: 'Budi Santoso', initial: 'B' },
    { name: 'Rini Puspita', initial: 'R' },
    { name: 'Eka Prasetya', initial: 'E' },
  ]

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
        <div className="bg-gradient-to-r from-pink-500 to-red-500 px-6 py-6 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Suka Update Ini</h2>
              <p className="text-pink-100 text-sm">{likes} orang suka {authorName}</p>
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
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="inline-block">
                <button
                  onClick={handleLike}
                  className={`relative transition-all duration-300 transform ${
                    isAnimating ? 'scale-125' : 'scale-100'
                  } hover:scale-110`}
                >
                  <Heart
                    className={`w-16 h-16 transition-all duration-300 ${
                      liked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-300 hover:text-red-300'
                    }`}
                  />
                </button>
              </div>
              <p className={`text-3xl font-bold mt-4 transition-colors duration-300 ${
                liked ? 'text-red-500' : 'text-gray-900'
              }`}>
                {likes}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {liked ? 'Terima kasih atas dukunganmu! 🎉' : 'Berikan dukungan dengan menyukai update ini'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Orang yang menyukai ini</h4>
              <div className="space-y-3">
                {likers.map((liker, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {liker.initial}
                      </div>
                      <span className="font-medium text-gray-900">{liker.name}</span>
                    </div>
                    <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-all duration-200">
                      Lihat Profil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleLike}
                className={`py-3 rounded-lg font-medium transition-all duration-300 ${
                  liked
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {liked ? '❤️ Suka' : '🤍 Suka'}
              </button>
              <button className="py-3 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition-all duration-300 flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Bagikan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LikeModal
