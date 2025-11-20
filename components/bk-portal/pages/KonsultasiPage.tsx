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
} from 'lucide-react';
import { CategoryCardProps, QuestionItemProps } from '@types';
import { AskQuestionModal } from '../modals';


const CategoryCard: React.FC<CategoryCardProps & { gradient?: string; onOpen?: () => void }> = ({ icon: Icon, title, description, articles, gradient, onOpen }) => (
  <button 
    onClick={onOpen}
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
);

const CategoryCardWithModal: React.FC<CategoryCardProps & { gradient?: string }> = ({ icon: Icon, title, description, articles, gradient, color }) => {
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <>
      <CategoryCard 
        icon={Icon}
        title={title}
        description={description}
        articles={articles}
        gradient={gradient}
        color={color}
        onOpen={() => setModalOpen(true)}
      />
      <AskQuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

const QuestionItem: React.FC<QuestionItemProps> = ({ question, category, answers }) => (
  <div className="group hover:bg-gray-50 p-4 rounded-tl-lg rounded-tr-lg cursor-pointer">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded">{category}</span>
          <span className="text-sm text-gray-500">{answers} jawaban</span>
        </div>
        <h4 className="font-medium text-gray-900">{question}</h4>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
    </div>
  </div>
);

const KonsultasiPage: React.FC = () => {
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
            <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 text-white p-8 rounded-xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Punya Pertanyaan?</h2>
                <p className="text-sm opacity-90 mb-4">Konsultasikan masalah Anda dengan tim BK kami. Kami siap membantu!</p>
              </div>
              <div className="hidden md:block opacity-80">
                <MessageCircle className="w-24 h-24 text-white/40" />
              </div>
            </div>
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
              />
              <CategoryCardWithModal
                icon={BookOpen}
                title="Akademik & Belajar"
                description="Kesulitan belajar, motivasi, manajemen waktu, persiapan ujian"
                articles="18"
                gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
                color="bg-cyan-500"
              />
              <CategoryCardWithModal
                icon={Users}
                title="Sosial & Pertemanan"
                description="Komunikasi, membangun hubungan, bullying, peer pressure"
                articles="15"
                gradient="bg-gradient-to-r from-emerald-400 to-green-500"
                color="bg-emerald-400"
              />
              <CategoryCardWithModal
                icon={Lightbulb}
                title="Pengembangan Diri"
                description="Kepercayaan diri, minat & bakat, tujuan hidup, kreativitas"
                articles="10"
                gradient="bg-gradient-to-r from-violet-400 to-purple-500"
                color="bg-violet-400"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pertanyaan Populer</h3>
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-200">
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

export default KonsultasiPage;