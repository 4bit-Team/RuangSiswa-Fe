'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, AlertCircle, MoreVertical, Settings } from 'lucide-react'

interface CallUIProps {
  callId: number
  callType: 'audio' | 'video'
  remoteUserName: string
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteAudioRef?: React.RefObject<HTMLAudioElement | null>
  onHangup: () => void
  isConnected: boolean
  callDuration?: number
  hasRemoteStream?: boolean
  localStream?: MediaStream | null
  remoteStream?: MediaStream | null
  isRemoteMuted?: boolean
  isRemoteVideoOff?: boolean
}

const CallUI: React.FC<CallUIProps> = ({
  callId,
  callType,
  remoteUserName,
  localVideoRef,
  remoteVideoRef,
  remoteAudioRef,
  onHangup,
  isConnected,
  callDuration = 0,
  hasRemoteStream = false,
  localStream,
  remoteStream,
  isRemoteMuted = false,
  isRemoteVideoOff = false,
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video')
  const [displayDuration, setDisplayDuration] = useState('00:00')
  const [hasLocalStream, setHasLocalStream] = useState(false)
  const [hasRemote, setHasRemote] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isMirrored, setIsMirrored] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([])
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('')
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('')
  const [isClosing, setIsClosing] = useState(false)
  const connectionTimeRef = useRef<number | null>(null)
  const settingsModalRef = useRef<HTMLDivElement>(null)

  // Load available devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'))
        setAudioInputDevices(devices.filter(d => d.kind === 'audioinput'))
        setAudioOutputDevices(devices.filter(d => d.kind === 'audiooutput'))
      } catch (error) {
        console.error('Error loading devices:', error)
      }
    }
    loadDevices()
  }, [])

  // Handle click outside settings modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])

  // Attach local stream
  useEffect(() => {
    if (!localStream) {
      console.log('🔄 [CallUI] No local stream yet')
      return
    }

    // ✅ CRITICAL: Validate stream has tracks BEFORE attaching
    const allTracks = localStream.getTracks()
    const videoTracks = localStream.getVideoTracks()
    const audioTracks = localStream.getAudioTracks()
    
    console.log(`📊 [CallUI Local] Stream validation:`, {
      totalTracks: allTracks.length,
      videoTracks: videoTracks.length,
      audioTracks: audioTracks.length,
      callType
    })

    if (allTracks.length === 0) {
      console.error('❌ [CallUI] CRITICAL: Local stream is EMPTY! No tracks at all!')
      return
    }

    // ✅ For video calls, must have video track
    if (callType === 'video' && videoTracks.length === 0) {
      console.error('❌ [CallUI] CRITICAL: Video call but stream has NO VIDEO TRACKS!')
      console.error('   This will show blank local video in PIP')
      return
    }

    // Enable all tracks
    allTracks.forEach((track: any) => {
      if (track.readyState === 'live') {
        track.enabled = true
        console.log(`🔄 [CallUI LocalStream] Track ${track.kind} enabled (state: ${track.readyState})`)
      } else {
        console.warn(`⚠️ [CallUI LocalStream] Track ${track.kind} NOT LIVE (state: ${track.readyState})`)
      }
    })

    let retryCount = 0
    const maxRetries = 5

    const attemptAttach = () => {
      if (localVideoRef.current && localStream) {
        try {
          console.log(`📹 [CallUI] Attaching local stream to video element...`)
          localVideoRef.current.srcObject = localStream
          console.log('✅ Local stream attached to video element')
          setHasLocalStream(true)
          return true
        } catch (error) {
          console.error('❌ Error attaching local stream:', error)
          return false
        }
      }
      console.warn('⚠️ [CallUI] localVideoRef.current not ready yet')
      return false
    }

    if (attemptAttach()) return

    let timeout: ReturnType<typeof setTimeout>
    const retryWithBackoff = () => {
      retryCount++
      if (retryCount >= maxRetries) {
        console.error('❌ Failed to attach local stream after max retries')
        return
      }
      timeout = setTimeout(() => {
        if (!attemptAttach()) {
          retryWithBackoff()
        }
      }, 100 * Math.pow(1.5, retryCount))
    }

    retryWithBackoff()
    return () => clearTimeout(timeout)
  }, [localStream])

  // Attach remote stream
  useEffect(() => {
    if (!remoteStream) {
      console.log('🔄 [CallUI] No remote stream yet')
      return
    }

    // ✅ CRITICAL: Validate remote stream has correct tracks BEFORE attaching
    const allRemoteTracks = remoteStream.getTracks()
    const remoteVideoTracks = remoteStream.getVideoTracks()
    const remoteAudioTracks = remoteStream.getAudioTracks()

    console.log(`📊 [CallUI Remote] Stream validation:`, {
      totalTracks: allRemoteTracks.length,
      videoTracks: remoteVideoTracks.length,
      audioTracks: remoteAudioTracks.length,
      callType
    })

    if (allRemoteTracks.length === 0) {
      console.error('❌ [CallUI] CRITICAL: Remote stream is EMPTY! No tracks at all!')
      return
    }

    let retryCount = 0
    const maxRetries = 5

    const attemptVideoAttach = () => {
      if (callType === 'video') {
        // ✅ For video calls, validate video track exists
        if (remoteVideoTracks.length === 0) {
          console.error('❌ [CallUI] Video call but remote stream has NO VIDEO TRACKS!')
          return false
        }

        if (remoteVideoRef.current && remoteStream) {
          try {
            console.log(`📹 [CallUI] Attaching remote stream to video element...`)
            const videoElement = remoteVideoRef.current as HTMLVideoElement
            videoElement.srcObject = remoteStream
            videoElement.volume = 1.0
            
            const playPromise = videoElement.play()
            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log('📹 [CallUI Video] Playback started')
              }).catch((error) => {
                console.error('❌ [CallUI Video] Playback failed:', error)
              })
            }
            console.log('✅ [CallUI Video] Remote stream attached')
            setHasRemote(true)
            return true
          } catch (error) {
            console.error('❌ [CallUI Video] Error:', error)
            return false
          }
        }
      } else if (callType === 'audio') {
        // ✅ For audio calls, use audio element instead
        if (remoteAudioTracks.length === 0) {
          console.error('❌ [CallUI] Audio call but remote stream has NO AUDIO TRACKS!')
          return false
        }

        if (remoteAudioRef?.current && remoteStream) {
          try {
            console.log(`🔊 [CallUI] Attaching remote stream to audio element...`)
            const audioElement = remoteAudioRef.current as HTMLAudioElement
            audioElement.srcObject = remoteStream
            audioElement.volume = 1.0
            
            const playPromise = audioElement.play()
            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log('🔊 [CallUI Audio] Playback started')
              }).catch((error) => {
                console.error('❌ [CallUI Audio] Playback failed:', error)
              })
            }
            console.log('✅ [CallUI Audio] Remote audio attached')
            setHasRemote(true)
            return true
          } catch (error) {
            console.error('❌ [CallUI Audio] Error:', error)
            return false
          }
        }
      }
      return false
    }

    if (attemptVideoAttach()) return

    let timeout: ReturnType<typeof setTimeout>
    const retryWithBackoff = () => {
      retryCount++
      if (retryCount >= maxRetries) {
        console.error(`❌ [CallUI] Failed after ${maxRetries} retries to attach remote stream`)
        return
      }
      const delay = 100 * Math.pow(1.5, retryCount)
      timeout = setTimeout(() => {
        if (!attemptVideoAttach()) {
          retryWithBackoff()
        }
      }, delay)
    }

    retryWithBackoff()
    return () => clearTimeout(timeout)
  }, [remoteStream, callType, remoteAudioRef, remoteVideoRef])

  // Monitor playback
  useEffect(() => {
    if (!localVideoRef.current) return

    const onLoadedMetadata = () => setHasLocalStream(true)
    const onPlay = () => setHasLocalStream(true)

    const videoElement = localVideoRef.current
    videoElement.addEventListener('loadedmetadata', onLoadedMetadata)
    videoElement.addEventListener('play', onPlay)

    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
      videoElement.removeEventListener('play', onPlay)
    }
  }, [])

  // Monitor remote playback
  useEffect(() => {
    if (!remoteVideoRef.current) return

    const element = remoteVideoRef.current
    const onLoadedMetadata = () => setHasRemote(true)
    const onPlay = () => setHasRemote(true)
    const onCanPlay = () => setHasRemote(true)

    element.addEventListener('loadedmetadata', onLoadedMetadata)
    element.addEventListener('play', onPlay)
    element.addEventListener('canplay', onCanPlay)

    return () => {
      element.removeEventListener('loadedmetadata', onLoadedMetadata)
      element.removeEventListener('play', onPlay)
      element.removeEventListener('canplay', onCanPlay)
    }
  }, [callType])

  // Monitor remote tracks
  useEffect(() => {
    if (!remoteStream) return

    const interval = setInterval(() => {
      const audioTracks = remoteStream.getAudioTracks()
      const videoTracks = remoteStream.getVideoTracks()

      audioTracks.forEach((track) => {
        // ✅ Only re-enable if track is live but disabled
        if (!track.enabled && track.readyState === 'live') {
          console.log(`🔊 [CallUI Monitor] Audio track re-enabling (was disabled)`)
          track.enabled = true
        } else if (track.readyState !== 'live') {
          console.warn(`⚠️ [CallUI Monitor] Audio track STATE: ${track.readyState} (cannot enable)`)
        }
      })

      videoTracks.forEach((track) => {
        if (!track.enabled && track.readyState === 'live') {
          console.log(`📹 [CallUI Monitor] Video track re-enabling (was disabled)`)
          track.enabled = true
        } else if (track.readyState !== 'live') {
          console.warn(`⚠️ [CallUI Monitor] Video track STATE: ${track.readyState} (cannot enable)`)
        }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [remoteStream])

  // Monitor local tracks
  useEffect(() => {
    if (!localStream) return

    const interval = setInterval(() => {
      const audioTracks = localStream.getAudioTracks()
      const videoTracks = localStream.getVideoTracks()

      audioTracks.forEach((track) => {
        // ✅ Enforce mute state
        if (isMuted && track.enabled) {
          console.log(`🔊 [Local Monitor] Audio DISABLING (muted by user)`)
          track.enabled = false
        } else if (!isMuted && !track.enabled && track.readyState === 'live') {
          console.log(`🔊 [Local Monitor] Audio ENABLING (user unmuted)`)
          track.enabled = true
        }

        // ⚠️ Warn if track dies
        if (track.readyState !== 'live') {
          console.warn(`⚠️ [Local Monitor] Audio track STATE: ${track.readyState}`)
        }
      })

      videoTracks.forEach((track) => {
        // ✅ Enforce video state
        if (!isVideoOn && track.enabled) {
          console.log(`📹 [Local Monitor] Video DISABLING (off by user)`)
          track.enabled = false
        } else if (isVideoOn && !track.enabled && track.readyState === 'live') {
          console.log(`📹 [Local Monitor] Video ENABLING (user turned on)`)
          track.enabled = true
        }

        // ⚠️ Warn if track dies
        if (track.readyState !== 'live') {
          console.warn(`⚠️ [Local Monitor] Video track STATE: ${track.readyState}`)
        }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [localStream, isMuted, isVideoOn])

  // Timer
  useEffect(() => {
    if (!isConnected) return

    if (!connectionTimeRef.current) {
      connectionTimeRef.current = Date.now()
      console.log('📱 [CallUI] Connection established, timer started')
    }

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - (connectionTimeRef.current || Date.now())
      const totalSeconds = Math.floor(elapsedMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      setDisplayDuration(formattedDuration)

      if (totalSeconds % 10 === 0 && totalSeconds > 0) {
        console.log(`⏱️ [CallUI] Duration: ${formattedDuration}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !newMutedState
      })
    }
  }

  const toggleVideo = () => {
    if (callType === 'audio') return
    const newVideoState = !isVideoOn
    setIsVideoOn(newVideoState)
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = newVideoState
      })
    }
  }

  const handleHangup = () => {
    setIsClosing(true)
    // Wait for fade out animation to complete (500ms) then call onHangup
    setTimeout(() => {
      onHangup()
    }, 500)
  }

  // Prevent page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConnected) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isConnected])

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col transition-opacity duration-500 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Video Call UI */}
      {callType === 'video' ? (
        <div className="flex-1 relative bg-black overflow-hidden">
          {/* Remote Video - when camera is on */}
          {!isRemoteVideoOff && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="absolute inset-0 w-full h-full object-cover bg-black"
              crossOrigin="anonymous"
              style={{ display: 'block' }}
            />
          )}

          {/* Camera off state - show name and timer */}
          {isRemoteVideoOff && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <div className="text-center animate-fade-in">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                  <VideoOff className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">{remoteUserName}</h2>
                <p className="text-gray-400 text-lg mb-6">Kamera Dimatikan</p>
                <p className="text-5xl font-mono text-cyan-400 font-bold">{displayDuration}</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {!hasRemote && !isRemoteVideoOff && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-500"></div>
                </div>
                <p className="text-white font-semibold text-lg">Menghubungkan...</p>
                <p className="text-gray-400 text-sm mt-2">{remoteUserName}</p>
              </div>
            </div>
          )}

          {/* Mute indicator */}
          {isRemoteMuted && (
            <div className="absolute top-20 right-6 bg-red-600/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm animate-pulse">
              <MicOff className="w-4 h-4" />
              <span className="text-sm font-semibold">Lawan Mute</span>
            </div>
          )}

          {/* Local Video PIP */}
          <div className="absolute bottom-28 right-6 w-48 h-36 md:w-56 md:h-40 bg-gray-900 rounded-lg overflow-hidden border-4 border-white shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                localStream && isVideoOn ? 'block' : 'hidden'
              }`}
              style={{
                transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
              }}
            />
            {!(localStream && isVideoOn) && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
                <Video className="w-6 h-6 text-gray-600 mb-2" />
                <p className="text-gray-400 text-xs text-center">
                  {!isVideoOn ? 'Kamera Off' : 'Menunggu...'}
                </p>
              </div>
            )}
          </div>

          {/* Call Info */}
          <div className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 text-center text-white z-20 bg-black/40 px-6 md:px-8 py-3 md:py-4 rounded-lg backdrop-blur-sm">
            <p className="text-xl md:text-2xl font-bold">{remoteUserName}</p>
            <p className="text-xs md:text-sm text-gray-300 mt-1">Panggilan Video</p>
            <p className="text-lg md:text-xl font-mono text-cyan-400 mt-2">{displayDuration}</p>
          </div>

          {/* Connection Status */}
          <div className="absolute top-4 md:top-8 right-4 md:right-6 bg-black/60 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
            <p className={isConnected ? 'text-green-400' : 'text-yellow-400'}>
              {isConnected ? '● Terhubung' : '● Menghubungkan'}
            </p>
          </div>
        </div>
      ) : (
        // Audio Call UI
        <>
          <audio
            ref={remoteAudioRef}
            autoPlay
            playsInline
            controls={false}
            muted={false}
            crossOrigin="anonymous"
            style={{ display: 'none' }}
          />
          <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
              <div className="absolute top-40 right-10 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-40 h-40 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Audio Call Content */}
            <div className="relative z-10 text-center px-4">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 rounded-full flex items-center justify-center mb-6 md:mb-8 animate-pulse backdrop-blur-sm">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/30 rounded-full flex items-center justify-center">
                  <Mic className="w-12 h-12 md:w-16 md:h-16 text-white flex-shrink-0" />
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">{remoteUserName}</h2>
              <p className="text-white/90 text-base md:text-lg mb-4 md:mb-6">Panggilan Suara Berlangsung</p>
              <p className="text-4xl md:text-5xl font-mono text-cyan-300 font-bold tracking-wider">{displayDuration}</p>

              {/* Mute indicator for audio */}
              {isRemoteMuted && (
                <div className="mt-6 inline-flex items-center gap-2 bg-red-600/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm animate-pulse">
                  <MicOff className="w-4 h-4" />
                  <span className="text-sm font-semibold">Lawan Sedang Mute</span>
                </div>
              )}

              {/* Connection Status */}
              <div className="mt-8">
                <p className={`text-sm font-semibold ${isConnected ? 'text-green-300' : 'text-yellow-300'}`}>
                  {isConnected ? '✓ Terhubung' : '⟳ Menghubungkan...'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Control Buttons */}
      <div className="relative z-30 bg-black/80 backdrop-blur-md p-4 md:p-6 flex items-center justify-center gap-4 md:gap-6 border-t border-white/10 flex-wrap">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all transform hover:scale-110 shadow-lg shadow-gray-700/50 relative"
          title="Pengaturan"
          aria-label="Pengaturan"
        >
          <MoreVertical className="w-7 h-7 text-white" />
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all transform hover:scale-110 ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/50'
              : 'bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-700/50'
          }`}
          title={isMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
          aria-label={isMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
        >
          {isMuted ? (
            <MicOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </button>

        {/* Video Toggle Button (only for video calls) */}
        {callType === 'video' && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isVideoOn
                ? 'bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-700/50'
                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/50'
            }`}
            title={isVideoOn ? 'Matikan Kamera' : 'Aktifkan Kamera'}
            aria-label={isVideoOn ? 'Matikan Kamera' : 'Aktifkan Kamera'}
          >
            {isVideoOn ? (
              <Video className="w-7 h-7 text-white" />
            ) : (
              <VideoOff className="w-7 h-7 text-white" />
            )}
          </button>
        )}

        {/* Hangup Button */}
        <button
          onClick={handleHangup}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg shadow-red-600/50"
          title="Akhiri Panggilan"
          aria-label="Akhiri Panggilan"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div
            ref={settingsModalRef}
            className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Pengaturan Audio & Video</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Video Input */}
            {callType === 'video' && videoDevices.length > 0 && (
              <div className="mb-5">
                <label className="text-white text-sm font-medium block mb-2">Kamera</label>
                <select
                  value={selectedVideoDevice}
                  onChange={(e) => setSelectedVideoDevice(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm hover:border-gray-500 transition"
                >
                  {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Kamera ${videoDevices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mirror Camera Toggle */}
            {callType === 'video' && (
              <div className="mb-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMirrored}
                    onChange={(e) => setIsMirrored(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 cursor-pointer"
                  />
                  <span className="text-white text-sm font-medium">Cerminkan Kamera Saya</span>
                </label>
              </div>
            )}

            {/* Audio Input */}
            {audioInputDevices.length > 0 && (
              <div className="mb-5">
                <label className="text-white text-sm font-medium block mb-2">Input Audio</label>
                <select
                  value={selectedAudioInput}
                  onChange={(e) => setSelectedAudioInput(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm hover:border-gray-500 transition"
                >
                  {audioInputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Mikrofon ${audioInputDevices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Audio Output */}
            {audioOutputDevices.length > 0 && (
              <div className="mb-5">
                <label className="text-white text-sm font-medium block mb-2">Output Audio</label>
                <select
                  value={selectedAudioOutput}
                  onChange={(e) => setSelectedAudioOutput(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 text-sm hover:border-gray-500 transition"
                >
                  {audioOutputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${audioOutputDevices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded font-mono max-w-xs z-40">
          <p>Local: {hasLocalStream ? '✓' : '✗'}</p>
          <p>Remote: {hasRemote ? '✓' : '✗'}</p>
          <p>Connected: {isConnected ? '✓' : '✗'}</p>
          <p>Duration: {displayDuration}</p>
        </div>
      )}
    </div>
  )
}

export default CallUI
