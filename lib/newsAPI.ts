import { API_URL } from './api';
import { NewsItemProps, NewsCategory } from '@types';

export interface CreateNewsPayload {
  title: string;
  summary: string;
  content: string;
  categoryIds: number[];
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
    
    // Ensure categories is array of objects with name property
    let categories: any[] = [];
    if (Array.isArray(data.categories)) {
      categories = data.categories.filter((cat: any) => cat && typeof cat === 'object' && cat.name);
    } else if (data.categories && typeof data.categories === 'object' && data.categories.name) {
      categories = [data.categories];
    }
    
    // Extract category name from first category object (for backward compatibility)
    const categoryName = categories.length > 0 && categories[0].name 
      ? String(categories[0].name) 
      : 'Umum';
    
    // Transform categories to include only name strings
    const categoryNames = categories.map((cat: any) => cat.name ? String(cat.name) : '').filter(Boolean);
    
    return {
      id: data.id,
      title: data.title,
      description: data.content || '',
      summary: data.summary || '',
      author: data.author?.fullName || data.author?.username || 'Anonymous',
      date: data.publishedDate || data.createdAt || new Date(),
      category: categoryName,
      categories: categoryNames, // Array of category names (strings)
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
  // Get categories - public endpoint
  static async getCategories(): Promise<NewsCategory[]> {
    try {
      const response = await fetch(`${API_URL}/news-category/public/list`);
      
      if (!response.ok) {
        console.error('Failed to fetch categories, status:', response.status);
        return [];
      }

      const data = await response.json();
      
      // Ensure data is array and contains valid objects
      if (!Array.isArray(data)) {
        console.error('Categories response is not an array:', data);
        return [];
      }

      // Filter and validate categories
      const validCategories = data
        .filter((cat: any) => cat && typeof cat === 'object')
        .filter((cat: any) => cat.isActive === true)
        .map((cat: any) => ({
          id: typeof cat.id === 'number' ? cat.id : parseInt(cat.id),
          name: typeof cat.name === 'string' ? cat.name : String(cat.name),
          description: cat.description || undefined,
          isActive: cat.isActive === true,
        }));

      return validCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Increment news views
  static async incrementViews(id: number) {
    const response = await fetch(`${API_URL}/news/${id}/views`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to increment views');
    }
    return response.json();
  }

  // Create news
  static async createNews(payload: CreateNewsPayload, token: string) {
    try {
      const response = await fetch(`${API_URL}/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Create news error response:', errorData);
        throw new Error(errorData.message || `Failed to create news (${response.status})`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create news request error:', error);
      throw error;
    }
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

    try {
      const response = await fetch(
        `${API_URL}/news?${queryString.toString()}`
      );

      if (!response.ok) {
        console.error('Failed to fetch all news:', response.status);
        return { data: [], total: 0 };
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        console.warn('Invalid response structure:', data);
        return { data: [], total: 0 };
      }

      const newsArray = Array.isArray(data.data) ? data.data : [];
      const transformedNews = newsArray.map((item: any) => {
        try {
          return transformNewsData(item);
        } catch (err) {
          console.error('Error transforming news item:', item, err);
          return null;
        }
      }).filter((item: any) => item !== null);

      return {
        ...data,
        data: transformedNews,
      };
    } catch (err) {
      console.error('Error fetching all news:', err);
      return { data: [], total: 0 };
    }
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

    try {
      const response = await fetch(
        `${API_URL}/news/published?${queryString.toString()}`
      );

      if (!response.ok) {
        console.error('Failed to fetch published news:', response.status);
        return { data: [], total: 0 };
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        console.warn('Invalid response structure:', data);
        return { data: [], total: 0 };
      }

      // Ensure data.data is array
      const newsArray = Array.isArray(data.data) ? data.data : [];
      
      // Transform each news item with error handling
      const transformedNews = newsArray.map((item: any) => {
        try {
          return transformNewsData(item);
        } catch (err) {
          console.error('Error transforming news item:', item, err);
          return null;
        }
      }).filter((item: any) => item !== null);

      return {
        ...data,
        data: transformedNews,
      };
    } catch (err) {
      console.error('Error fetching published news:', err);
      return { data: [], total: 0 };
    }
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

    try {
      const response = await fetch(
        `${API_URL}/news/user/${userId}?page=${page}&limit=${limit}`,
        { headers }
      );

      if (!response.ok) {
        console.error('Failed to fetch user news:', response.status);
        return { data: [], total: 0 };
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        console.warn('Invalid response structure:', data);
        return { data: [], total: 0 };
      }
      
      // Ensure data.data is an array before mapping
      const newsArray = Array.isArray(data.data) ? data.data : [];
      
      const transformedNews = newsArray.map((item: any) => {
        try {
          return transformNewsData(item);
        } catch (err) {
          console.error('Error transforming user news item:', item, err);
          return null;
        }
      }).filter((item: any) => item !== null);

      return {
        ...data,
        data: transformedNews,
      };
    } catch (err) {
      console.error('Error fetching user news:', err);
      return { data: [], total: 0 };
    }
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
    try {
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Update news error response:', errorData);
        throw new Error(errorData.message || `Failed to update news (${response.status})`);
      }

      return response.json();
    } catch (error) {
      console.error('Update news request error:', error);
      throw error;
    }
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
