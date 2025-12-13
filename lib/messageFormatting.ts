/**
 * Message formatting utilities
 * Shared between ChatPage and ChatBKPage
 */

/**
 * Format date string to time only (HH:MM format)
 * @param dateString - ISO date string or date
 * @returns Formatted time like "16:24"
 */
export const formatMessageTime = (dateString: string | undefined): string => {
  try {
    if (!dateString) return ''

    // Handle both ISO string and Date object
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString

    if (isNaN(date.getTime())) {
      console.warn('❌ Invalid date received:', dateString)
      return ''
    }

    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    console.error('Error formatting message time:', error, 'dateString:', dateString)
    return ''
  }
}

/**
 * Get human-readable date label
 * @param dateString - ISO date string or date
 * @returns Label like "Hari ini", "Kemarin", "5 hari yang lalu", or "25 Desember"
 */
export const getMessageDateLabel = (dateString: string | undefined): string | null => {
  try {
    if (!dateString) return null

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString

    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('❌ Invalid date for label:', dateString)
      return null
    }

    const now = new Date()

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (messageDate.getTime() === today.getTime()) {
      return 'Hari ini'
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Kemarin'
    } else if ((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24) <= 7) {
      // Less than a week
      const days = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
      return `${days} hari yang lalu`
    } else {
      // Show date in format: 25 Desember
      return messageDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
    }
  } catch (error) {
    console.error('Error formatting date label:', error, 'dateString:', dateString)
    return null
  }
}

/**
 * Determine if date separator should be shown between two messages
 * @param currentMsg - Current message with originalDate property
 * @param prevMsg - Previous message with originalDate property
 * @returns true if date separator should be shown
 */
export const shouldShowDateSeparator = (
  currentMsg: { originalDate?: string },
  prevMsg: { originalDate?: string } | undefined
): boolean => {
  if (!prevMsg) return true

  try {
    // Use originalDate for proper date comparison
    const currLabel = getMessageDateLabel(currentMsg.originalDate)
    const prevLabel = getMessageDateLabel(prevMsg.originalDate)

    return currLabel !== prevLabel && currLabel !== null
  } catch (error) {
    console.error('Error in shouldShowDateSeparator:', error)
    return false
  }
}
