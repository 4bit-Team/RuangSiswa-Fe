import React, { useState, useRef, useEffect } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, AlertCircle } from 'lucide-react'

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
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video')
  const [displayDuration, setDisplayDuration] = useState('00:00')
  const [hasLocalStream, setHasLocalStream] = useState(false)
  const [hasRemote, setHasRemote] = useState(false)
  const connectionTimeRef = useRef<number | null>(null) // ✅ Track when connection was established

  // Attach local stream to video element with robust retry logic
  useEffect(() => {
    if (!localStream) return

    // ✅ CRITICAL FIX: Keep local stream tracks ALIVE across re-renders
    // Prevent tracks from becoming state=ended due to re-renders or GC
    const tracks = localStream.getTracks()
    tracks.forEach((track: any) => {
      track.enabled = true  // Force enable
      console.log(`🔄 [CallUI LocalStream] Track ${track.kind} health check: enabled=${track.enabled}, state=${track.readyState}`)
    })

    let retryCount = 0
    const maxRetries = 5

    const attemptAttach = () => {
      console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries} to attach local stream, ref available: ${!!localVideoRef.current}`)
      
      if (localVideoRef.current && localStream) {
        try {
          localVideoRef.current.srcObject = localStream
          console.log('✅ Local stream attached successfully')
          setHasLocalStream(true)  // ✅ Set state immediately after attachment
          return true
        } catch (error) {
          console.error('❌ Error attaching local stream:', error)
          return false
        }
      }
      return false
    }

    // Try immediately
    if (attemptAttach()) return

    // Retry with exponential backoff
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

  // Attach remote stream to video/audio element with robust retry logic
  useEffect(() => {
    if (!remoteStream) {
      console.log('🔄 [CallUI] No remote stream yet, skipping attachment')
      return
    }

    let retryCount = 0
    const maxRetries = 5

    const attemptAttach = () => {
      // For video calls, attach to video element
      if (callType === 'video') {
        console.log(`🔄 [CallUI Video] Attempt ${retryCount + 1}/${maxRetries} to attach remote stream, ref available: ${!!remoteVideoRef.current}`)
        
        if (remoteVideoRef.current && remoteStream) {
          try {
            const videoElement = remoteVideoRef.current as HTMLVideoElement
            
            // Log track details BEFORE attaching
            const audioTracks = remoteStream.getAudioTracks()
            const videoTracks = remoteStream.getVideoTracks()
            console.log(`📊 [CallUI Video] Stream tracks BEFORE attach:`, {
              audioTrackCount: audioTracks.length,
              audioTracksEnabled: audioTracks.map((t: any) => ({ id: t.id, enabled: t.enabled, muted: t.muted })),
              videoTrackCount: videoTracks.length,
              videoTracksEnabled: videoTracks.map((t: any) => ({ id: t.id, enabled: t.enabled, muted: t.muted })),
            })
            
            console.log(`📋 [CallUI Video] Setting srcObject on video element...`)
            videoElement.srcObject = remoteStream
            videoElement.volume = 1.0  // Ensure volume is max
            console.log(`✅ [CallUI Video] Remote stream srcObject set, volume: ${videoElement.volume}`)
            
            // Log track details AFTER attaching
            console.log(`📊 [CallUI Video] Stream tracks AFTER attach:`, {
              audioTrackCount: audioTracks.length,
              audioTracksEnabled: audioTracks.map((t: any) => ({ id: t.id, enabled: t.enabled, muted: t.muted })),
              videoTrackCount: videoTracks.length,
              videoTracksEnabled: videoTracks.map((t: any) => ({ id: t.id, enabled: t.enabled, muted: t.muted })),
            })
            
            // Explicitly start playback
            console.log(`▶️ [CallUI Video] Calling .play() on video element...`)
            const playPromise = videoElement.play()
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('📹 [CallUI Video] Video playback started successfully')
                })
                .catch((error) => {
                  console.error('❌ [CallUI Video] Video playback failed:', error.name, error.message)
                  // Try forcing play with user gesture context
                  console.log('⚠️ [CallUI Video] Attempting to resume after user gesture...')
                })
            } else {
              console.log('📹 [CallUI Video] play() returned undefined (old browser)')
            }
            
            console.log('✅ [CallUI Video] Remote stream attached successfully:', {
              videoTracks: remoteStream.getVideoTracks().length,
              audioTracks: remoteStream.getAudioTracks().length,
            })
            setHasRemote(true)  // ✅ Set state immediately after successful attachment
            return true
          } catch (error) {
            console.error('❌ [CallUI Video] Error attaching remote stream:', error)
            return false
          }
        }
      } else {
        // For audio calls, attach to AUDIO element (use remoteAudioRef)
        console.log(`🔄 [CallUI Audio] Attempt ${retryCount + 1}/${maxRetries} to attach remote audio stream, ref available: ${!!remoteAudioRef?.current}`)
        
        if (remoteAudioRef?.current && remoteStream) {
          try {
            const audioElement = remoteAudioRef.current as HTMLAudioElement
            console.log(`📋 [CallUI Audio] Setting srcObject on audio element...`)
            audioElement.srcObject = remoteStream
            audioElement.volume = 1.0  // Ensure volume is max
            console.log(`✅ [CallUI Audio] Remote stream srcObject set, volume: ${audioElement.volume}`)
            
            // Explicitly start playback
            console.log(`▶️ [CallUI Audio] Calling .play() on audio element...`)
            const playPromise = audioElement.play()
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('🔊 [CallUI Audio] Audio playback started successfully')
                })
                .catch((error) => {
                  console.error('❌ [CallUI Audio] Audio playback failed:', error.name, error.message)
                })
            } else {
              console.log('🔊 [CallUI Audio] play() returned undefined (old browser)')
            }
            
            console.log('✅ [CallUI Audio] Remote audio stream attached successfully:', {
              audioTracks: remoteStream.getAudioTracks().length,
            })
            setHasRemote(true)  // ✅ Set state immediately after successful attachment
            return true
          } catch (error) {
            console.error('❌ [CallUI Audio] Error attaching remote audio stream:', error)
            return false
          }
        }
      }
      return false
    }

    // Try immediately
    if (attemptAttach()) return

    // Retry with exponential backoff
    let timeout: ReturnType<typeof setTimeout>
    const retryWithBackoff = () => {
      retryCount++
      if (retryCount >= maxRetries) {
        console.error(`❌ [CallUI] Failed to attach remote stream after ${maxRetries} retries`)
        return
      }
      const delay = 100 * Math.pow(1.5, retryCount)
      console.log(`⏱️ [CallUI] Retrying in ${Math.round(delay)}ms... (attempt ${retryCount + 1}/${maxRetries})`)
      timeout = setTimeout(() => {
        if (!attemptAttach()) {
          retryWithBackoff()
        }
      }, delay)
    }

    retryWithBackoff()
    return () => clearTimeout(timeout)
  }, [remoteStream, callType, remoteAudioRef, remoteVideoRef])

  // Monitor local video playback - update state when video actually plays
  useEffect(() => {
    if (!localVideoRef.current) {
      console.log('⚠️ Local video ref not available')
      return
    }

    const onLoadedMetadata = () => {
      console.log('📹 Local video metadata loaded')
      setHasLocalStream(true)
    }

    const onPlay = () => {
      console.log('▶️ Local video playing')
      setHasLocalStream(true)
    }

    const onError = (e: Event) => {
      console.error('❌ Local video error:', e)
      setHasLocalStream(false)
    }

    const videoElement = localVideoRef.current
    videoElement.addEventListener('loadedmetadata', onLoadedMetadata)
    videoElement.addEventListener('play', onPlay)
    videoElement.addEventListener('error', onError)

    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata)
      videoElement.removeEventListener('play', onPlay)
      videoElement.removeEventListener('error', onError)
    }
  }, [])

  // Monitor remote video/audio playback - update state when actually plays
  useEffect(() => {
    if (!remoteVideoRef.current) {
      console.log('⚠️ Remote element ref not available')
      return
    }

    const element = remoteVideoRef.current
    const isAudioElement = element.tagName === 'AUDIO'

    const onLoadedMetadata = () => {
      console.log(`📹 Remote ${isAudioElement ? 'audio' : 'video'} metadata loaded`)
      setHasRemote(true)
    }

    const onPlay = () => {
      console.log(`▶️ Remote ${isAudioElement ? 'audio' : 'video'} playing`)
      setHasRemote(true)
    }

    const onError = (e: Event) => {
      console.error(`❌ Remote ${isAudioElement ? 'audio' : 'video'} error:`, e)
      setHasRemote(false)
    }

    const onCanPlay = () => {
      console.log(`▶️ Remote ${isAudioElement ? 'audio' : 'video'} can play`)
      setHasRemote(true)
    }

    element.addEventListener('loadedmetadata', onLoadedMetadata)
    element.addEventListener('play', onPlay)
    element.addEventListener('error', onError)
    element.addEventListener('canplay', onCanPlay)

    return () => {
      element.removeEventListener('loadedmetadata', onLoadedMetadata)
      element.removeEventListener('play', onPlay)
      element.removeEventListener('error', onError)
      element.removeEventListener('canplay', onCanPlay)
    }
  }, [callType])

  // ✅ NEW: Monitor and ensure remote track stays enabled
  useEffect(() => {
    if (!remoteStream) return

    const interval = setInterval(() => {
      const audioTracks = remoteStream.getAudioTracks()
      const videoTracks = remoteStream.getVideoTracks()

      // Check and re-enable tracks if they became disabled
      audioTracks.forEach((track) => {
        if (!track.enabled && track.readyState === 'live') {
          console.log(`🔊 [CallUI Monitor] Audio track was disabled, re-enabling...`)
          track.enabled = true
        }
      })

      videoTracks.forEach((track) => {
        if (!track.enabled && track.readyState === 'live') {
          console.log(`📹 [CallUI Monitor] Video track was disabled, re-enabling...`)
          track.enabled = true
        }
      })
    }, 500) // Check every 500ms

    return () => clearInterval(interval)
  }, [remoteStream])

  // ✅ NEW: Monitor video element rendering state
  useEffect(() => {
    if (callType !== 'video' || !remoteVideoRef.current) return

    const videoElement = remoteVideoRef.current
    const debugInterval = setInterval(() => {
      console.log(`📹 [Video Element Debug]`, {
        canvasWidth: videoElement.videoWidth,
        canvasHeight: videoElement.videoHeight,
        displayWidth: videoElement.offsetWidth,
        displayHeight: videoElement.offsetHeight,
        readyState: videoElement.readyState,
        networkState: videoElement.networkState,
        played: videoElement.played.length > 0,
        paused: videoElement.paused,
        srcObject: !!videoElement.srcObject,
        srcObjectTracks: videoElement.srcObject ? (videoElement.srcObject as any).getTracks().length : 0,
        className: videoElement.className,
        display: window.getComputedStyle(videoElement).display,
        visibility: window.getComputedStyle(videoElement).visibility,
        opacity: window.getComputedStyle(videoElement).opacity,
      })
    }, 2000)

    return () => clearInterval(debugInterval)
  }, [callType])

  // ✅ FIXED: Monitor local tracks but RESPECT mute state
  useEffect(() => {
    if (!localStream) return

    const interval = setInterval(() => {
      const audioTracks = localStream.getAudioTracks()
      const videoTracks = localStream.getVideoTracks()

      // ✅ CRITICAL: Only re-enable if NOT muted by user
      // If user muted, DO NOT force enable
      audioTracks.forEach((track) => {
        // Only re-enable if:
        // 1. Track disabled by accident (readyState is still live)
        // 2. AND user hasn't muted it
        if (!track.enabled && track.readyState === 'live' && !isMuted) {
          console.log(`🔊 [CallUI Local Monitor] Audio track was disabled accidentally, re-enabling...`)
          track.enabled = true
        } else if (isMuted && track.enabled) {
          // If user muted but track is still enabled, disable it
          console.log(`🔊 [CallUI Local Monitor] User muted but track enabled, disabling...`)
          track.enabled = false
        }
      })

      videoTracks.forEach((track) => {
        // Only re-enable if:
        // 1. Track disabled by accident
        // 2. AND user hasn't turned off video
        if (!track.enabled && track.readyState === 'live' && isVideoOn) {
          console.log(`📹 [CallUI Local Monitor] Video track was disabled accidentally, re-enabling...`)
          track.enabled = true
        } else if (!isVideoOn && track.enabled) {
          // If user turned off video but track is still enabled, disable it
          console.log(`📹 [CallUI Local Monitor] User turned off video but track enabled, disabling...`)
          track.enabled = false
        }
      })
    }, 500) // Check every 500ms

    return () => clearInterval(interval)
  }, [localStream, isMuted, isVideoOn])

  // ✅ FIXED: Calculate duration from connection time (same for both sides)
  useEffect(() => {
    if (!isConnected) return

    // Set connection time on first connection
    if (!connectionTimeRef.current) {
      connectionTimeRef.current = Date.now()
      console.log('📱 [CallUI] Connection established, starting timer from this moment')
    }

    const interval = setInterval(() => {
      // Calculate duration from connection time (not from prop which might be different)
      const elapsedMs = Date.now() - (connectionTimeRef.current || Date.now())
      const totalSeconds = Math.floor(elapsedMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      
      const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      setDisplayDuration(formattedDuration)
      
      // Optional: Also log for debugging (remove later)
      if (totalSeconds % 10 === 0 && totalSeconds > 0) {
        console.log(`⏱️ [CallUI] Call duration: ${formattedDuration}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      console.log(`🎙️ Toggling audio ${audioTracks.length} tracks to enabled=${!newMutedState}`)
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
      console.log(`📹 Toggling video ${videoTracks.length} tracks to enabled=${newVideoState}`)
      videoTracks.forEach((track) => {
        track.enabled = newVideoState
      })
    }
  }

  // Prevent page unload during call
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Call UI */}
      {callType === 'video' ? (
        <div className="flex-1 relative bg-black overflow-hidden">
          {/* Remote Video (Full Screen Background) - ALWAYS in DOM */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="absolute inset-0 w-full h-full object-cover bg-black"
            crossOrigin="anonymous"
            style={{ display: 'block' }}
            onLoadedMetadata={() => {
              console.log('✅ Video metadata loaded, readyState:', remoteVideoRef.current?.readyState)
            }}
            onLoadStart={() => {
              console.log('🔄 Video loadstart event fired')
            }}
            onCanPlay={() => {
              console.log('✅✅ Video CAN PLAY - video should appear now!')
            }}
            onPlay={() => {
              console.log('✅ Video play event fired')
            }}
            onTimeUpdate={() => {
              const video = remoteVideoRef.current
              if (video && video.currentTime > 0) {
                console.log(`🎬 Video time updated: ${video.currentTime.toFixed(2)}s, buffered: ${video.buffered.length > 0}`)
              }
            }}
            onError={(e) => {
              console.error('❌ Video error event:', e)
              const video = remoteVideoRef.current
              if (video) {
                console.error('   Error code:', video.error?.code, video.error?.message)
              }
            }}
          />
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Loading/Waiting State - show if remote video not ready yet */}
          {!hasRemote && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-500"></div>
                </div>
                <p className="text-white font-semibold text-lg">Menghubungkan...</p>
                <p className="text-gray-400 text-sm mt-2">{remoteUserName}</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-yellow-500 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Menunggu stream dari pengguna lain</span>
                </div>
              </div>
            </div>
          )}

          {/* Local Video (Picture in Picture) - ALWAYS in DOM */}
          <div className="absolute bottom-24 right-6 w-56 h-40 bg-gray-900 rounded-lg overflow-hidden border-4 border-white shadow-2xl">
            {/* Video element ALWAYS in DOM for attachment */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                localStream && isVideoOn ? 'block' : 'hidden'
              }`}
            />
            {/* Placeholder shown when video is off or no stream */}
            {!(localStream && isVideoOn) && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
                <Video className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-gray-400 text-xs text-center">
                  {!isVideoOn ? 'Kamera Dimatikan' : 'Menunggu stream...'}
                </p>
              </div>
            )}
          </div>

          {/* Call Info Overlay */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center text-white z-20 bg-black/40 px-8 py-4 rounded-lg backdrop-blur-sm">
            <p className="text-2xl font-bold">{remoteUserName}</p>
            <p className="text-sm text-gray-300 mt-1">Panggilan Video</p>
            <p className="text-lg font-mono text-cyan-400 mt-2">{displayDuration}</p>
          </div>

          {/* Connection Status */}
          <div className="absolute top-8 right-6 bg-black/60 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
            <p className={isConnected ? 'text-green-400' : 'text-yellow-400'}>
              {isConnected ? '● Terhubung' : '● Menghubungkan'}
            </p>
          </div>
        </div>
      ) : (
        // Audio Call UI
        <>
          {/* Hidden audio element for audio call playback - use remoteAudioRef */}
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
            <div className="relative z-10 text-center">
              <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center mb-8 animate-pulse backdrop-blur-sm">
                <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                  <Mic className="w-16 h-16 text-white" />
                </div>
              </div>

              <h2 className="text-5xl font-bold text-white mb-4">{remoteUserName}</h2>
              <p className="text-white/90 text-lg mb-6">Panggilan Suara Berlangsung</p>
              <p className="text-5xl font-mono text-cyan-300 font-bold tracking-wider">{displayDuration}</p>

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
      <div className="relative z-30 bg-black/80 backdrop-blur-md p-6 flex items-center justify-center gap-6 border-t border-white/10">
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
          onClick={onHangup}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg shadow-red-600/50"
          title="Akhiri Panggilan"
          aria-label="Akhiri Panggilan"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>

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