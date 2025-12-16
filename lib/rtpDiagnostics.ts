/**
 * RTP Diagnostics Helper
 * ✅ Comprehensive RTP flow monitoring and diagnostics
 */

export interface RTPStats {
  videoOutboundBytesSent: number
  videoOutboundFramesEncoded: number
  videoInboundBytesReceived: number
  videoInboundFramesDecoded: number
  audioInboundBytesReceived: number
  audioOutboundBytesSent: number
  dtlsState: string
  iceConnectionState: string
  connectionState: string
  timestamp: number
}

let lastStats: RTPStats | null = null
let monitorInterval: any = null

/**
 * Start continuous RTP monitoring
 * Runs every 2 seconds and logs detailed RTP statistics
 */
export function startRTPMonitoring(peerConnection: RTCPeerConnection, intervalMs: number = 2000) {
  console.log('🚀 [RTP Monitoring] Starting continuous RTP diagnostics every', intervalMs, 'ms')

  if (monitorInterval) {
    clearInterval(monitorInterval)
  }

  monitorInterval = setInterval(async () => {
    try {
      const stats = await getRTPStats(peerConnection)
      
      // Only log if something changed or every 5 iterations
      const changed = !lastStats || hasStatsChanged(lastStats, stats)
      if (changed) {
        console.log('📊 [RTP Monitor] RTP Statistics Update:', {
          VIDEO_OUTBOUND: {
            bytesSent: stats.videoOutboundBytesSent,
            framesEncoded: stats.videoOutboundFramesEncoded,
            status: stats.videoOutboundBytesSent > 0 ? '✅ SENDING' : '❌ NOT SENDING',
          },
          VIDEO_INBOUND: {
            bytesReceived: stats.videoInboundBytesReceived,
            framesDecoded: stats.videoInboundFramesDecoded,
            status: stats.videoInboundBytesReceived > 0 ? '✅ RECEIVING' : '❌ NOT RECEIVING',
          },
          AUDIO_INBOUND: {
            bytesReceived: stats.audioInboundBytesReceived,
            status: stats.audioInboundBytesReceived > 0 ? '✅ RECEIVING' : '❌ NOT RECEIVING',
          },
          DTLS_STATE: stats.dtlsState,
          ICE_STATE: stats.iceConnectionState,
          CONNECTION_STATE: stats.connectionState,
        })

        // ⚠️ Diagnose issues
        if (stats.videoInboundBytesReceived === 0 && peerConnection.getReceivers().some(r => r.track?.kind === 'video')) {
          console.error('❌ [RTP Monitor] VIDEO RTP NOT FLOWING:')
          if (stats.dtlsState !== 'connected') {
            console.error('   CAUSE: DTLS not connected (current:', stats.dtlsState + ')')
            console.error('   → Encryption layer not ready, RTP cannot flow')
          } else if (stats.videoOutboundBytesSent === 0) {
            console.error('   CAUSE: Sender not sending video (bytesSent=0)')
            console.error('   → Check if local stream properly added')
          } else {
            console.error('   CAUSE: Unknown - sender sends but receiver not getting')
            console.error('   → Firewall/NAT issue or codec mismatch')
          }
        }

        if (stats.audioInboundBytesReceived === 0 && peerConnection.getReceivers().some(r => r.track?.kind === 'audio')) {
          console.error('❌ [RTP Monitor] AUDIO RTP NOT FLOWING - same issues as video likely')
        }

        lastStats = stats
      }
    } catch (err) {
      console.error('❌ [RTP Monitor] Error getting stats:', err)
    }
  }, intervalMs)
}

/**
 * Stop RTP monitoring
 */
export function stopRTPMonitoring() {
  if (monitorInterval) {
    clearInterval(monitorInterval)
    monitorInterval = null
    console.log('⏹️ [RTP Monitoring] Stopped')
  }
}

/**
 * Get current RTP statistics
 */
export async function getRTPStats(peerConnection: RTCPeerConnection): Promise<RTPStats> {
  const stats: RTPStats = {
    videoOutboundBytesSent: 0,
    videoOutboundFramesEncoded: 0,
    videoInboundBytesReceived: 0,
    videoInboundFramesDecoded: 0,
    audioInboundBytesReceived: 0,
    audioOutboundBytesSent: 0,
    dtlsState: 'unknown',
    iceConnectionState: peerConnection.iceConnectionState,
    connectionState: peerConnection.connectionState,
    timestamp: Date.now(),
  }

  try {
    const reports = await peerConnection.getStats()

    reports.forEach((report) => {
      // DTLS state - check multiple report types
      if (report.type === 'dtls-transport' || report.type === 'transport') {
        const dtlsStateValue = (report as any).dtlsState || (report as any).state
        if (dtlsStateValue) {
          stats.dtlsState = dtlsStateValue
          console.log(`[getRTPStats] Found DTLS state via ${report.type}:`, dtlsStateValue)
        }
      }

      // Video outbound (sender)
      if (report.type === 'outbound-rtp' && (report as any).mediaType === 'video') {
        stats.videoOutboundBytesSent = (report as any).bytesSent || 0
        stats.videoOutboundFramesEncoded = (report as any).framesEncoded || 0
      }

      // Audio outbound (sender)
      if (report.type === 'outbound-rtp' && (report as any).mediaType === 'audio') {
        stats.audioOutboundBytesSent = (report as any).bytesSent || 0
      }

      // Video inbound (receiver)
      if (report.type === 'inbound-rtp' && (report as any).mediaType === 'video') {
        stats.videoInboundBytesReceived = (report as any).bytesReceived || 0
        stats.videoInboundFramesDecoded = (report as any).framesDecoded || 0
      }

      // Audio inbound (receiver)
      if (report.type === 'inbound-rtp' && (report as any).mediaType === 'audio') {
        stats.audioInboundBytesReceived = (report as any).bytesReceived || 0
      }
    })
  } catch (err) {
    console.error('Error getting RTP stats:', err)
  }

  return stats
}

/**
 * Check if RTP stats have changed meaningfully
 */
function hasStatsChanged(prev: RTPStats, current: RTPStats): boolean {
  // Check if any counter increased (not checking decreases since that's reset)
  return (
    current.videoOutboundBytesSent > prev.videoOutboundBytesSent ||
    current.videoOutboundFramesEncoded > prev.videoOutboundFramesEncoded ||
    current.videoInboundBytesReceived > prev.videoInboundBytesReceived ||
    current.videoInboundFramesDecoded > prev.videoInboundFramesDecoded ||
    current.audioInboundBytesReceived > prev.audioInboundBytesReceived ||
    current.audioOutboundBytesSent > prev.audioOutboundBytesSent ||
    current.dtlsState !== prev.dtlsState ||
    current.iceConnectionState !== prev.iceConnectionState ||
    current.connectionState !== prev.connectionState
  )
}

/**
 * Get diagnostic report about RTP flow status
 */
export async function getDiagnosticReport(peerConnection: RTCPeerConnection): Promise<string> {
  const stats = await getRTPStats(peerConnection)
  
  let report = '\n' + '='.repeat(80) + '\n'
  report += '📊 RTP DIAGNOSTIC REPORT\n'
  report += '='.repeat(80) + '\n'

  // Connection states
  report += '\n🔌 CONNECTION STATES:\n'
  report += `  Connection State: ${stats.connectionState}\n`
  report += `  ICE Connection State: ${stats.iceConnectionState}\n`
  report += `  DTLS State: ${stats.dtlsState}\n`

  // Video flow
  report += '\n📹 VIDEO RTP FLOW:\n'
  report += `  Outbound (Sender): ${stats.videoOutboundBytesSent} bytes, ${stats.videoOutboundFramesEncoded} frames\n`
  report += `  Inbound (Receiver): ${stats.videoInboundBytesReceived} bytes, ${stats.videoInboundFramesDecoded} frames\n`
  if (stats.videoOutboundBytesSent === 0) {
    report += '  ❌ SENDER NOT SENDING VIDEO\n'
  }
  if (stats.videoInboundBytesReceived === 0) {
    report += '  ❌ RECEIVER NOT GETTING VIDEO\n'
  } else {
    report += '  ✅ VIDEO FLOWING\n'
  }

  // Audio flow
  report += '\n🔊 AUDIO RTP FLOW:\n'
  report += `  Outbound (Sender): ${stats.audioOutboundBytesSent} bytes\n`
  report += `  Inbound (Receiver): ${stats.audioInboundBytesReceived} bytes\n`
  if (stats.audioInboundBytesReceived === 0) {
    report += '  ❌ AUDIO NOT FLOWING\n'
  } else {
    report += '  ✅ AUDIO FLOWING\n'
  }

  // Diagnostics
  report += '\n🔍 DIAGNOSTICS:\n'
  if (stats.dtlsState !== 'connected') {
    report += `  ⚠️ DTLS not fully connected yet (${stats.dtlsState})\n`
    report += '     RTP cannot flow until DTLS state = "connected"\n'
    report += '     This usually takes 1-5 seconds after ICE connection\n'
  }
  
  if (stats.videoInboundBytesReceived === 0 && peerConnection.getReceivers().some(r => r.track?.kind === 'video')) {
    if (stats.dtlsState === 'connected') {
      report += '  ❌ Video RTP not flowing despite DTLS connected:\n'
      report += '     Possible causes:\n'
      if (stats.videoOutboundBytesSent === 0) {
        report += '     1. Sender not adding local stream properly\n'
        report += '     2. Sender tracks disabled or in "ended" state\n'
        report += '     3. SDP offer missing m=video or video codec\n'
      } else {
        report += '     1. Firewall blocking RTP packets\n'
        report += '     2. NAT issue (despite ICE connected)\n'
        report += '     3. Codec mismatch between offer/answer\n'
        report += '     4. Browser receiving port blocked\n'
      }
    }
  }

  report += '\n' + '='.repeat(80) + '\n'
  return report
}
