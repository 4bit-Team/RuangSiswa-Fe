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
