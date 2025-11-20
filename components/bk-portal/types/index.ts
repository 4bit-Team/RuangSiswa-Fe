import { type ReactElement } from 'react';

export interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface HeaderProps {
  title: string;
  subtitle: string;
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
  date: string;
  category: string;
  status: string;
  image?: string;
  likes: number;
  comments: number;
  views: number;
}