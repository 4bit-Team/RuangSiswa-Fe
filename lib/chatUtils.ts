/**
 * Chat Utility Functions
 * Centralized utilities for emoji, recording, voice messages, and avatar colors
 */

import { API_URL } from './api'

/**
 * Handle emoji selection - append to message input
 */
export const handleEmojiClick = (
  emoji: string,
  messageInput: string,
  setMessageInput: (value: string) => void,
  setShowEmojiPicker: (value: boolean) => void
) => {
  setMessageInput(messageInput + emoji)
  setShowEmojiPicker(false)
}

/**
 * Start recording audio from microphone
 */
export const startRecording = async (
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  recordingIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
  setIsRecording: (value: boolean) => void,
  setRecordingTime: (value: number | ((prev: number) => number)) => void,
  setRecordedChunks: (chunks: Blob[]) => void
) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      chunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      setRecordedChunks([blob])
      stream.getTracks().forEach((track: any) => track.stop())
    }

    mediaRecorder.start()
    mediaRecorderRef.current = mediaRecorder
    setIsRecording(true)
    setRecordingTime(0)

    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev: number) => prev + 1)
    }, 1000)
  } catch (error) {
    console.error('Error accessing microphone:', error)
    alert('Tidak dapat mengakses microphone')
  }
}

/**
 * Stop recording audio
 */
export const stopRecording = (
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  recordingIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
  setIsRecording: (value: boolean) => void
) => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop()
    setIsRecording(false)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }
}

/**
 * Send voice message to server
 */
export const sendVoiceMessage = async (
  recordedChunks: Blob[],
  recordingTime: number,
  activeCounselorId: number | null,
  token: string,
  setSendingMessage: (value: boolean) => void,
  setRecordedChunks: (chunks: Blob[]) => void,
  setRecordingTime: (value: number) => void
) => {
  if (recordedChunks.length === 0) return

  try {
    setSendingMessage(true)
    const formData = new FormData()
    formData.append('file', recordedChunks[0])
    formData.append('conversationId', activeCounselorId?.toString() || '')
    formData.append('messageType', 'voice')
    formData.append('duration', recordingTime.toString())

    const response = await fetch(`${API_URL}/chat/messages/send-voice`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (response.ok) {
      setRecordedChunks([])
      setRecordingTime(0)
      console.log('✅ Voice message sent successfully')
    } else {
      const errorData = await response.json()
      console.error('❌ Voice message send error:', errorData)
      alert(`Error sending voice message: ${errorData.message || response.statusText}`)
    }
  } catch (error) {
    console.error('Error sending voice message:', error)
    alert('Gagal mengirim pesan suara')
  } finally {
    setSendingMessage(false)
  }
}

/**
 * Cancel recording and cleanup
 */
export const cancelRecording = (
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  recordingIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
  setIsRecording: (value: boolean) => void,
  setRecordedChunks: (chunks: Blob[]) => void,
  setRecordingTime: (value: number) => void
) => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop()
  }
  setIsRecording(false)
  setRecordedChunks([])
  setRecordingTime(0)
  if (recordingIntervalRef.current) {
    clearInterval(recordingIntervalRef.current)
  }
}

/**
 * Get background color gradient for user initial avatar
 */
export const getInitialBgColor = (initial: string): string => {
  const colors: Record<string, string> = {
    S: 'bg-gradient-to-br from-blue-500 to-purple-600',
    B: 'bg-gradient-to-br from-purple-500 to-purple-600',
    R: 'bg-gradient-to-br from-green-500 to-green-600',
    A: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    C: 'bg-gradient-to-br from-rose-500 to-rose-600',
  }
  return colors[initial] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

/**
 * Format recording time to MM:SS format
 */
export const formatRecordingTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format call duration to MM:SS format
 */
export const formatCallDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format time difference to human-readable format (relative time)
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'Baru saja'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInHours < 24) return `${diffInHours}h`
  if (diffInDays === 1) return 'Kemarin'
  if (diffInDays < 7) return `${diffInDays}d`
  
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
}

/**
 * Emoji list for emoji picker
 */
export const emojis = ['😀', '😂', '😍', '🥰', '😘', '😭', '😤', '😡', '🤔', '😎', '👍', '👏', '🎉', '❤️', '💯', '🔥', '✨', '🌟', '⭐', '💪']

/**
 * Fetch emojis from API (dynamic emoji library)
 */
export const fetchEmojisFromAPI = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/emojis?active=true`)
    if (!response.ok) throw new Error('Failed to fetch emojis')
    const data = await response.json()
    // Extract emoji characters from response
    return data.map((emoji: any) => emoji.emoji).filter((e: string) => e)
  } catch (error) {
    console.error('Error fetching emojis from API:', error)
    // Fallback to default emojis
    return emojis
  }
}

/**
 * Get emoji categories from API
 */
export const fetchEmojiCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/emojis/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  } catch (error) {
    console.error('Error fetching emoji categories:', error)
    return []
  }
}
