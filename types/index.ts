import { ReactNode } from 'react'

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