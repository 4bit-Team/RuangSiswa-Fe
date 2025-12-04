'use client'

import React, { Suspense } from 'react'
import BeritaPage from '@/components/portal-siswa/pages/BeritaPage'

const BeritaPageWrapper: React.FC<{ searchParams?: Promise<{ topic?: string }> }> = ({ searchParams }) => {
  const [topic, setTopic] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (searchParams) {
      searchParams.then((params) => {
        setTopic(params?.topic ?? null)
      })
    }
  }, [searchParams])

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <BeritaPage selectedTopic={topic} />
      </div>
    </div>
  )
}

export default BeritaPageWrapper
