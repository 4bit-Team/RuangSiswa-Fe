'use client'

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Eye, Calendar, User, X } from 'lucide-react';
import { NewsItemProps, NewsDetailProps } from '@types';
import { useAuth } from '@hooks/useAuth';
import { formatTimeRelative, formatDateTime } from '@lib/timeFormat';
import NewsAPI from '@lib/newsAPI';

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItemProps | NewsDetailProps | null;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ isOpen, onClose, news }) => {
  const { user, token } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (isOpen && news) {
      loadData();
    }
  }, [isOpen, news?.id]);

  const loadData = async () => {
    if (!news || !('id' in news)) return;

    try {
      // Check if user liked
      if (user && token) {
        const likedResponse = await NewsAPI.checkUserLiked(news.id, token);
        setLiked(likedResponse.liked);
      }

      // Get likes count
      const likesResponse = await NewsAPI.getNewsLikesCount(news.id);
      setLikesCount(likesResponse.count);

      // Get comments
      setLoadingComments(true);
      const commentsResponse = await NewsAPI.getComments(news.id);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!user || !token) {
      alert('Silakan login untuk memberikan like');
      return;
    }

    if (!news || !('id' in news)) return;

    try {
      const response = await NewsAPI.toggleLike(news.id, token);
      setLiked(response.liked);
      setLikesCount(response.liked ? likesCount + 1 : likesCount - 1);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      alert('Silakan login untuk berkomentar');
      return;
    }

    if (!news || !('id' in news) || !newComment.trim()) return;

    setPostingComment(true);
    try {
      await NewsAPI.addComment(news.id, newComment, token);
      setNewComment('');
      await loadData();
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Gagal mengirim komentar');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user || !token) return;

    if (!confirm('Yakin ingin menghapus komentar?')) return;

    try {
      await NewsAPI.deleteComment(commentId, token);
      await loadData();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Gagal menghapus komentar');
    }
  };

  if (!isOpen || !news) return null;

  const isDetailNews = 'content' in news;
  const title = 'title' in news ? news.title : '';
  const author = 'author' in news ? (typeof news.author === 'string' ? news.author : news.author.fullName) : '';
  const date = 'date' in news ? news.date : 'date' in news ? news.publishedDate : '';
  const image = 'image' in news ? news.image : 'imageUrl' in news ? news.imageUrl : '';
  const category = 'category' in news ? news.category : 'categories' in news ? news.categories[0] : '';
  const description = 'description' in news ? news.description : 'summary' in news ? news.summary : '';
  const content = 'content' in news ? news.content : description;
  const views = 'views' in news ? news.views : 'viewCount' in news ? news.viewCount : 0;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image */}
            {image && (
              <img
                src={image}
                alt={title}
                className="w-full h-96 object-cover rounded-xl"
              />
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatTimeRelative(date || new Date())}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{views} views</span>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {Array.isArray(category) 
                ? category.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
                    >
                      {cat}
                    </span>
                  ))
                : category && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      {category}
                    </span>
                  )}
            </div>

            {/* Summary (if available) */}
            {isDetailNews && 'summary' in news && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-900 font-semibold mb-1">Ringkasan</p>
                <p className="text-gray-700 text-sm">{news.summary}</p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <div
                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  liked
                    ? 'bg-pink-100 text-pink-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                <span>{likesCount}</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                <MessageCircle size={18} />
                <span>{comments.length}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-900">Komentar</h3>

              {/* Comment Form */}
              {user && token ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tulis komentar..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={postingComment || !newComment.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <Send size={18} />
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-600">
                  Silakan <span className="font-semibold">login</span> untuk berkomentar
                </p>
              )}

              {/* Comments List */}
              {loadingComments ? (
                <div className="text-center py-4 text-gray-500">Loading comments...</div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {comment.author?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {comment.author?.fullName ?? 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                            {formatTimeRelative(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        {user?.id === comment.authorId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500 text-sm">
                  Belum ada komentar. Jadilah yang pertama!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetailModal;
