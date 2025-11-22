'use client'

import React, { useState } from 'react';
import {
  ChevronRight,
  Search,
  Heart,
  MessageCircle,
  Calendar,
  Users,
  BookOpen,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';
import { CategoryCardProps, QuestionItemProps } from '@types';
import { AskQuestionModal } from '../modals';


const CategoryCard: React.FC<CategoryCardProps & { gradient?: string; onOpen?: () => void }> = ({ icon: Icon, title, description, articles, gradient, onOpen }) => {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex items-start gap-4"
      >
        <div className={`w-14 h-14 ${gradient ?? 'bg-gray-200'} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <span className="text-xs text-gray-500">{articles} artikel</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300" />
      </button>
      {onOpen && <AskQuestionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}
    </>
  );
};

const CategoryCardWithModal: React.FC<CategoryCardProps & { gradient?: string; setActivePage?: (page: string) => void }> = ({ icon: Icon, title, description, articles, gradient, color, setActivePage }) => {
  const handleCardClick = () => {
    const topicMap: { [key: string]: string } = {
      'Masalah Pribadi': 'personal',
      'Akademik & Belajar': 'academic',
      'Sosial & Pertemanan': 'social',
      'Pengembangan Diri': 'development',
    };
    
    const topicSlug = topicMap[title] || title.toLowerCase().replace(/\s+/g, '-');
    if (setActivePage) {
      // Use a special format that portal will recognize and parse
      setActivePage(`berita-${topicSlug}`);
    }
  };
  
  return (
    <button
      onClick={handleCardClick}
      className="w-full bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex items-start gap-4"
    >
      <div className={`w-14 h-14 ${gradient ?? 'bg-gray-200'} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <span className="text-xs text-gray-500">{articles} artikel</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300" />
    </button>
  );
};

const QuestionItem: React.FC<QuestionItemProps> = ({ question, category, answers }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sample answers dari user lain
  const userAnswers = [
    {
      id: 1,
      author: 'Siswa A',
      avatar: 'SA',
      date: '2 hari lalu',
      content: 'Saya sering melakukan latihan soal berulang kali. Mulai dari soal yang mudah dulu, baru naik ke soal yang lebih sulit. Ini membantu saya memahami pola soal.',
      likes: 23,
      isHelpful: false,
    },
    {
      id: 2,
      author: 'Siswa B',
      avatar: 'SB',
      date: '1 hari lalu',
      content: 'Teknik pernapasan dalam membantu saya. Sebelum ujian, saya tarik napas panjang selama 4 detik, tahan 7 detik, dan hembuskan selama 8 detik. Ini membuat tubuh lebih rileks.',
      likes: 18,
      isHelpful: false,
    },
    {
      id: 3,
      author: 'Guru Pembimbing',
      avatar: 'GP',
      date: '3 jam lalu',
      content: 'Visualisasi positif sangat membantu. Bayangkan diri Anda berhasil mengerjakan soal dengan lancar. Percaya diri adalah kunci utama dalam menghadapi ujian.',
      likes: 45,
      isHelpful: false,
    },
  ];

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full group hover:bg-gray-50 p-4 cursor-pointer text-left transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded">{category}</span>
              <span className="text-sm text-gray-500">{answers} jawaban</span>
            </div>
            <h4 className="font-medium text-gray-900">{question}</h4>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-transform duration-300 flex-shrink-0 ml-2 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Answers */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-50 space-y-4">
          <div className="space-y-3">
            {userAnswers.map((answer) => (
              <div key={answer.id} className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Author Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {answer.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{answer.author}</p>
                      <p className="text-xs text-gray-500">{answer.date}</p>
                    </div>
                  </div>
                  {answer.author === 'Guru Pembimbing' && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      Terverifikasi
                    </span>
                  )}
                </div>

                {/* Answer Content */}
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{answer.content}</p>

                {/* Answer Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-pink-600 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>{answer.likes}</span>
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors font-medium">
                    Membantu
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Answer Button */}
          <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
            + Tambah Jawaban
          </button>
        </div>
      )}
    </div>
  );
};

const KonsultasiPage: React.FC<{ setActivePage?: (page: string) => void }> = ({ setActivePage }) => {
  return (
    <div className="p-8 space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Cari artikel atau ajukan pertanyaan..."
          className="w-full px-12 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl overflow-hidden relative">
            <AskQuestionSection />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori Topik</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CategoryCardWithModal
                icon={Heart}
                title="Masalah Pribadi"
                description="Stres, kecemasan, konflik dengan teman, masalah keluarga"
                articles="12"
                gradient="bg-gradient-to-r from-pink-500 to-pink-400"
                color="bg-pink-500"
                setActivePage={setActivePage}
              />
              <CategoryCardWithModal
                icon={BookOpen}
                title="Akademik & Belajar"
                description="Kesulitan belajar, motivasi, manajemen waktu, persiapan ujian"
                articles="18"
                gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
                color="bg-cyan-500"
                setActivePage={setActivePage}
              />
              <CategoryCardWithModal
                icon={Users}
                title="Sosial & Pertemanan"
                description="Komunikasi, membangun hubungan, bullying, peer pressure"
                articles="15"
                gradient="bg-gradient-to-r from-emerald-400 to-green-500"
                color="bg-emerald-400"
                setActivePage={setActivePage}
              />
              <CategoryCardWithModal
                icon={Lightbulb}
                title="Pengembangan Diri"
                description="Kepercayaan diri, minat & bakat, tujuan hidup, kreativitas"
                articles="10"
                gradient="bg-gradient-to-r from-violet-400 to-purple-500"
                color="bg-violet-400"
                setActivePage={setActivePage}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pertanyaan Populer</h3>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <QuestionItem
                question="Bagaimana cara mengatasi rasa cemas saat menghadapi ujian?"
                category="Akademik"
                answers="8"
              />
              <QuestionItem
                question="Tips untuk meningkatkan kepercayaan diri"
                category="Pengembangan Diri"
                answers="12"
              />
              <QuestionItem
                question="Apa yang harus dilakukan jika mengalami konflik dengan teman?"
                category="Sosial"
                answers="6"
              />
              <QuestionItem
                question="Cara mengelola waktu antara belajar dan kegiatan lain"
                category="Akademik"
                answers="10"
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Tidak Menemukan Jawaban?</h4>
                <p className="text-sm text-gray-600 mt-1">Jika pertanyaan Anda belum terjawab, Anda dapat langsung chat dengan konselor kami atau membuat reservasi untuk konseling tatap muka.</p>
                <div className="mt-4 flex gap-3">
                  <button className="px-3 py-2 rounded-md border border-green-200 text-green-700 bg-white hover:bg-green-50 transition-colors duration-200">Chat dengan BK</button>
                  <button className="px-3 py-2 rounded-md border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors duration-200">Buat Reservasi</button>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-medium text-gray-700">Butuh bantuan?</h5>
            <p className="text-xs text-gray-500 mt-1">Hubungi konselor kami kapan saja</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const AskQuestionSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 text-white p-8 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Punya Pertanyaan?</h2>
          <p className="text-sm opacity-90 mb-4">Konsultasikan masalah Anda dengan tim BK kami. Kami siap membantu!</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Ajukan Pertanyaan
          </button>
        </div>
        <div className="hidden md:block opacity-80">
          <MessageCircle className="w-24 h-24 text-white/40" />
        </div>
      </div>
      <AskQuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default KonsultasiPage;