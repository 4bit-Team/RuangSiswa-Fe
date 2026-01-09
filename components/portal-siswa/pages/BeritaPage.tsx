'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Heart, MessageCircle, X, Loader, Flame } from 'lucide-react';
import { NewsItemProps } from '@types';
import NewsDetailModal from '../modals/NewsDetailModal';
import NewsAPI, { getCleanPreview } from '@lib/newsAPI';
import { formatTimeRelative } from '@lib/timeFormat';

interface BeritaPageProps {
  selectedTopic?: string | null;
  setActivePage?: (page: string) => void;
}

const BeritaPage: React.FC<BeritaPageProps> = ({ selectedTopic = null, setActivePage }) => {
  const [allNews, setAllNews] = useState<NewsItemProps[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItemProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(selectedTopic);
  const [loading, setLoading] = useState(true);

  // Fetch published news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await NewsAPI.getPublishedNews({ limit: 100 });
      setAllNews(response.data);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      // Fallback to empty if API fails
      setAllNews([]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data in case API fails
  const mockNews: NewsItemProps[] = [
    {
      id: 1,
      title: 'Tips Menghadapi Ujian Akhir Semester',
      description: `Persiapan yang matang adalah kunci sukses menghadapi ujian. Berikut beberapa tips yang bisa membantu siswa-siswi dalam menghadapi ujian akhir semester:

1. Buat Jadwal Belajar yang Terstruktur
   - Mulai belajar 2-3 minggu sebelum ujian
   - Alokasikan waktu 2-3 jam per hari
   - Bagi materi sesuai dengan tingkat kesulitannya

2. Pahami Konsep, Jangan Hanya Menghafal
   - Fokus pada pemahaman mendalam
   - Buat mind map atau ringkasan
   - Coba soal-soal latihan

3. Istirahat yang Cukup
   - Tidur minimal 7-8 jam per hari
   - Istirahat 5-10 menit setiap 30 menit belajar
   - Jangan belajar semalam suntuk

4. Atur Nutrisi dan Kesehatan
   - Konsumsi makanan bergizi
   - Minum air putih yang cukup
   - Olahraga ringan untuk mengurangi stres

Semoga tips ini membantu kalian dalam menghadapi ujian. Ingat, yang terpenting adalah proses, bukan hanya hasil akhirnya!`,
      author: 'Bu Sarah Wijaya',
      date: '15 Nov 2025',
      category: 'Akademik',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1434582881033-aaf475b8e6ad?w=500&h=300&fit=crop',
      likes: 42,
      comments: 8,
      views: 234,
    },
    {
      id: 2,
      title: 'Mengatasi Stress dan Kecemasan',
      description: `Stress adalah bagian normal dari kehidupan, namun penting untuk mengelolanya dengan baik. Sebagai konselor BK, saya ingin berbagi beberapa strategi efektif:

1. Identifikasi Sumber Stress
   - Catat hal-hal yang membuat Anda stres
   - Kelompokkan berdasarkan kategori
   - Fokus pada apa yang bisa dikontrol

2. Teknik Pernapasan dan Relaksasi
   - Praktikkan deep breathing (4-7-8)
   - Coba progressive muscle relaxation
   - Meditasi atau mindfulness 10 menit per hari

3. Aktivitas Fisik
   - Olahraga 30 menit 3-4 kali per minggu
   - Jalan santai di alam terbuka
   - Aktivitas yang Anda nikmati

4. Kelola Waktu dengan Baik
   - Buat to-do list yang realistis
   - Prioritaskan tugas penting
   - Belajar mengatakan "tidak"

5. Cari Dukungan Sosial
   - Bicarakan dengan teman atau keluarga
   - Bergabung dengan komunitas
   - Kunjungi konselor BK jika perlu

Ingat, stres adalah normal, tetapi Anda tidak perlu menghadapinya sendiri!`,
      author: 'Pak Budi',
      date: '12 Nov 2025',
      category: 'Kesehatan Mental',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop',
      likes: 28,
      comments: 12,
      views: 189,
    },
    {
      id: 3,
      title: 'Pilihan Karir Sesuai Bakat dan Minat',
      description: `Memilih karir adalah keputusan penting yang akan mempengaruhi masa depan Anda. Mari kita bahas bagaimana memilih karir yang tepat:

1. Kenali Diri Sendiri
   - Identifikasi kekuatan dan kelemahan
   - Pahami nilai-nilai pribadi Anda
   - Cari tahu apa yang benar-benar Anda sukai

2. Eksplorasi Berbagai Profesi
   - Pelajari berbagai pilihan karir
   - Bicarakan dengan orang-orang di industri
   - Ikuti workshop atau seminar karir

3. Pertimbangkan Faktor-Faktor Penting
   - Prospek pertumbuhan
   - Gaji dan benefit
   - Work-life balance
   - Kepuasan pribadi

4. Ambil Langkah Nyata
   - Ambil kursus atau pelatihan relevan
   - Cari pengalaman magang
   - Bangun portfolio atau skill
   - Networking dengan profesional

5. Konsultasi dengan Konselor BK
   - Kami siap membantu pemetaan karir Anda
   - Diskusikan pilihan dan strategi
   - Dapatkan bimbingan untuk mencapai tujuan

Masa depan ada di tangan Anda. Mulai ambil langkah hari ini!`,
      author: 'Bu Sarah Wijaya',
      date: '10 Nov 2025',
      category: 'Karir',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
      likes: 35,
      comments: 15,
      views: 267,
    },
    {
      id: 4,
      title: 'Membangun Kepercayaan Diri Sejak Dini',
      description: `Kepercayaan diri adalah fondasi kesuksesan dalam berbagai aspek kehidupan. Bagaimana cara membangunnya?

1. Terima Diri Sendiri
   - Hargai kelebihan yang dimiliki
   - Terima kekurangan sebagai bagian dari pembelajaran
   - Jangan membandingkan diri dengan orang lain

2. Tetapkan Tujuan yang Realistis
   - Buat tujuan yang dapat dicapai
   - Rayakan setiap pencapaian kecil
   - Belajar dari kegagalan

3. Kembangkan Keterampilan
   - Ambil kelas atau pelatihan baru
   - Praktikkan skill yang ingin dikuasai
   - Cari mentor atau role model

4. Kelola Percakapan Batin
   - Ganti self-talk negatif dengan positif
   - Afirmasi diri setiap hari
   - Fokus pada apa yang bisa Anda lakukan

5. Bangun Hubungan Positif
   - Kelilingi diri dengan orang-orang positif
   - Minta dukungan dari teman dan keluarga
   - Berbagi pengalaman dengan orang lain

Percaya diri adalah proses yang berkelanjutan. Mulai dari sekarang!`,
      author: 'Ibu Maya Santoso',
      date: '08 Nov 2025',
      category: 'Pengembangan Diri',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop',
      likes: 56,
      comments: 18,
      views: 312,
    },
    {
      id: 5,
      title: 'Mengatasi Bullying di Lingkungan Sekolah',
      description: `Bullying adalah masalah serius yang dapat mempengaruhi kesejahteraan mental siswa. Berikut cara mengatasinya:

1. Kenali Tanda-tanda Bullying
   - Perubahan perilaku atau mood
   - Takut pergi ke sekolah
   - Kehilangan minat pada aktivitas yang disukai
   - Luka atau benda yang hilang tanpa penjelasan

2. Jangan Diam, Laporkan
   - Ceritakan kepada orang tua atau guru
   - Hubungi konselor BK
   - Kumpulkan bukti atau catatan kejadian
   - Beritahu teman yang dipercaya

3. Perlindungan Diri
   - Hindari tempat yang rawan bullying
   - Selalu bersama teman
   - Jangan merespons dengan kekerasan
   - Jaga privasi data pribadi

4. Dukungan Emosional
   - Terima bahwa ini bukan kesalahan Anda
   - Cari dukungan dari teman dan keluarga
   - Lakukan aktivitas yang menyenangkan
   - Kunjungi konselor untuk berbicara

5. Pencegahan Jangka Panjang
   - Ikuti program kesadaran bullying di sekolah
   - Ajarkan empati kepada teman sebaya
   - Bangun budaya saling menghormati
   - Laporkan setiap kasus yang diketahui

Anda tidak sendirian. Kami siap membantu!`,
      author: 'Pak Ahmad Rijanto',
      date: '05 Nov 2025',
      category: 'Sosial',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1516534775068-bb6c2dc8e382?w=500&h=300&fit=crop',
      likes: 73,
      comments: 22,
      views: 456,
    },
    {
      id: 6,
      title: 'Strategi Manajemen Waktu untuk Siswa Sibuk',
      description: `Dengan banyak tanggung jawab, manajemen waktu menjadi kunci. Berikut strategi yang efektif:

1. Analisis Penggunaan Waktu
   - Catat semua aktivitas selama seminggu
   - Identifikasi waktu yang terbuang
   - Lihat pola dan kebiasaan

2. Prioritaskan Tugas
   - Gunakan metode Eisenhower (Urgent vs Important)
   - Kerjakan yang penting dulu
   - Belajar menunda hal yang tidak penting

3. Buat Jadwal yang Realistis
   - Alokasikan waktu dengan fleksibel
   - Tambahkan buffer waktu untuk hal tak terduga
   - Jangan terlalu membebani diri sendiri

4. Gunakan Tools dan Teknik
   - Pomodoro Technique (25 menit fokus, 5 menit istirahat)
   - To-do list atau planner
   - Aplikasi reminder atau calendar
   - Time tracking tools

5. Evaluasi dan Penyesuaian
   - Tinjau sistem Anda setiap minggu
   - Sesuaikan yang tidak bekerja
   - Rayakan kesuksesan kecil
   - Bersabar dengan diri sendiri

Waktu adalah aset terberharga. Gunakan dengan bijak!`,
      author: 'Bu Sarah Wijaya',
      date: '03 Nov 2025',
      category: 'Akademik',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
      likes: 44,
      comments: 11,
      views: 287,
    },
  ];

  // Build categories from the news data
  const categories = [
    { id: 'Akademik', label: 'Akademik', count: allNews.filter(n => n.category === 'Akademik').length },
    { id: 'Kesehatan Mental', label: 'Kesehatan Mental', count: allNews.filter(n => n.category === 'Kesehatan Mental').length },
    { id: 'Sosial', label: 'Sosial', count: allNews.filter(n => n.category === 'Sosial').length },
    { id: 'Pengembangan Diri', label: 'Pengembangan Diri', count: allNews.filter(n => n.category === 'Pengembangan Diri').length },
    { id: 'Karir', label: 'Karir', count: allNews.filter(n => n.category === 'Karir').length },
    { id: 'Pengumuman', label: 'Pengumuman', count: allNews.filter(n => n.category === 'Pengumuman').length },
  ].filter(cat => cat.count > 0); // Only show categories that have news

  // Filter berita berdasarkan kategori
  const filteredNews = useMemo(() => {
    if (!selectedCategory) return allNews;
    return allNews.filter(news => news.category === selectedCategory);
  }, [selectedCategory, allNews]);

  // Get latest news (first item)
  const latestNews = filteredNews.length > 0 ? filteredNews[0] : null;

  // Get top 3 popular news (sorted by views/likes)
  const topPopularNews = filteredNews
    .filter(n => n.id !== latestNews?.id) // Exclude latest from popular
    .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
    .slice(0, 3);

  // Get remaining news (exclude latest and top 3 popular)
  const excludedIds = new Set([
    latestNews?.id,
    ...topPopularNews.map(n => n.id)
  ]);
  const remainingNews = filteredNews.filter(n => !excludedIds.has(n.id));

  const handleNewsClick = (news: NewsItemProps) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filter Kategori */}
        <div className="space-y-3 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700">Filter Kategori</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Semua ({allNews.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Hasil Filter Info */}
        {selectedCategory && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <span className="text-sm text-blue-700">
              Menampilkan {filteredNews.length} berita dalam kategori yang dipilih
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* News Grid */}
        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <>
            {/* Latest + Top 3 Popular Section */}
            {(latestNews || topPopularNews.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Latest News - Large Card (Left) */}
                {latestNews && (
                  <div className="lg:col-span-2">
                    <NewsCard
                      news={latestNews}
                      onViewDetail={handleNewsClick}
                      isLarge={true}
                    />
                  </div>
                )}

                {/* Top 3 Popular News (Right) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Paling Populer
                  </h3>
                  {topPopularNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      onViewDetail={handleNewsClick}
                      isSmall={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Remaining News - All */}
            {remainingNews.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Semua Berita</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      onViewDetail={handleNewsClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No News */}
            {!latestNews && topPopularNews.length === 0 && remainingNews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">Tidak ada berita dalam kategori ini</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        news={selectedNews}
      />
    </>
  );
};

// News Card Component
const NewsCard: React.FC<{
  news: NewsItemProps;
  onViewDetail: (news: NewsItemProps) => void;
  isLarge?: boolean;
  isSmall?: boolean;
}> = ({ news, onViewDetail, isLarge = false, isSmall = false }) => (
  <div
    onClick={() => onViewDetail(news)}
    className={`bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
      isLarge ? '' : isSmall ? 'h-full' : ''
    }`}
  >
    {/* Image */}
    <div className={`bg-gradient-to-br from-purple-500 to-blue-600 overflow-hidden ${
      isLarge ? 'w-full h-64' : isSmall ? 'w-full h-32' : 'w-full h-48'
    }`}>
      {news.image ? (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-center px-4">
          <span className={isLarge ? 'text-xl font-semibold' : isSmall ? 'text-sm font-semibold' : 'text-lg font-semibold'}>{news.title}</span>
        </div>
      )}
    </div>

    {/* Content */}
    <div className={`space-y-3 ${isLarge ? 'p-6' : isSmall ? 'p-3' : 'p-4'}`}>
      {/* Category & Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-block px-2 py-1 bg-purple-100 text-purple-700 font-semibold rounded ${
          isSmall ? 'text-xs' : 'text-xs'
        }`}>
          {news.category}
        </span>
        <span className={`inline-block px-2 py-1 bg-green-100 text-green-700 font-semibold rounded ${
          isSmall ? 'text-xs' : 'text-xs'
        }`}>
          {news.status}
        </span>
      </div>

      {/* Title */}
      <h3 className={`font-bold text-gray-900 hover:text-blue-600 ${
        isLarge ? 'text-2xl line-clamp-3' : isSmall ? 'text-sm line-clamp-2' : 'line-clamp-2'
      }`}>
        {news.title}
      </h3>

      {/* Description Preview - Only for large */}
      {isLarge && (
        <p className="text-gray-600 line-clamp-3">
          {getCleanPreview(news.description, 150)}
        </p>
      )}

      {/* Author & Date */}
      <div className={`flex items-center gap-2 text-gray-500 border-t border-gray-200 pt-2 ${
        isSmall ? 'text-xs' : 'text-xs'
      }`}>
        <div className={`${isSmall ? 'w-5 h-5' : 'w-6 h-6'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-semibold">
            {news.author.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="line-clamp-1">{news.author}</span>
        {!isSmall && (
          <>
            <span>•</span>
            <span>{formatTimeRelative(news.date)}</span>
          </>
        )}
      </div>

      {/* Stats - Only for large */}
      {isLarge && (
        <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
          <button className="flex items-center gap-1 hover:text-pink-600 transition-colors">
            <Heart className="w-4 h-4" />
            <span>{news.likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{news.comments}</span>
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <Eye className="w-4 h-4" />
            <span>{news.views}</span>
          </div>
        </div>
      )}

      {/* Stats - Small version */}
      {isSmall && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Eye className="w-3 h-3" />
          <span>{news.views} views</span>
        </div>
      )}
    </div>
  </div>
);

export default BeritaPage;
