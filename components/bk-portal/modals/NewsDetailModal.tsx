'use client'

import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { BaseModal } from './index';
import { NewsItemProps } from '../types';

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItemProps | null;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ isOpen, onClose, news }) => {
  const [likes, setLikes] = useState(news?.likes || 0);
  const [comments, setComments] = useState(news?.comments || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments(comments + 1);
      setCommentText('');
    }
  };

  if (!news) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Detail Berita" width="max-w-5xl">
      <div className="space-y-6">
          {/* Image */}
          <div className="w-full h-64 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl overflow-hidden">
            {news.image ? (
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-center px-4">
                <span>{news.title}</span>
              </div>
            )}
          </div>

          {/* Category & Author Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {news.category}
              </span>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {news.status}
              </span>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">{news.author.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{news.author}</p>
                <p className="text-sm text-gray-500">{news.date}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{news.title}</h2>
          </div>

          {/* Description */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {news.description}
          </div>

          {/* Engagement Stats */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  isLiked
                    ? 'text-pink-600'
                    : 'text-gray-500 hover:text-pink-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-semibold">{likes}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">{comments}</span>
              </div>
              <span className="ml-auto text-sm text-gray-500">
                {news.views} views
              </span>
            </div>
          </div>

        {/* Comment Section */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-900 mb-4">Tambah Komentar</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Tulis komentar Anda..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddComment}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Kirim
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default NewsDetailModal;
