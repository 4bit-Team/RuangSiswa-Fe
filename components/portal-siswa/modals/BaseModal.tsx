'use client'

import React from 'react'
import { X } from 'lucide-react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  width?: string
  icon?: React.ReactNode
  headerGradient?: string
  showCloseButton?: boolean
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-lg',
  icon,
  headerGradient = 'bg-gradient-to-r from-blue-500 to-purple-600',
  showCloseButton = true,
}) => {
  if (!isOpen) return null

  React.useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      {/* Backdrop with fade animation */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal with slide-up animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-white rounded-2xl shadow-2xl ${width} max-h-[90vh] overflow-y-auto pointer-events-auto transform transition-all duration-300 ease-out animate-in zoom-in-95 slide-in-from-bottom-4`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className={`${headerGradient} text-white p-6 flex items-start justify-between rounded-t-2xl`}>
            <div className="flex items-start gap-3 flex-1">
              {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  )
}

export default BaseModal
