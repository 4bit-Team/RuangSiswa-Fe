import { ReactNode } from 'react'
import { type ReactElement } from 'react';

export interface Feature {
  icon: ReactNode
  title: string
  description: string
}

export interface UserRole {
  role: string
  color: string
  description: string
}

export interface Stat {
  number: string
  label: string
}

export interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface HeaderProps {
  title: string;
  subtitle: string;
  profile?: any;
}

export interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

export interface UpdateCardProps {
  avatar: string;
  name: string;
  time: string;
  message: string;
  likes: number;
  comments: number;
}

export interface SessionItemProps {
  icon: React.ElementType;
  title: string;
  counselor: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
}

export interface CounselingCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  duration: string;
  color: string;
  badge?: string;
}

export interface CategoryCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  articles: string;
  color: string;
}

export interface QuestionItemProps {
  question: string;
  category: string;
  answers: string;
}

export interface ChatListItemProps {
  initial: string;
  name: string;
  role: string;
  message: string;
  time: string;
  active: boolean;
  unread: number;
  online: boolean;
}

export interface ChatBubbleProps {
  message: string;
  time: string;
  sender: 'user' | 'counselor';
}

export interface ReservationItemProps {
  icon: React.ElementType;
  type: string;
  tag: string;
  tagColor: string;
  counselor: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
}

export interface CounselorCardProps {
  initial: string;
  name: string;
  status: string;
  statusColor: string;
  specialty: string;
}

export interface HistoryItemProps {
  title: string;
  counselor: string;
  date: string;
  status: string;
  statusColor: string;
}

export interface SettingItemProps {
  icon: React.ElementType;
  label: string;
}

export interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export interface ReservasiPageProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export interface NewsItemProps {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string | Date; // Support both string and Date
  category: string;
  categories?: string[]; // Full categories array
  status: string;
  image?: string;
  likes: number;
  comments: number;
  views: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface NewsDetailProps {
  id: number;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  categories: string[];
  status: 'draft' | 'published' | 'scheduled';
  viewCount: number;
  author: {
    id: number;
    fullName: string;
    email: string;
  };
  authorId: number;
  publishedDate?: Date;
  scheduledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  likes: NewsLike[];
  comments: NewsCommentProps[];
}

export interface NewsLike {
  id: number;
  userId: number;
  newsId: number;
  createdAt: Date;
}

export interface NewsCommentProps {
  id: number;
  content: string;
  author: {
    id: number;
    fullName: string;
    email: string;
  };
  authorId: number;
  newsId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: number
  name: string
  nisn: string
  class: string
  status: 'Active' | 'Need Attention'
  issue: string
  sessions: string
  lastDate: string
  initial: string
  bgColor: string
}

export interface Report {
  id: number
  title: string
  type: 'Konseling' | 'Progress' | 'Insiden' | 'Evaluasi'
  category: string
  status: 'Selesai' | 'Pending' | 'Draft'
  class: string
  date: string
  initial: string
  bgColor: string
}

export interface Article {
  id: number
  title: string
  category: string
  status: 'Published' | 'Draft'
  views: number
  author: string
  date: string
  excerpt: string
}

export interface Schedule {
  time: string
  student: string
  class: string
  topic: string
  room: string
  duration: string
  status: 'Selesai' | 'Terjadwal'
  initial: string
  bgColor: string
}

// Laporan BK Interfaces
export interface LaporanBk {
  id: number;
  namaKonseling: string;
  jurusanId?: number;
  kelasId?: number;
  tanggalDiprosesAiBk: string;
  deskripsiKasusMasalah: string;
  bentukPenanganganSebelumnya?: string;
  riwayatSpDanKasus?: string;
  layananBk?: string;
  followUpTindakanBk?: string;
  penahanganGuruBkKonselingProsesPembinaan?: string;
  pertemuanKe1?: string;
  pertemuanKe2?: string;
  pertemuanKe3?: string;
  hasilPemantauanKeterangan?: string;
  guruBkYangMenanganiId?: number;
  statusPerkembanganPesertaDidik?: string;
  keteranganKetersedianDokumen?: string;
  jurusan?: { id: number; nama: string };
  kelas?: { id: number; nama: string };
  guruBkYangMenanganis?: { id: number; nama: string };
  createdAt: string;
  updatedAt: string;
}

export interface LaporanBkFormData {
  namaKonseling: string;
  jurusanId?: number;
  kelasId?: number;
  tanggalDiprosesAiBk: string;
  deskripsiKasusMasalah: string;
  bentukPenanganganSebelumnya?: string;
  riwayatSpDanKasus?: string;
  layananBk?: string;
  followUpTindakanBk?: string;
  penahanganGuruBkKonselingProsesPembinaan?: string;
  pertemuanKe1?: string;
  pertemuanKe2?: string;
  pertemuanKe3?: string;
  hasilPemantauanKeterangan?: string;
  guruBkYangMenanganiId?: number;
  statusPerkembanganPesertaDidik?: string;
  keteranganKetersedianDokumen?: string;
}
