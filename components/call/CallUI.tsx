import React, { useState, useRef, useEffect } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'

interface CallUIProps {
  callId: number
  callType: 'audio' | 'video'
  remoteUserName: string
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  onHangup: () => void
  isConnected: boolean
  callDuration?: number
  hasRemoteStream?: boolean
}

const CallUI: React.FC<CallUIProps> = ({
  callId,
  callType,
  remoteUserName,
  localVideoRef,
  remoteVideoRef,
  onHangup,
  isConnected,
  callDuration = 0,
  hasRemoteStream = false,
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video')
  const [displayDuration, setDisplayDuration] = useState('00:00')
  const [hasLocalStream, setHasLocalStream] = useState(false)
  const [debugLocalStream, setDebugLocalStream] = useState<string>('no-stream')
  const [debugRemoteStream, setDebugRemoteStream] = useState<string>('no-stream')

  // Monitor local stream availability
  useEffect(() => {
    const checkLocalStream = () => {
      if (localVideoRef.current?.srcObject) {
        setHasLocalStream(true)
        const stream = localVideoRef.current.srcObject as MediaStream
        const videoTracks = stream.getVideoTracks()
        const audioTracks = stream.getAudioTracks()
        setDebugLocalStream(`video:${videoTracks.length} audio:${audioTracks.length}`)
        console.log('✅ Local stream ready:', { videoTracks: videoTracks.length, audioTracks: audioTracks.length })
      } else {
        setHasLocalStream(false)
        setDebugLocalStream('no-stream')
      }
    }

    // Check immediately
    checkLocalStream()

    // Check periodically since srcObject is set outside React
    const interval = setInterval(checkLocalStream, 500)
    return () => clearInterval(interval)
  }, [localVideoRef, hasLocalStream]) // Add hasLocalStream to deps to force re-check

  // Monitor remote stream
  useEffect(() => {
    const checkRemoteStream = () => {
      if (remoteVideoRef.current?.srcObject) {
        const stream = remoteVideoRef.current.srcObject as MediaStream
        const videoTracks = stream.getVideoTracks()
        const audioTracks = stream.getAudioTracks()
        setDebugRemoteStream(`video:${videoTracks.length} audio:${audioTracks.length}`)
        console.log('✅ Remote stream ready:', { videoTracks: videoTracks.length, audioTracks: audioTracks.length })
      } else {
        setDebugRemoteStream('no-stream')
      }
    }

    checkRemoteStream()
    const interval = setInterval(checkRemoteStream, 500)
    return () => clearInterval(interval)
  }, [remoteVideoRef, hasRemoteStream])

  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      const minutes = Math.floor(callDuration / 60)
      const seconds = callDuration % 60
      setDisplayDuration(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [callDuration, isConnected])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (localVideoRef.current?.srcObject) {
      const audioTracks = (localVideoRef.current.srcObject as MediaStream).getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = isMuted
      })
    }
  }

  const toggleVideo = () => {
    if (callType === 'audio') return
    setIsVideoOn(!isVideoOn)
    if (localVideoRef.current?.srcObject) {
      const videoTracks = (localVideoRef.current.srcObject as MediaStream).getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOn
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Video (Full Screen) */}
      {callType === 'video' ? (
        <div className="flex-1 relative bg-black">
          {/* Show remote video if stream is available, otherwise show connecting state */}
          {hasRemoteStream ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onLoadedMetadata={() => console.log('📹 Remote video loaded')}
                onPlay={() => console.log('▶️ Remote video playing')}
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Remote {debugRemoteStream}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                </div>
                <p className="text-white font-semibold">Menghubungkan...</p>
                <p className="text-gray-400 text-xs mt-2">{debugRemoteStream}</p>
              </div>
            </div>
          )}

          {/* Local Video (Picture in Picture) - Always show if camera is on */}
          <div className="absolute bottom-20 right-6 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            {hasLocalStream && isVideoOn ? (
              <>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => console.log('📹 Local video loaded')}
                  onPlay={() => console.log('▶️ Local video playing')}
                />
                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                  {debugLocalStream}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Kamera Anda</p>
                  <p className="text-gray-500 text-xs mt-1">{debugLocalStream}</p>
                </div>
              </div>
            )}
          </div>

          {/* Call Info */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center text-white">
            <p className="text-xl font-semibold">{remoteUserName}</p>
            <p className="text-sm text-gray-300">{displayDuration}</p>
          </div>
        </div>
      ) : (
        // Audio Call UI
        <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
              <Phone className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{remoteUserName}</h2>
          <p className="text-white/80 mb-4">Panggilan Suara</p>
          <p className="text-2xl font-mono text-white">{displayDuration}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="bg-black/50 backdrop-blur-sm p-6 flex items-center justify-center gap-4">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Video Toggle Button (only for video calls) */}
        {callType === 'video' && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOn
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isVideoOn ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>
        )}

        {/* Hangup Button */}
        <button
          onClick={onHangup}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          title="Hangup"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}

export default CallUI
