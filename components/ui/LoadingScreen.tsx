'use client'

import React from 'react'

interface LoadingScreenProps {
  title?: string
  subtitle?: string
  fullscreen?: boolean
}

export default function LoadingScreen({ 
  title = 'Loading',
  subtitle = 'Memuat halaman',
  fullscreen = true 
}: LoadingScreenProps) {
  return (
    <div className={`${
      fullscreen 
        ? 'fixed inset-0 z-50' 
        : 'relative w-full h-full'
    } bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center`}>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
        }
        
        .ball {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
          animation: bounce 1.4s infinite ease-in-out;
        }
        
        .ball:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .ball:nth-child(2) {
          animation-delay: -0.16s;
        }
      `}</style>
      
      <div className="text-center">
        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>

        {/* Three bouncing balls */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="ball"></div>
          <div className="ball"></div>
          <div className="ball"></div>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>
    </div>
  )
}
