import { API_URL } from './api';
import { NewsItemProps } from '@types';

export interface CreateNewsPayload {
  title: string;
  summary: string;
  content: string;
  categories: string[];
  imageUrl?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: string;
}

export interface UpdateNewsPayload extends Partial<CreateNewsPayload> {}

export interface NewsQueryParams {
  status?: string;
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'mostViewed';
  page?: number;
  limit?: number;
}

/**
 * Utility: Strip HTML tags from string
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
};

/**
 * Utility: Truncate text to max length
 */
export const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Utility: Get clean preview text (strip HTML and truncate)
 */
export const getCleanPreview = (text: string, maxLength: number = 150): string => {
  return truncateText(stripHtmlTags(text), maxLength);
};

/**
 * Transform API response to NewsItemProps format
 */
const transformNewsData = (data: any): NewsItemProps & { summary?: string } => {
  try {
    // Ensure likes and comments are arrays
    const likes = Array.isArray(data.likes) ? data.likes : [];
    const comments = Array.isArray(data.comments) ? data.comments : [];
    // Ensure categories is array
    const categories = Array.isArray(data.categories) ? data.categories : data.categories ? [data.categories] : [];
    
    return {
      id: data.id,
      title: data.title,
      description: data.content,
      summary: data.summary, // Optional summary field
      author: data.author?.fullName || data.author?.username || 'Anonymous',
      date: data.publishedDate || data.createdAt || new Date(),
      category: categories[0] || 'Umum', // For backward compatibility
      categories: categories, // Add this for components that need full array
      status: data.status,
      image: data.imageUrl,
      likes: likes.length || 0,
      comments: comments.length || 0,
      views: data.viewCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error transforming news data:', error, data);
    throw error;
  }
};

class NewsAPI {
  // Create news
  static async createNews(payload: CreateNewsPayload, token: string) {
    const response = await fetch(`${API_URL}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create news');
    }

    return response.json();
  }

  // Get all news
  static async getAllNews(params?: NewsQueryParams) {
    const queryString = new URLSearchParams();
    if (params) {
      if (params.status) queryString.append('status', params.status);
      if (params.category) queryString.append('category', params.category);
      if (params.search) queryString.append('search', params.search);
      if (params.sortBy) queryString.append('sortBy', params.sortBy);
      if (params.page) queryString.append('page', String(params.page));
      if (params.limit) queryString.append('limit', String(params.limit));
    }

    const response = await fetch(
      `${API_URL}/news?${queryString.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    const newsArray = Array.isArray(data.data) ? data.data : [];
    return {
      ...data,
      data: newsArray.map((item: any) => transformNewsData(item)),
    };
  }

  // Get published news
  static async getPublishedNews(params?: NewsQueryParams) {
    const queryString = new URLSearchParams();
    if (params) {
      if (params.category) queryString.append('category', params.category);
      if (params.search) queryString.append('search', params.search);
      if (params.sortBy) queryString.append('sortBy', params.sortBy);
      if (params.page) queryString.append('page', String(params.page));
      if (params.limit) queryString.append('limit', String(params.limit));
    }

    const response = await fetch(
      `${API_URL}/news/published?${queryString.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch published news');
    }

    const data = await response.json();
    const newsArray = Array.isArray(data.data) ? data.data : [];
    return {
      ...data,
      data: newsArray.map((item: any) => transformNewsData(item)),
    };
  }

  // Get news by category
  static async getNewsByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ) {
    const response = await fetch(
      `${API_URL}/news/category/${category}?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch news by category');
    }

    const data = await response.json();
    const newsArray = Array.isArray(data.data) ? data.data : [];
    return {
      ...data,
      data: newsArray.map((item: any) => transformNewsData(item)),
    };
  }

  // Get user's news
  static async getUserNews(
    userId: number,
    page: number = 1,
    limit: number = 10,
    token?: string
  ) {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}/news/user/${userId}?page=${page}&limit=${limit}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user news');
    }

    const data = await response.json();
    
    // Ensure data.data is an array before mapping
    const newsArray = Array.isArray(data.data) ? data.data : [];
    
    return {
      ...data,
      data: newsArray.map((item: any) => transformNewsData(item)),
    };
  }

  // Get single news
  static async getNews(id: number) {
    const response = await fetch(`${API_URL}/news/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    return transformNewsData(data);
  }

  // Update news
  static async updateNews(
    id: number,
    payload: UpdateNewsPayload,
    token: string
  ) {
    const response = await fetch(`${API_URL}/news/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to update news');
    }

    return response.json();
  }

  // Delete news
  static async deleteNews(id: number, token: string) {
    const response = await fetch(`${API_URL}/news/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete news');
    }

    return response.json();
  }

  // Toggle like
  static async toggleLike(id: number, token: string) {
    const response = await fetch(`${API_URL}/news/${id}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    return response.json();
  }

  // Check if user liked
  static async checkLikeStatus(id: number, token: string) {
    const response = await fetch(`${API_URL}/news/${id}/like-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check like status');
    }

    return response.json();
  }

  // Add comment
  static async addComment(id: number, content: string, token: string) {
    const response = await fetch(`${API_URL}/news/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    return response.json();
  }

  // Get comments
  static async getComments(
    id: number,
    page: number = 1,
    limit: number = 10
  ) {
    const response = await fetch(
      `${API_URL}/news/${id}/comments?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  }

  // Delete comment
  static async deleteComment(commentId: number, token: string) {
    const response = await fetch(
      `${API_URL}/news/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    return response.json();
  }

  // Upload news image
  static async uploadNewsImage(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_URL}/upload/news-image`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }

  // Check if user liked news
  static async checkUserLiked(newsId: number, token: string) {
    const response = await fetch(`${API_URL}/news/${newsId}/liked`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check like status');
    }

    return response.json();
  }

  // Get likes count
  static async getNewsLikesCount(newsId: number) {
    const response = await fetch(`${API_URL}/news/${newsId}/likes-count`);

    if (!response.ok) {
      throw new Error('Failed to get likes count');
    }

    return response.json();
  }
}

export default NewsAPI;
