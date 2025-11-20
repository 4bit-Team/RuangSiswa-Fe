'use client'

import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, User, Calendar, BookOpen, X } from 'lucide-react';

// Interfaces
interface ArticleCardProps {
  id: number;
  title: string;
  category: string;
  status: 'Published' | 'Draft';
  views: number;
  author: string;
  date: string;
  excerpt: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
}

// Article Card Component
const ArticleCard: React.FC<ArticleCardProps> = ({ id, title, category, status, views, author, date, excerpt }) => (
  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="w-32 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex-shrink-0"></div>
    <div className="flex-1">
      <div className="flex items-center space-x-2 mb-2">
        <span className={`text-xs px-2 py-1 rounded ${
          category === 'Akademik' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {category}
        </span>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
          {status}
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{excerpt}</p>
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center"><User size={12} className="mr-1" /> {author}</span>
        <span className="flex items-center"><Calendar size={12} className="mr-1" /> {date}</span>
        <span className="flex items-center"><Eye size={12} className="mr-1" /> {views} views</span>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button className="p-2 hover:bg-gray-200 rounded-lg" title="Lihat">
        <Eye size={18} className="text-gray-600" />
      </button>
      <button className="p-2 hover:bg-gray-200 rounded-lg" title="Edit">
        <Edit size={18} className="text-gray-600" />
      </button>
      <button className="p-2 hover:bg-gray-200 rounded-lg" title="Hapus">
        <Trash2 size={18} className="text-red-600" />
      </button>
    </div>
  </div>
);

// Stats Card Component
const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <h3 className="text-sm text-gray-600 mb-2">{label}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const BeritaPage: React.FC = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const articles: ArticleCardProps[] = [
    {
      id: 1,
      title: 'Tips Menghadapi Ujian Akhir Semester',
      category: 'Akademik',
      status: 'Published',
      views: 234,
      author: 'Ibu Sarah Wijaya',
      date: '15 Nov 2025',
      excerpt: 'Persiapan yang matang adalah kunci sukses menghadapi ujian. Berikut beberapa tips yang bisa membantu siswa...'
    },
    {
      id: 2,
      title: 'Mengatasi Stress dan Kecemasan',
      category: 'Kesehatan Mental',
      status: 'Published',
      views: 189,
      author: 'Ibu Sarah Wijaya',
      date: '12 Nov 2025',
      excerpt: 'Stress adalah bagian normal dari kehidupan, namun penting untuk mengelolanya dengan baik...'
    },
    {
      id: 3,
      title: 'Pilihan Karir Sesuai Bakat dan Minat',
      category: 'Akademik',
      status: 'Published',
      views: 156,
      author: 'Pak Budi',
      date: '10 Nov 2025',
      excerpt: 'Memilih karir yang tepat merupakan keputusan penting dalam hidup. Mari kita eksplorasi berbagai pilihan...'
    },
    {
      id: 4,
      title: 'Membangun Hubungan Sosial yang Sehat',
      category: 'Kesehatan Mental',
      status: 'Published',
      views: 142,
      author: 'Ibu Sarah Wijaya',
      date: '08 Nov 2025',
      excerpt: 'Hubungan sosial yang baik adalah fondasi kesejahteraan mental. Pelajari cara membangun dan memelihara...'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Berita & Artikel BK</h2>
          <p className="text-sm text-gray-600">Kelola dan publikasikan artikel untuk siswa</p>
        </div>
        <button 
          onClick={() => setOpenModal('create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors">
          <Plus size={20} />
          <span>Buat Berita</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Artikel" value="24" />
        <StatCard label="Dipublikasikan" value="18" />
        <StatCard label="Draft" value="6" />
        <StatCard label="Total Views" value="1,234" />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari berita atau artikel..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Semua Kategori</option>
            <option>Akademik</option>
            <option>Kesehatan Mental</option>
            <option>Karir</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Semua Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </div>

      {/* Modal: Buat Berita */}
      <div>
        {openModal === 'create' && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setOpenModal(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-2xl font-bold">Kelola Berita</h2>
                    <p className="text-blue-100 text-sm mt-1">Tambah atau ubah informasi berita</p>
                  </div>
                  <button
                    onClick={() => setOpenModal(null)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log('News created');
                      setOpenModal(null);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Berita
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan judul berita"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Pilih Kategori</option>
                        <option value="akademik">Akademik</option>
                        <option value="sosial">Sosial</option>
                        <option value="karir">Karir</option>
                        <option value="pengumuman">Pengumuman</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ringkasan
                      </label>
                      <textarea
                        placeholder="Masukkan ringkasan berita..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konten
                      </label>
                      <textarea
                        placeholder="Masukkan konten berita lengkap..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Pilih Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setOpenModal(null)}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                      >
                        Simpan Berita
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BeritaPage;
