'use client'

import React from 'react';
import { ChevronRight, Search, Heart, MessageCircle, Calendar, Users } from 'lucide-react';
import { CategoryCardProps, QuestionItemProps } from '../types';


const CategoryCard: React.FC<CategoryCardProps> = ({ icon: Icon, title, description, articles, color }) => (
  <button className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg transition-shadow">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <span className="text-xs text-gray-500">{articles} artikel</span>
  </button>
);

const QuestionItem: React.FC<QuestionItemProps> = ({ question, category, answers }) => (
  <div className="group hover:bg-gray-50 p-4 rounded-lg cursor-pointer">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium text-gray-900 mb-1">{question}</h4>
        <p className="text-sm text-gray-500">{category} • {answers} jawaban</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
    </div>
  </div>
);

const KonsultasiPage: React.FC = () => (
  <div className="p-8 space-y-6">
    <div className="relative">
      <input
        type="text"
        placeholder="Cari artikel atau ajukan pertanyaan..."
        className="w-full px-12 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>

    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Kategori</h3>
      <div className="grid grid-cols-4 gap-4">
        <CategoryCard
          icon={Heart}
          title="Kesehatan Mental"
          description="Tips menjaga kesehatan mental selama masa sekolah"
          articles="12"
          color="bg-pink-500"
        />
        <CategoryCard
          icon={MessageCircle}
          title="Komunikasi"
          description="Panduan berkomunikasi efektif dengan teman dan guru"
          articles="15"
          color="bg-blue-500"
        />
        <CategoryCard
          icon={Calendar}
          title="Manajemen Waktu"
          description="Strategi mengatur waktu belajar dan aktivitas"
          articles="10"
          color="bg-green-500"
        />
        <CategoryCard
          icon={Users}
          title="Hubungan Sosial"
          description="Tips menjalin dan menjaga hubungan pertemanan"
          articles="8"
          color="bg-purple-500"
        />
      </div>
    </div>

    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Pertanyaan Terbaru</h3>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-200">
        <QuestionItem
          question="Bagaimana cara mengatasi kecemasan saat akan ujian?"
          category="Kesehatan Mental"
          answers="8"
        />
        <QuestionItem
          question="Tips belajar efektif untuk pelajaran yang sulit?"
          category="Akademik"
          answers="12"
        />
        <QuestionItem
          question="Bagaimana cara meningkatkan konsentrasi saat belajar?"
          category="Manajemen Waktu"
          answers="6"
        />
      </div>
    </div>
  </div>
);

export default KonsultasiPage;