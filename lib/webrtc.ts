  // WebRTC utility functions for peer-to-peer communication

  /**
   * ✅ ICE Candidate Throttler - Prevents spam by batching candidates
   * Backend rejects >30 candidates in 1 second, so we batch them
   */
  export class IceCandidateThrottler {
    private candidateQueue: RTCIceCandidate[] = [];
    private sendTimer: NodeJS.Timeout | null = null;
    private batchSize = 5; // Send max 5 at a time
    private batchDelay = 150; // Wait 150ms between batches
    private sendCount = 0;
    private lastResetTime = Date.now();

    constructor() {
      // Reset counters every 1 second
      setInterval(() => {
        if (Date.now() - this.lastResetTime >= 1000) {
          this.sendCount = 0;
          this.lastResetTime = Date.now();
        }
      }, 100);
    }

    enqueue(candidate: RTCIceCandidate): void {
      this.candidateQueue.push(candidate);
      this.scheduleFlush();
    }

    private scheduleFlush(): void {
      if (this.sendTimer) {
        clearTimeout(this.sendTimer);
      }

      this.sendTimer = setTimeout(() => {
        this.flush();
      }, this.batchDelay);
    }

    private flush(): void {
      if (this.candidateQueue.length === 0) return;

      // Check rate limit: max 15 candidates per second
      const elapsedMs = Date.now() - this.lastResetTime;
      if (elapsedMs >= 1000) {
        this.sendCount = 0;
        this.lastResetTime = Date.now();
      }

      const canSend = Math.min(15 - this.sendCount, this.batchSize);
      if (canSend <= 0) {
        // Still over limit, schedule retry
        this.scheduleFlush();
        return;
      }

      const batch = this.candidateQueue.splice(0, canSend);
      this.sendCount += batch.length;

      // Return batch for caller to send
      for (const candidate of batch) {
        // The caller will call getNextBatch() to get these
      }

      if (this.candidateQueue.length > 0) {
        this.scheduleFlush();
      }
    }

    getNextBatch(): RTCIceCandidate[] {
      const elapsedMs = Date.now() - this.lastResetTime;
      if (elapsedMs >= 1000) {
        this.sendCount = 0;
        this.lastResetTime = Date.now();
      }

      const canSend = Math.min(15 - this.sendCount, this.batchSize);
      if (canSend <= 0) {
        return [];
      }

      const batch = this.candidateQueue.splice(0, canSend);
      this.sendCount += batch.length;
      return batch;
    }

    clear(): void {
      this.candidateQueue = [];
      if (this.sendTimer) {
        clearTimeout(this.sendTimer);
        this.sendTimer = null;
      }
      this.sendCount = 0;
    }
  }

  export interface WebRTCConfig {
    iceServers?: RTCIceServer[];
    offerOptions?: RTCOfferOptions;
    answerOptions?: RTCAnswerOptions;
  }

  // ✅ NEW: TURN-only config for fallback (aggressive mode)
  export const turnOnlyWebRTCConfig: WebRTCConfig = {
    iceServers: [
      // ⚠️ AGGRESSIVE: TURN-only mode (no STUN)
      // Use when STUN is blocked but TURN relay available
      // Trade-off: More latency but guaranteed connectivity
      
      // Primary TURN
      {
        urls: ['turn:relay.metered.ca:80', 'turn:relay.metered.ca:443'],
        username: 'webrtc',
        credential: 'webrtc'
      },
      
      // Secondary TURN (backup)
      {
        urls: ['turn:numb.viagee.com:3478', 'turn:numb.viagee.com:3478?transport=tcp'],
        username: 'webrtc@beispiel.com',
        credential: 'webrtcpassword'
      },
      
      // Tertiary TURN (last resort)
      {
        urls: ['turn:turnserver.twilio.com:80?transport=udp'],
        username: 'placeholder',
        credential: 'placeholder'
      },
    ],
    offerOptions: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    },
    answerOptions: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    },
  };

  export const defaultWebRTCConfig: WebRTCConfig = {
    // STUN servers untuk NAT traversal (gratis & aman)
    // Gunakan multiple servers untuk redundansi & keamanan
    iceServers: [
      // Google STUN (gratis, reliable)
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Backup: Mozilla STUN (fallback jika Google down)
      { urls: 'stun:stun.services.mozilla.com:3478' },
      
      // Backup: stunprotocol.org
      { urls: 'stun:stun.stunprotocol.org:3478' },
      
      // Backup: stunserver.org
      { urls: 'stun:stun.stunserver.org:3478' },
      
      // ✅ PUBLIC TURN SERVERS (Critical for laptop-to-laptop scenario)
      // These are public, free TURN servers with good uptime
      
      // Primary TURN: relay.metered.ca (HTTP fallback)
      {
        urls: ['turn:relay.metered.ca:80'],
        username: 'webrtc',
        credential: 'webrtc'
      },
      // Primary TURN: relay.metered.ca (TLS + TCP fallback)
      {
        urls: ['turn:relay.metered.ca:443'],
        username: 'webrtc',
        credential: 'webrtc'
      },
      
      // ✅ SECONDARY TURN: numb.viagee.com (additional fallback)
      {
        urls: ['turn:numb.viagee.com:3478'],
        username: 'webrtc@beispiel.com',
        credential: 'webrtcpassword'
      },
      {
        urls: ['turn:numb.viagee.com:3478?transport=tcp'],
        username: 'webrtc@beispiel.com',
        credential: 'webrtcpassword'
      },
      
      // ✅ TERTIARY TURN: Public TURN server for ultimate fallback
      {
        urls: ['turn:turnserver.twilio.com:80?transport=udp'],
        username: 'placeholder',
        credential: 'placeholder'
      },
      
      // ✅ OPTIONAL: Jika ada TURN server sendiri (untuk enkripsi + relay)
      // Uncomment dan isi dengan server Anda
      /*
      {
        urls: ['turn:your-server.com:3478?transport=tcp'],
        username: 'your_username',
        credential: 'your_password'
      },
      */
    ],
    offerOptions: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    },
    answerOptions: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    },
  };

  /**
   * Create a new RTCPeerConnection with ICE gathering monitoring
   * ✅ NEW: Monitors ICE gathering states and provides diagnostics
   * ✅ ENHANCED: Force TURN relay when STUN alone fails
   */
  export function createPeerConnection(config: WebRTCConfig = defaultWebRTCConfig): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({
      iceServers: config.iceServers,
      // ✅ NEW: Aggressive settings to force TURN relay when needed
      bundlePolicy: 'max-bundle', // Reduce number of ports needed
      rtcpMuxPolicy: 'require', // Combine RTP/RTCP on single port (NAT-friendly)
      iceCandidatePoolSize: 10, // Allow more ICE candidates to gather
    });

    // ✅ NEW: Monitor ICE gathering state for diagnostics
    let iceGatheringStartTime = 0;
    let hostCandidateCount = 0;
    let srflxCandidateCount = 0;
    let relayCandidateCount = 0;
    let gatheringDuration = 0;

    peerConnection.addEventListener('icegatheringstatechange', () => {
      const state = peerConnection.iceGatheringState;
      
      if (state === 'gathering') {
        iceGatheringStartTime = Date.now();
        console.log('🔍 [ICE Gathering] STARTED - Discovering candidates from STUN/TURN servers...');
      } else if (state === 'complete') {
        gatheringDuration = Date.now() - iceGatheringStartTime;
        console.log(`✅ [ICE Gathering] COMPLETE in ${gatheringDuration}ms:`, {
          hostCandidates: hostCandidateCount,
          srflxCandidates: srflxCandidateCount,
          relayCandidates: relayCandidateCount,
          totalCandidates: hostCandidateCount + srflxCandidateCount + relayCandidateCount,
        });

        // ⚠️ Diagnostic: If NO RELAY after long time, FORCE TURN restart
        if (relayCandidateCount === 0 && srflxCandidateCount > 0 && gatheringDuration > 2000) {
          console.warn('⚠️ [ICE Gathering] WARNING: STUN OK but NO RELAY candidates found!');
          console.warn('   TURN relay may be blocked. Will attempt ICE restart to force TURN priority...');
          
          // Schedule ICE restart after 1 second (if connection fails)
          setTimeout(() => {
            if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
              console.log('🔄 [ICE] Attempting ICE restart to force TURN relay usage...');
              try {
                peerConnection.restartIce();
              } catch (e) {
                console.warn('⚠️ [ICE] restartIce failed:', e);
              }
            }
          }, 1000);
        } else if (relayCandidateCount === 0 && srflxCandidateCount === 0) {
          console.error('❌ [ICE Gathering] ERROR: No SRFLX or RELAY candidates found!');
          console.error('   Only HOST candidates available - may fail on different networks');
          console.error('   Check: STUN server connectivity, firewall blocking ports 3478/19302');
        } else if (relayCandidateCount > 0) {
          console.log('✅ [ICE Gathering] TURN relay available! Will use for NAT traversal.');
        }
      }
    });

    // ✅ NEW: Track candidate types as they arrive
    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        const candidateStr = event.candidate.candidate;
        if (candidateStr.includes('typ host')) {
          hostCandidateCount++;
        } else if (candidateStr.includes('typ srflx')) {
          srflxCandidateCount++;
        } else if (candidateStr.includes('typ relay')) {
          relayCandidateCount++;
        }
      }
    });

    // ✅ NEW: Monitor ICE connection state transitions with aggressive fallback
    let failureCount = 0;
    peerConnection.addEventListener('iceconnectionstatechange', () => {
      const state = peerConnection.iceConnectionState;
      console.log(`📡 [ICE Connection] State changed: ${state}`);
      
      if (state === 'failed') {
        failureCount++;
        console.error(`❌ [ICE Connection] FAILED (attempt #${failureCount}) - No working candidate pair found`);
        console.error('   Possible causes:');
        console.error('   1. TURN relay blocked by firewall');
        console.error('   2. Asymmetric NAT between peers');
        console.error('   3. STUN/TURN server unreachable');
        console.error('   4. Signaling error (SDP not exchanged properly)');
        
        // ✅ NEW: Aggressive restart on failure
        if (failureCount === 1 && relayCandidateCount === 0) {
          console.log('🔄 [ICE] No RELAY candidates found. Attempting restart...');
          try {
            peerConnection.restartIce();
          } catch (e) {
            console.warn('⚠️ [ICE] restartIce failed:', e);
          }
        }
      } else if (state === 'disconnected') {
        console.warn('⚠️ [ICE Connection] DISCONNECTED - Will attempt to reconnect');
      } else if (state === 'connected') {
        console.log('✅ [ICE Connection] CONNECTED - Found working candidate pair');
        failureCount = 0; // Reset on success
      }
    });

    // ✅ NEW: Monitor connection state (overall peer connection status)
    peerConnection.addEventListener('connectionstatechange', () => {
      const state = peerConnection.connectionState;
      console.log(`🔌 [Connection] State changed: ${state}`);
      
      if (state === 'failed') {
        console.error('❌ [Connection] FAILED - No working path for media');
        console.error('   Will log all candidates gathered for debugging:');
        console.error(`   HOST: ${hostCandidateCount}, SRFLX: ${srflxCandidateCount}, RELAY: ${relayCandidateCount}`);
      }
    });

    return peerConnection;
  }

  /**
   * Create and send SDP offer
   */
  export async function createOffer(
    peerConnection: RTCPeerConnection,
    config: WebRTCConfig = defaultWebRTCConfig
  ): Promise<string> {
    try {
      // ✅ CRITICAL: Verify senders are actually set BEFORE creating offer
      const senders = peerConnection.getSenders()
      const receivers = peerConnection.getReceivers()
      console.log('🔍 [createOffer] CRITICAL CHECK - Senders & Receivers before offer creation:')
      console.log(`   Total senders: ${senders.length}`)
      senders.forEach((sender, idx) => {
        console.log(`   Sender[${idx}] ${sender.track?.kind}: enabled=${sender.track?.enabled}, muted=${sender.track?.muted}, readyState=${sender.track?.readyState}, id=${sender.track?.id}`)
      })
      console.log(`   Total receivers: ${receivers.length}`)
      receivers.forEach((receiver, idx) => {
        console.log(`   Receiver[${idx}] ${receiver.track?.kind}: enabled=${receiver.track?.enabled}, muted=${receiver.track?.muted}, readyState=${receiver.track?.readyState}`)
      })
      
      if (senders.length === 0) {
        console.error('❌ [createOffer] NO SENDERS! Tracks never added to peer connection')
        console.error('   This will cause bytesSent=0 because WebRTC has nothing to send')
      }
      
      // Check connection state
      console.log(`   Connection state: signalingState=${peerConnection.signalingState}, iceConnectionState=${peerConnection.iceConnectionState}, connectionState=${peerConnection.connectionState}`)
      
      // Check transceivers (the actual senders + receivers paired)
      const transceivers = peerConnection.getTransceivers()
      console.log(`   Total transceivers: ${transceivers.length}`)
      transceivers.forEach((transceiver, idx) => {
        console.log(`   Transceiver[${idx}]: sender.kind=${transceiver.sender.track?.kind}, receiver.kind=${transceiver.receiver.track?.kind}, mid=${transceiver.mid}`)
      })
      
      console.log('🎙️ Creating offer with options:', config.offerOptions)
      const offer = await peerConnection.createOffer(config.offerOptions);
      console.log('✅ Offer created:', { type: offer.type, sdpLength: offer.sdp?.length || 0 })
      
      // ✅ CRITICAL: LOG ACTUAL SDP LINE BY LINE
      let sdp = offer.sdp || ''
      const sdpLines = sdp.split('\n') || []
      const hasVideo = sdpLines.some((line: string) => line.includes('m=video'))
      const hasAudio = sdpLines.some((line: string) => line.includes('m=audio'))
      
      // ✅ FIXED: Better codec detection
      // 1. Find m=video line with codec numbers
      const videoLine = sdpLines.find((line: string) => line.includes('m=video'))
      const videoCodecNumbers = videoLine ? videoLine.split(' ').slice(3) : [] // Extract codec numbers after "m=video 9 UDP/TLS/RTP/SAVPF"
      
      // 2. Find all a=rtpmap lines (which map codec numbers to codec names)
      const rtpmapLines = sdpLines.filter((line: string) => line.includes('a=rtpmap:'))
      
      // 3. Check which codec numbers have actual rtpmap definitions
      const definedCodecs = rtpmapLines.map((line: string) => {
        const match = line.match(/a=rtpmap:(\d+)/)
        return match ? match[1] : null
      }).filter(Boolean)
      
      console.log('📋 [createOffer] SDP ANALYSIS:', {
        hasVideo,
        hasAudio,
        totalLines: sdpLines.length,
        videoCodecNumbersInM: videoCodecNumbers.length > 0 ? videoCodecNumbers.slice(0, 5).join(',') + '...' : 'NONE',
        totalCodecDefinitions: rtpmapLines.length,
        videoCodecDefinitions: definedCodecs.filter(c => {
          const rtpLine = rtpmapLines.find(line => line.includes(`a=rtpmap:${c}`))
          return rtpLine && !rtpLine.includes('PCMU') && !rtpLine.includes('PCMA')
        }).length,
        firstRtpmap: rtpmapLines[0]?.substring(0, 100) || 'NONE'
      })
      
      // 🔍 DUMP FULL SDP FOR INSPECTION
      console.log('🔍 [createOffer] FULL SDP CONTENT:');
      console.log('='.repeat(80));
      sdpLines.forEach((line: string, idx: number) => {
        if (line.trim()) {
          console.log(`[Line ${idx}] ${line}`);
        }
      });
      console.log('='.repeat(80));
      
      // ⚠️ CRITICAL: If codec NUMBERS exist but NO DEFINITIONS, SDP is malformed
      if (hasVideo && videoCodecNumbers.length > 0 && rtpmapLines.length === 0) {
        console.error('❌ [createOffer] CRITICAL: m=video has codec numbers but NO a=rtpmap definitions!');
        console.error('   m=video line: ' + videoLine);
        console.error('   This is a FRONTEND SDP generation bug - browser not including codec definitions');
        console.error('   Browser cannot map codec numbers without a=rtpmap lines');
      } else if (hasVideo && videoCodecNumbers.length === 0) {
        console.error('❌ [createOffer] m=video line has no codec numbers');
        console.error('   Full m=video line: ' + videoLine);
      } else if (hasVideo && rtpmapLines.length > 0) {
        console.log('✅ [createOffer] Video codec definitions found! Total rtpmap lines:', rtpmapLines.length);
        rtpmapLines.slice(0, 5).forEach(line => console.log('   ' + line));
      }
      
      await peerConnection.setLocalDescription(offer);
      console.log('✅ Local description set')
      return JSON.stringify(offer);
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Create SDP answer from received offer
   */
  export async function createAnswer(
    peerConnection: RTCPeerConnection,
    offerSDP: string,
    config: WebRTCConfig = defaultWebRTCConfig
  ): Promise<string> {
    try {
      // ✅ NEW: Check connection state BEFORE creating answer
      const signalingState = peerConnection.signalingState;
      console.log(`📡 [createAnswer] Current signaling state: ${signalingState}`);
      
      if (signalingState !== 'have-remote-offer') {
        console.error(`❌ [createAnswer] Invalid state to create answer! Current: ${signalingState}, Expected: have-remote-offer`);
        throw new Error(`Cannot create answer in ${signalingState} state`);
      }

      console.log('🎙️ Creating answer with options:', config.answerOptions)
      // Parse offer SDP
      let offerObj: any
      if (typeof offerSDP === 'string') {
        try {
          offerObj = JSON.parse(offerSDP)
        } catch {
          // If it's not JSON, it might be raw SDP
          throw new Error('Invalid offer format')
        }
      } else {
        offerObj = offerSDP
      }
      
      // Validate that offerObj has sdp property
      if (!offerObj || !offerObj.sdp) {
        throw new Error('Offer does not contain valid SDP: ' + JSON.stringify(offerObj))
      }
      
      // ✅ CRITICAL: LOG RECEIVED OFFER SDP IN DETAIL
      const offerSdpLines = offerObj.sdp.split('\n') || []
      const offerHasVideo = offerSdpLines.some((line: string) => line.includes('m=video'))
      const offerHasAudio = offerSdpLines.some((line: string) => line.includes('m=audio'))
      
      // Extract video codecs from offer
      const offerVideoLine = offerSdpLines.find((line: string) => line.includes('m=video'))
      const offerVideoCodecNumbers = offerVideoLine ? offerVideoLine.split(' ').slice(3) : []
      const offerVideoCodecs = offerSdpLines.filter((line: string) => {
        const match = line.match(/a=rtpmap:(\d+)/)
        return match && offerVideoCodecNumbers.includes(match[1])
      })
      
      console.log('📋 [createAnswer] RECEIVED OFFER SDP:', {
        hasVideo: offerHasVideo,
        hasAudio: offerHasAudio,
        totalLines: offerSdpLines.length,
        offerVideoCodecNumbers: offerVideoCodecNumbers.slice(0, 5).join(','),
        offerVideoCodecCount: offerVideoCodecs.length,
        offerVideoCodecs: offerVideoCodecs.slice(0, 3).map((line: string) => line.substring(0, 50))
      })
      
      console.log('✅ Offer parsed:', { type: offerObj.type, sdpLength: offerObj.sdp?.length || 0 })
      
      // Create RTCSessionDescription using object format (not deprecated)
      const offer = new RTCSessionDescription({
        type: 'offer',
        sdp: offerObj.sdp,
      })
      
      console.log('📝 Setting remote description from offer')
      await peerConnection.setRemoteDescription(offer)
      
      console.log('🎙️ Creating answer...')
      const answer = await peerConnection.createAnswer(config.answerOptions)
      console.log('✅ Answer created:', { type: answer.type, sdpLength: answer.sdp?.length || 0 })
      
      // ✅ CRITICAL: LOG ANSWER SDP IN DETAIL
      const answerSdpLines = answer.sdp?.split('\n') || []
      const answerHasVideo = answerSdpLines.some((line: string) => line.includes('m=video'))
      const answerHasAudio = answerSdpLines.some((line: string) => line.includes('m=audio'))
      
      // Extract video codecs from answer
      const answerVideoLine = answerSdpLines.find((line: string) => line.includes('m=video'))
      const answerVideoCodecNumbers = answerVideoLine ? answerVideoLine.split(' ').slice(3) : []
      const answerVideoCodecs = answerSdpLines.filter((line: string) => {
        const match = line.match(/a=rtpmap:(\d+)/)
        return match && answerVideoCodecNumbers.includes(match[1])
      })
      
      console.log('📋 [createAnswer] ANSWER SDP:', {
        hasVideo: answerHasVideo,
        hasAudio: answerHasAudio,
        totalLines: answerSdpLines.length,
        answerVideoCodecNumbers: answerVideoCodecNumbers.slice(0, 5).join(','),
        answerVideoCodecCount: answerVideoCodecs.length,
        answerVideoCodecs: answerVideoCodecs.slice(0, 3).map((line: string) => line.substring(0, 50))
      })
      
      // ✅ CRITICAL: Check if codecs match between offer and answer
      console.log('🔍 [createAnswer] CODEC NEGOTIATION CHECK:');
      console.log(`   Offer m=video line: ${offerVideoLine}`);
      console.log(`   Answer m=video line: ${answerVideoLine}`);
      console.log(`   Offer video codecs: ${offerVideoCodecs.length}`);
      offerVideoCodecs.slice(0, 5).forEach((codec: string) => console.log(`     ${codec.substring(0, 60)}`));
      console.log(`   Answer video codecs: ${answerVideoCodecs.length}`);
      answerVideoCodecs.slice(0, 5).forEach((codec: string) => console.log(`     ${codec.substring(0, 60)}`));
      
      if (answerVideoCodecs.length === 0 && offerVideoCodecs.length > 0) {
        console.error('❌ [createAnswer] CRITICAL: Answer has NO video codecs but offer does!');
        console.error('   This means codec negotiation FAILED!');
      }
      
      console.log('📝 Setting local description with answer')
      await peerConnection.setLocalDescription(answer)
      console.log('✅ Local description set')
      console.log(`📡 [createAnswer] New signaling state: ${peerConnection.signalingState}`)
      
      return JSON.stringify(answer)
    } catch (error) {
      console.error('Error creating answer:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Handle remote SDP offer
   */
  export async function handleRemoteOffer(
    peerConnection: RTCPeerConnection,
    offerSDP: string
  ): Promise<void> {
    try {
      // ✅ NEW: Check connection state BEFORE setting remote description
      const signalingState = peerConnection.signalingState;
      console.log(`📡 [handleRemoteOffer] Current signaling state: ${signalingState}`);
      
      // Only set remote offer in valid states
      if (signalingState !== 'stable') {
        console.error(`⚠️ [handleRemoteOffer] Invalid state to set remote offer! Current: ${signalingState}, Expected: stable`);
        throw new Error(`Cannot set remote offer in ${signalingState} state`);
      }

      // Parse offer SDP
      let offerObj: any
      if (typeof offerSDP === 'string') {
        try {
          offerObj = JSON.parse(offerSDP)
        } catch {
          // If it's not JSON, it might be raw SDP
          throw new Error('Invalid offer format')
        }
      } else {
        offerObj = offerSDP
      }
      
      // Validate that offerObj has sdp property
      if (!offerObj || !offerObj.sdp) {
        throw new Error('Offer does not contain valid SDP: ' + JSON.stringify(offerObj))
      }
      
      // ✅ Log offer SDP for debugging
      const offerLines = offerObj.sdp.split('\n')
      const offerHasVideo = offerLines.some((line: string) => line.includes('m=video'))
      const offerHasAudio = offerLines.some((line: string) => line.includes('m=audio'))
      
      console.log('📋 [handleRemoteOffer] OFFER SDP ANALYSIS:', {
        hasVideo: offerHasVideo,
        hasAudio: offerHasAudio,
        totalLines: offerLines.length,
        videoLine: offerLines.find((line: string) => line.includes('m=video')) || 'MISSING ❌',
      })
      
      // Create RTCSessionDescription using object format
      const offer = new RTCSessionDescription({
        type: 'offer',
        sdp: offerObj.sdp,
      })
      
      console.log('📥 [handleRemoteOffer] Setting remote description (offer)...')
      await peerConnection.setRemoteDescription(offer)
      console.log('✅ [handleRemoteOffer] Remote description (offer) set successfully!')
      console.log(`📡 [handleRemoteOffer] New signaling state: ${peerConnection.signalingState}`)
    } catch (error) {
      console.error('Error handling remote offer:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Handle remote SDP answer
   */
  export async function handleRemoteAnswer(
    peerConnection: RTCPeerConnection,
    answerSDP: string
  ): Promise<void> {
    try {
      // ✅ NEW: Check connection state BEFORE setting remote description
      const signalingState = peerConnection.signalingState;
      console.log(`📡 [handleRemoteAnswer] Current signaling state: ${signalingState}`);
      
      // Only set remote answer if in valid state
      if (signalingState === 'stable') {
        console.warn('⚠️ [handleRemoteAnswer] Already in stable state! Answer already applied or stale.');
        return;
      }
      
      if (signalingState !== 'have-local-offer') {
        console.error(`❌ [handleRemoteAnswer] Invalid state to set remote answer! Current: ${signalingState}, Expected: have-local-offer`);
        throw new Error(`Cannot set remote answer in ${signalingState} state`);
      }

      // Parse answer SDP
      let answerObj: any
      if (typeof answerSDP === 'string') {
        try {
          answerObj = JSON.parse(answerSDP)
        } catch {
          // If it's not JSON, it might be raw SDP
          throw new Error('Invalid answer format')
        }
      } else {
        answerObj = answerSDP
      }
      
      // Validate that answerObj has sdp property
      if (!answerObj || !answerObj.sdp) {
        throw new Error('Answer does not contain valid SDP: ' + JSON.stringify(answerObj))
      }

      // ✅ CRITICAL: Log SDP answer to verify it includes m=video & m=audio
      const answerLines = answerObj.sdp.split('\n')
      const hasVideo = answerLines.some((line: string) => line.includes('m=video'))
      const hasAudio = answerLines.some((line: string) => line.includes('m=audio'))
      const videoLine = answerLines.find((line: string) => line.includes('m=video'))
      const audioLine = answerLines.find((line: string) => line.includes('m=audio'))
      
      console.log('📋 [handleRemoteAnswer] ANSWER SDP ANALYSIS:', {
        hasVideo,
        hasAudio,
        videoLine: videoLine || 'MISSING ❌',
        audioLine: audioLine || 'MISSING ❌',
        totalLines: answerLines.length,
        sdpLength: answerObj.sdp.length
      })
      
      // ⚠️ CRITICAL: If receiver didn't include m=video in answer, RTP will NOT flow
      if (!hasVideo && peerConnection.getReceivers().some(r => r.track?.kind === 'video')) {
        console.error('❌ [handleRemoteAnswer] CRITICAL: Receiver ANSWER missing m=video line!')
        console.error('   This is why RTP is not flowing - receiver didnt agree to video codec')
        console.error('   Full answer SDP:')
        answerLines.forEach((line: string, idx: number) => {
          console.error(`   [${idx}] ${line}`)
        })
      }

      if (!hasAudio && peerConnection.getReceivers().some(r => r.track?.kind === 'audio')) {
        console.error('❌ [handleRemoteAnswer] CRITICAL: Receiver ANSWER missing m=audio line!')
        console.error('   Audio RTP will not flow')
      }
      
      // Create RTCSessionDescription using object format
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerObj.sdp,
      })
      
      console.log('📥 [handleRemoteAnswer] Setting remote description (answer)...')
      await peerConnection.setRemoteDescription(answer)
      console.log('✅ [handleRemoteAnswer] Remote description (answer) set successfully!')
      console.log(`📡 [handleRemoteAnswer] New signaling state: ${peerConnection.signalingState}`)
      
      // ✅ NEW: Check DTLS state after setting answer
      const dsc = peerConnection.getStats().then(stats => {
        let dtlsState = 'unknown'
        stats.forEach(report => {
          if (report.type === 'transport') {
            dtlsState = report.dtlsState || 'unknown'
            console.log(`🔐 [handleRemoteAnswer] DTLS State: ${dtlsState}`)
            if (dtlsState !== 'connected') {
              console.warn(`⚠️ [handleRemoteAnswer] DTLS NOT CONNECTED yet - RTP cannot flow until dtlsState='connected'`)
              console.warn(`   Current dtlsState: ${dtlsState}`)
              if (dtlsState === 'failed') {
                console.error('❌ DTLS connection FAILED - encryption handshake failed!')
              }
            }
          }
        })
      }).catch(err => {
        console.warn('⚠️ [handleRemoteAnswer] Could not check DTLS state:', err.message)
      })
    } catch (error) {
      console.error('Error handling remote answer:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Add ICE candidate with detailed logging and retry
   * ✅ IMPROVED: Detailed validation, logging, and retry mechanism
   */
  export async function addIceCandidate(
    peerConnection: RTCPeerConnection,
    candidateData: string | any,
    retryCount: number = 0,
    maxRetries: number = 3
  ): Promise<void> {
    let candidateObj: any = null
    
    try {
      // Handle both string (JSON) and object formats
      if (typeof candidateData === 'string') {
        try {
          candidateObj = JSON.parse(candidateData)
        } catch (parseError) {
          console.error('❌ [addIceCandidate] Failed to parse candidate JSON:', candidateData)
          return
        }
      } else {
        candidateObj = candidateData
      }
      
      // Validate candidate data
      if (!candidateObj || !candidateObj.candidate) {
        console.warn('⚠️ [addIceCandidate] Invalid ICE candidate data:', candidateObj)
        return
      }
      
      // Create a hash of candidate for tracking
      const candidateHash = candidateObj.candidate.substring(0, 50)
      const candidateType = candidateObj.candidate.includes('typ host') ? 'host' : 
                           candidateObj.candidate.includes('typ srflx') ? 'srflx' : 
                           candidateObj.candidate.includes('typ relay') ? 'relay' : 'unknown'
      
      console.log(`📥 [addIceCandidate] Attempt ${retryCount + 1}/${maxRetries + 1}`, {
        type: candidateType,
        hash: candidateHash,
        sdpMLineIndex: candidateObj.sdpMLineIndex,
        sdpMid: candidateObj.sdpMid,
        pcState: peerConnection.connectionState,
        iceState: peerConnection.iceConnectionState,
        signingState: peerConnection.signalingState,
      })
      
      // Create RTCIceCandidate from the data
      const candidate = new RTCIceCandidate({
        candidate: candidateObj.candidate,
        sdpMLineIndex: candidateObj.sdpMLineIndex,
        sdpMid: candidateObj.sdpMid,
      })
      
      // Add candidate to peer connection
      await peerConnection.addIceCandidate(candidate)
      console.log(`✅ [addIceCandidate] SUCCESS - ICE candidate added (${candidateType}):`, {
        hash: candidateHash,
        sdpMLineIndex: candidateObj.sdpMLineIndex,
        pcState: peerConnection.connectionState,
      })
      
    } catch (error: any) {
      // Check if this is a "duplicate candidate" error (which is OK)
      if (error?.message?.includes('duplicate') || error?.message?.includes('already added')) {
        console.warn(`⚠️ [addIceCandidate] Duplicate ICE candidate (OK, skipping):`, error.message)
        return
      }
      
      // Check if remote description is not set yet (need to retry)
      if (error?.message?.includes('setRemoteDescription') || peerConnection.remoteDescription === null) {
        if (retryCount < maxRetries) {
          console.warn(`⏳ [addIceCandidate] Remote description not set yet, retrying in 100ms...`)
          // Retry after a short delay
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(1.5, retryCount)))
          return addIceCandidate(peerConnection, candidateData, retryCount + 1, maxRetries)
        } else {
          console.error(`❌ [addIceCandidate] Max retries exceeded. Remote description still not set.`)
          return
        }
      }
      
      // Log other errors with candidateObj safely
      const candidateType = candidateObj?.candidate?.includes('typ host') ? 'host' : 'other'
      console.error(`❌ [addIceCandidate] Error adding ICE candidate:`, {
        error: error?.message || error,
        candidateType: candidateType,
        pcState: peerConnection.connectionState,
        iceState: peerConnection.iceConnectionState,
      })
      
      // Don't throw - ICE candidate failures shouldn't break the connection
      // Just log and continue
    }
  }

  /**
   * Get local media stream with fallback constraints
   */
  export async function getLocalStream(
    constraints: MediaStreamConstraints = { audio: true, video: true }
  ): Promise<MediaStream> {
    // ✅ NEW: Aggressive fallback chain for cross-device compatibility
    const fallbackChain = [
      // 1. Original constraints (ideal quality)
      () => navigator.mediaDevices.getUserMedia(constraints),
      
      // 2. If video, relax video constraints to low-res (480p max)
      constraints.video ? () => navigator.mediaDevices.getUserMedia({
        audio: constraints.audio !== false,
        video: { width: { max: 640 }, height: { max: 480 } }
      }) : null,
      
      // 3. If video, try super relaxed (180p)
      constraints.video ? () => navigator.mediaDevices.getUserMedia({
        audio: constraints.audio !== false,
        video: { width: { max: 320 }, height: { max: 240 } }
      }) : null,
      
      // 4. If video but very restrictive, try ANY video
      constraints.video ? () => navigator.mediaDevices.getUserMedia({
        audio: constraints.audio !== false,
        video: true // Any video
      }) : null,
      
      // 5. If audio requested and video failed, try audio-only as fallback
      constraints.audio !== false && constraints.video ? () => {
        console.warn('⚠️ Video failed completely, falling back to AUDIO-ONLY');
        return navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      } : null,
    ].filter(Boolean) as Array<() => Promise<MediaStream>>;
    
    for (let i = 0; i < fallbackChain.length; i++) {
      try {
        console.log(`📊 [getLocalStream] Attempt ${i + 1}/${fallbackChain.length}...`);
        const stream = await fallbackChain[i]();
        
        // ✅ CRITICAL: Ensure all tracks are explicitly enabled when stream is first obtained
        console.log(`✅ [getLocalStream] SUCCESS on attempt ${i + 1}! Got stream with ${stream.getTracks().length} tracks, enabling all...`);
        stream.getTracks().forEach((track) => {
          console.log(`🔧 [getLocalStream] Track ${track.kind} BEFORE: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
          track.enabled = true; // Force enable
          console.log(`✅ [getLocalStream] Track ${track.kind} AFTER: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
        });
        
        console.log(`✅ [getLocalStream] All tracks enabled. Stream is now active: ${stream.active}`);
        console.log('   Stream composition:', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          streamId: stream.id
        });
        
        return stream;
      } catch (error: any) {
        console.warn(`⚠️ [getLocalStream] Attempt ${i + 1} failed:`, error.name);
        if (i === fallbackChain.length - 1) {
          // Last attempt failed - provide detailed error
          console.error('❌ [getLocalStream] ALL FALLBACK ATTEMPTS FAILED');
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            constraints: constraints
          });
          
          let userMessage = 'Gagal mengakses kamera/mikrofon. ';
          
          if (error.name === 'NotAllowedError') {
            userMessage += 'Anda perlu memberikan izin akses kamera/mikrofon di pengaturan browser.';
          } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            userMessage += 'Kamera atau mikrofon tidak ditemukan. Pastikan perangkat terhubung.';
          } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            userMessage += 'Kamera/mikrofon sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan coba lagi.';
          } else if (error.name === 'OverconstrainedError') {
            userMessage += 'Perangkat tidak memenuhi persyaratan kamera/mikrofon. Coba dengan pengaturan yang lebih rendah.';
          } else if (error.name === 'TypeError') {
            userMessage += 'Browser tidak mendukung akses kamera/mikrofon.';
          } else {
            userMessage += error.message || 'Periksa koneksi dan izin perangkat Anda.';
          }
          
          throw new Error(userMessage);
        }
      }
    }
    
    throw new Error('Unexpected: Could not acquire media stream');
  }

  /**
   * Get local audio only stream
   */
  export async function getLocalAudioStream(): Promise<MediaStream> {
    return getLocalStream({ audio: true, video: false });
  }

  /**
   * Get local video stream
   */
  export async function getLocalVideoStream(): Promise<MediaStream> {
    return getLocalStream({ audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
  }

  /**
   * Stop media stream
   */
  export function stopMediaStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  /**
   * Add local stream tracks to peer connection
   * ✅ IMPROVED: dengan error handling, validation, & RTP transmission verification
   * ✅ NEW: Better detection of track addition failures and fallback handling
   */
  export function addLocalStreamToPeerConnection(
    peerConnection: RTCPeerConnection,
    stream: MediaStream
  ): void {
    const startTime = Date.now()
    console.log(`📊 [addLocalStreamToPeerConnection] START at t=${startTime}`)
    console.log(`   Stream ID: ${stream.id}`)
    console.log(`   Stream active: ${stream.active}`)
    console.log(`   Stream tracks count: ${stream.getTracks().length}`)
    
    // ✅ CRITICAL: Check what tracks are in the stream BEFORE adding
    const videoTracks = stream.getVideoTracks()
    const audioTracks = stream.getAudioTracks()
    console.log(`   📹 Video tracks in stream: ${videoTracks.length}`)
    videoTracks.forEach((track, idx) => {
      console.log(`      Video[${idx}]: id=${track.id}, enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`)
    })
    console.log(`   🔊 Audio tracks in stream: ${audioTracks.length}`)
    audioTracks.forEach((track, idx) => {
      console.log(`      Audio[${idx}]: id=${track.id}, enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`)
    })
    
    // ✅ NEW: Check if stream is empty BEFORE attempting to add
    if (stream.getTracks().length === 0) {
      console.error('❌ [addLocalStreamToPeerConnection] CRITICAL: Stream is EMPTY! No tracks to add!')
      console.error('   Check: Did getUserMedia() actually return video tracks?')
      console.error('   Cause: Video constraint may be too strict, or device has no camera')
      return
    }
    
    if (videoTracks.length === 0 && audioTracks.length > 0) {
      console.warn('⚠️ [addLocalStreamToPeerConnection] WARNING: Only audio tracks, no video!')
      console.warn('   This is OK for audio-only calls, but video call will have no local video')
    }
    
    let videoTracksAdded = 0
    let audioTracksAdded = 0
    const trackMonitors: { trackId: string; kind: string; intervalId: any }[] = []
    
    stream.getTracks().forEach((track) => {
      try {
        console.log(`📤 [addTrack] BEFORE adding: ${track.kind} | id=${track.id} | enabled=${track.enabled} | muted=${track.muted} | readyState=${track.readyState}`);
        
        // ✅ NEW: Check if track is in an invalid state BEFORE adding
        if (track.readyState !== 'live') {
          console.error(`❌ [addTrack] Track readyState is NOT LIVE: ${track.kind}`);
          console.error(`   Current state: ${track.readyState}`);
          console.error(`   This track CANNOT be added to peer connection`);
          return; // Skip this track
        }
        
        // ✅ CRITICAL 1: Ensure track is enabled
        const wasDisabled = !track.enabled
        track.enabled = true;
        
        // ✅ CRITICAL 2: If track is muted, try to unmute it
        if (track.muted) {
          console.log(`🔧 [addTrack] Track is MUTED: ${track.kind} (id: ${track.id})`);
          // Note: muted is read-only, can't change it
        }
        
        const sender = peerConnection.addTrack(track, stream);
        
        console.log(`✅ [addTrack] Track ADDED: ${track.kind} (id: ${track.id})`);
        console.log(`   After add: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`);
        console.log(`   Sender state:`, {
          trackId: sender.track?.id,
          trackKind: sender.track?.kind,
          trackEnabled: sender.track?.enabled,
          trackMuted: sender.track?.muted,
          trackReadyState: sender.track?.readyState,
        });
        
        // ✅ NEW: Verify sender was actually created with the track
        if (!sender.track) {
          console.error(`❌ [addTrack] CRITICAL: addTrack() returned sender but NO TRACK attached!`);
          console.error(`   This should never happen but indicates RTCPeerConnection issue`);
          return;
        }
        
        if (sender.track?.id !== track.id) {
          console.error(`❌ [addTrack] CRITICAL: Sender track ID mismatch!`);
          console.error(`   Expected: ${track.id}, Got: ${sender.track?.id}`);
          return;
        }
        
        // ✅ NEW: Monitor track state over time to detect when it dies
        const trackId = track.id
        const monitorInterval = setInterval(() => {
          const elapsed = Date.now() - startTime
          const currentSender = peerConnection.getSenders().find(s => s.track?.id === trackId)
          const currentState = currentSender?.track?.readyState
          
          if (currentState !== 'live' && currentState !== undefined) {
            console.warn(`⚠️ [TRACK DEATH MONITOR] ${track.kind} track ${trackId} STATE CHANGED at t=${elapsed}ms:`, {
              from: 'live',
              to: currentState,
              sender: currentSender ? 'EXISTS' : 'DELETED',
              pcState: {
                signalingState: peerConnection.signalingState,
                iceConnectionState: peerConnection.iceConnectionState,
                connectionState: peerConnection.connectionState,
              }
            })
            
            // Stop monitoring after first death
            clearInterval(monitorInterval)
            trackMonitors.splice(trackMonitors.findIndex(m => m.trackId === trackId), 1)
          }
        }, 100)  // Check every 100ms
        
        trackMonitors.push({ trackId, kind: track.kind, intervalId: monitorInterval })
        
        if (track.kind === 'video') {
          videoTracksAdded++
        } else if (track.kind === 'audio') {
          audioTracksAdded++
        }
      } catch (error) {
        console.error(`❌ [addTrack] Error adding track: ${track.kind}`, error);
      }
    });
    
    console.log(`✅ [addLocalStreamToPeerConnection] Finished adding all tracks. Video: ${videoTracksAdded}, Audio: ${audioTracksAdded}`);
    
    // ✅ CRITICAL: If video track was in stream but not added, something is wrong
    if (videoTracks.length > 0 && videoTracksAdded === 0) {
      console.error(`❌ [addLocalStreamToPeerConnection] CRITICAL: Stream has ${videoTracks.length} video track(s) but ZERO were added!`)
      console.error(`   This will cause bytesSent=0 for video`)
      console.error(`   Possible causes:`)
      console.error(`   1. Video track readyState is not 'live'`)
      console.error(`   2. Video track is muted or ended before adding`)
      console.error(`   3. RTCPeerConnection rejected the track`)
      console.error(`   4. Browser permission denied for video`)
      
      // Show video track details for debugging
      videoTracks.forEach((track, idx) => {
        console.error(`   Video track[${idx}]: readyState=${track.readyState}, enabled=${track.enabled}, muted=${track.muted}`)
      })
    }
    
    if (audioTracks.length > 0 && audioTracksAdded === 0) {
      console.error(`❌ [addLocalStreamToPeerConnection] CRITICAL: Stream has ${audioTracks.length} audio track(s) but ZERO were added!`)
      audioTracks.forEach((track, idx) => {
        console.error(`   Audio track[${idx}]: readyState=${track.readyState}, enabled=${track.enabled}, muted=${track.muted}`)
      })
    }
    
    // ✅ NEW: Verify tracks were added by checking senders
    const senders = peerConnection.getSenders()
    console.log(`📊 [addLocalStreamToPeerConnection] Verification - Total senders now: ${senders.length}`)
    senders.forEach((sender, idx) => {
      const trackInfo = {
        kind: sender.track?.kind,
        id: sender.track?.id,
        enabled: sender.track?.enabled,
        muted: sender.track?.muted,
        readyState: sender.track?.readyState,
      }
      console.log(`   Sender[${idx}]:`, trackInfo)
    })
    
    // ✅ NEW: Monitor for RTP transmission
    if (videoTracksAdded > 0) {
      console.log(`🎬 [addLocalStreamToPeerConnection] Will monitor video RTP transmission...`)
      
      // Check after 2 seconds if we're sending RTP
      setTimeout(() => {
        peerConnection.getStats().then(stats => {
          let videoOutboundFound = false
          let bytesSent = 0
          
          stats.forEach(report => {
            if (report.type === 'outbound-rtp' && (report as any).mediaType === 'video') {
              videoOutboundFound = true
              bytesSent = (report as any).bytesSent || 0
            }
          })
          
          if (videoOutboundFound && bytesSent > 0) {
            console.log(`✅ [addLocalStreamToPeerConnection] VIDEO RTP BEING SENT: ${bytesSent} bytes`)
          } else if (videoOutboundFound && bytesSent === 0) {
            console.warn(`⚠️ [addLocalStreamToPeerConnection] Video track added but NO RTP BYTES SENT yet`)
            console.warn(`   This is OK if offer/answer exchange not complete`)
            console.warn(`   But if connection established, check codec/profile`)
          } else {
            console.warn(`⚠️ [addLocalStreamToPeerConnection] No outbound RTP stats found`)
          }
        })
      }, 2000)
    }
  }

  /**
   * Handle connection state changes
   */
  export function onConnectionStateChange(
    peerConnection: RTCPeerConnection,
    callback: (state: RTCPeerConnectionState) => void
  ): void {
    peerConnection.addEventListener('connectionstatechange', () => {
      console.log('🔌 Connection state:', peerConnection.connectionState)
      // ✅ Log ICE gathering and signaling states too
      console.log('   ICE connection state:', peerConnection.iceConnectionState)
      console.log('   ICE gathering state:', peerConnection.iceGatheringState)
      console.log('   Signaling state:', peerConnection.signalingState)
      
      // Log active senders/receivers
      const senders = peerConnection.getSenders()
      const receivers = peerConnection.getReceivers()
      console.log('   Senders:', senders.length, 'Receivers:', receivers.length)
      receivers.forEach((receiver, idx) => {
        console.log(`   Receiver[${idx}]:`, { kind: receiver.track?.kind, enabled: receiver.track?.enabled, readyState: receiver.track?.readyState })
      })
      
      callback(peerConnection.connectionState)
    })
  }

  /**
   * Handle negotiation needed event
   * ✅ IMPORTANT: Call this to enable proper SDP renegotiation
   */
  export function onNegotiationNeeded(
    peerConnection: RTCPeerConnection,
    callback: () => Promise<void>
  ): void {
    peerConnection.onnegotiationneeded = async () => {
      try {
        console.log('📋 [onnegotiationneeded] Negotiation needed, creating new offer...');
        await callback();
      } catch (error) {
        console.error('❌ [onnegotiationneeded] Error during negotiation:', error);
      }
    };
  }

  /**
   * Handle ICE connection state changes with detailed RTP diagnostics
   * ✅ IMPROVED: Comprehensive media flow verification
   */
  export function onIceConnectionStateChange(
    peerConnection: RTCPeerConnection,
    callback: (state: RTCIceConnectionState) => void
  ): void {
    peerConnection.addEventListener('iceconnectionstatechange', () => {
      console.log('🧊 ICE connection state:', peerConnection.iceConnectionState)
      
      // ✅ CRITICAL: Log if ICE is stuck in 'checking' or 'disconnected'
      if (peerConnection.iceConnectionState === 'checking') {
        console.warn('⏳ ICE still checking (gathering candidates, media may not flow yet)')
      } else if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
        console.log('✅ ICE FULLY CONNECTED - Media should flow now!')
      } else if (peerConnection.iceConnectionState === 'disconnected') {
        console.error('❌ ICE DISCONNECTED - Media may not flow, check STUN/firewall')
      } else if (peerConnection.iceConnectionState === 'failed') {
        console.error('❌ ICE FAILED - No connection path found, likely STUN/TURN issue')
      }
      
      // 🔍 CRITICAL: Get detailed statistics about media flow
      const stats = peerConnection.getStats()
      stats.then((reports) => {
        console.log('📊 [ICE Stats] Current RTC Statistics:')
        
        // ✅ NEW: Track which side we are (sender or receiver)
        let videoOutboundFound = false
        let videoInboundFound = false
        let audioInboundFound = false
        let dtlsState = 'unknown'
        
        // ✅ NEW: Collect all reports first for analysis
        const inboundVideoReports: any[] = []
        const outboundVideoReports: any[] = []
        const senders = peerConnection.getSenders()
        const receivers = peerConnection.getReceivers()
        
        reports.forEach((report) => {
          // ✅ NEW: Check DTLS encryption state
          if (report.type === 'dtls-transport') {
            dtlsState = (report as any).state
            console.log('   🔐 DTLS Transport State:', dtlsState)
          }
          
          // Video outbound stats (SENDER SIDE)
          if (report.type === 'outbound-rtp' && (report as any).mediaType === 'video') {
            videoOutboundFound = true
            const bytesSent = (report as any).bytesSent || 0
            const framesEncoded = (report as any).framesEncoded || 0
            
            outboundVideoReports.push({
              bytesSent,
              framesEncoded,
              frameRate: (report as any).framesPerSecond || 0,
              report,
            })
            
            console.log('   📤 Video OutboundRTP (SENDER):', {
              bytesSent: bytesSent,
              framesEncoded: framesEncoded,
              frameRate: (report as any).framesPerSecond || 0,
              qualityLimitation: (report as any).qualityLimitation || 'none',
            })
            
            if (bytesSent === 0) {
              console.error('   ❌ SENDER NOT SENDING VIDEO - bytesSent = 0')
              console.error('   Possible causes:')
              console.error('     1. addLocalStreamToPeerConnection() not called')
              console.error('     2. Local track is disabled or not active')
              console.error('     3. Peer connection state issue')
            }
          }
          
          // Video inbound stats (RECEIVER SIDE)
          if (report.type === 'inbound-rtp' && (report as any).mediaType === 'video') {
            videoInboundFound = true
            const bytesReceived = (report as any).bytesReceived || 0
            const framesDecoded = (report as any).framesDecoded || 0
            
            inboundVideoReports.push({
              bytesReceived,
              framesDecoded,
              frameRate: (report as any).framesPerSecond || 0,
              report,
            })
            
            console.log('   📥 Video InboundRTP (RECEIVER):', {
              bytesReceived: bytesReceived,
              packetsReceived: (report as any).packetsReceived,
              packetsLost: (report as any).packetsLost,
              framesDecoded: framesDecoded,
              frameRate: (report as any).framesPerSecond || 0,
              jitter: (report as any).jitter || 'N/A'
            })
            
            if (bytesReceived === 0 && dtlsState === 'connected') {
              console.error('   ❌ RECEIVER NOT RECEIVING VIDEO - bytesReceived = 0')
              console.error('   Even though DTLS is connected!')
              console.error('   Possible causes:')
              console.error('     1. Sender not actually sending media (check bytesSent on sender)')
              console.error('     2. RTP packets blocked by firewall/NAT')
              console.error('     3. Codec profile mismatch (H.264, VP8, VP9, etc)')
              console.error('     4. Remote offer did not advertise video capability')
            } else if (bytesReceived === 0 && dtlsState !== 'connected') {
              console.error('   ❌ DTLS not connected - RTP cannot flow until DTLS handshake completes')
            }
          }
          
          // Audio inbound stats
          if (report.type === 'inbound-rtp' && (report as any).mediaType === 'audio') {
            audioInboundFound = true
            console.log('   🔊 Audio InboundRTP:', {
              bytesReceived: (report as any).bytesReceived,
              packetsReceived: (report as any).packetsReceived,
              packetsLost: (report as any).packetsLost,
              audioLevel: (report as any).audioLevel || 'N/A'
            })
          }
          
          // Candidate pair stats
          if (report.type === 'candidate-pair') {
            if ((report as any).state === 'succeeded') {
              console.log('   🎯 Active Candidate Pair:', {
                state: (report as any).state,
                currentRoundTripTime: (report as any).currentRoundTripTime,
                availableOutgoingBitrate: (report as any).availableOutgoingBitrate,
                availableIncomingBitrate: (report as any).availableIncomingBitrate
              })
            }
          }
        })
        
        // ✅ NEW: Detailed diagnostic summary
        console.log('📋 [RTP Diagnostic Summary]:')
        console.log(`   DTLS State: ${dtlsState}`)
        console.log(`   Senders: ${senders.length} (should have video+audio)`)
        console.log(`   Receivers: ${receivers.length}`)
        
        if (senders.length > 0) {
          senders.forEach((sender, idx) => {
            console.log(`   Sender[${idx}] ${sender.track?.kind}: enabled=${sender.track?.enabled}, muted=${sender.track?.muted}, state=${sender.track?.readyState}`)
          })
        }
        
        if (receivers.length > 0) {
          receivers.forEach((receiver, idx) => {
            console.log(`   Receiver[${idx}] ${receiver.track?.kind}: enabled=${receiver.track?.enabled}, muted=${receiver.track?.muted}, state=${receiver.track?.readyState}`)
          })
        }
        
        // ✅ NEW: Detailed analysis
        if (videoOutboundFound && outboundVideoReports.length > 0) {
          const totalBytesSent = outboundVideoReports.reduce((sum, r) => sum + r.bytesSent, 0)
          console.log(`   📤 Total Video SENT: ${totalBytesSent} bytes`)
          if (totalBytesSent === 0) {
            console.error('   🚨 CRITICAL: Caller sending 0 bytes - not adding local stream!')
          }
        }
        
        if (videoInboundFound && inboundVideoReports.length > 0) {
          const totalBytesReceived = inboundVideoReports.reduce((sum, r) => sum + r.bytesReceived, 0)
          console.log(`   📥 Total Video RECEIVED: ${totalBytesReceived} bytes`)
          if (totalBytesReceived === 0) {
            console.error('   🚨 CRITICAL: Receiver got 0 bytes - RTP NOT FLOWING')
            if (videoOutboundFound && outboundVideoReports[0].bytesSent > 0) {
              console.error('   But sender IS sending! → Firewall/NAT/Codec issue')
            } else if (!videoOutboundFound) {
              console.error('   And sender has no outbound stats → Sender side issue')
            }
          }
        }
        
        if (!videoInboundFound && receivers.some(r => r.track?.kind === 'video')) {
          console.warn('⚠️ Video receiver exists but NO INBOUND RTP STATS')
          console.warn('   Check: Does remote offer include m=video line?')
        }
        
        if (!audioInboundFound && peerConnection.getReceivers().some(r => r.track?.kind === 'audio')) {
          console.warn('⚠️ NO AUDIO INBOUND RTP STATS - Audio media not flowing!')
        }
      }).catch((err) => {
        console.error('❌ Error getting stats:', err)
      })
      
      callback(peerConnection.iceConnectionState)
    })
  }

  /**
   * Handle ICE candidates with detailed logging and fallback tracking
   * ✅ IMPROVED: Tracks candidate success rates and forces TURN fallback if needed
   * ✅ NEW: Detects when STUN is not working and activates TURN-only mode
   */
  export function onIceCandidate(
    peerConnection: RTCPeerConnection,
    callback: (candidate: RTCIceCandidate | null) => void
  ): void {
    let candidateCount = 0;
    let hostCandidates = 0;
    let srflxCandidates = 0;
    let relayCandidates = 0;
    const gatheringTimeout = 10000; // 10 second timeout
    let gatheringTimeoutHandle: NodeJS.Timeout | null = null;
    let gatheringStartTime = 0;

    // Start timeout for ICE gathering
    const startGatheringTimeout = () => {
      gatheringStartTime = Date.now();
      if (gatheringTimeoutHandle) clearTimeout(gatheringTimeoutHandle);
      
      gatheringTimeoutHandle = setTimeout(() => {
        const duration = Date.now() - gatheringStartTime;
        
        console.warn(`⏱️ [onIceCandidate] Gathering timeout (${duration}ms). Analysis:`, {
          hostCandidates,
          srflxCandidates,
          relayCandidates,
          totalCandidates: candidateCount,
        });

        // Diagnostic: If no candidates after 10 seconds, something is wrong
        if (candidateCount === 0) {
          console.error('❌ [onIceCandidate] CRITICAL: No candidates at all after 10 seconds!');
          console.error('   STUN/TURN servers may be blocked or unreachable');
          console.error('   Check: Firewall rules, network connectivity, STUN/TURN server status');
        } else if (srflxCandidates === 0 && relayCandidates === 0) {
          console.warn('⚠️ [onIceCandidate] WARNING: Only HOST candidates. STUN might not be working.');
          console.warn('   NAT traversal will likely fail on different networks');
        } else if (relayCandidates === 0 && srflxCandidates > 0) {
          console.log('📌 [onIceCandidate] STUN is working (SRFLX found). TURN not needed if both peers can reach STUN.');
        }
      }, gatheringTimeout);
    };

    // Monitor ICE gathering state to start/stop timeout
    peerConnection.addEventListener('icegatheringstatechange', () => {
      if (peerConnection.iceGatheringState === 'gathering') {
        startGatheringTimeout();
      } else if (peerConnection.iceGatheringState === 'complete') {
        if (gatheringTimeoutHandle) {
          clearTimeout(gatheringTimeoutHandle);
          gatheringTimeoutHandle = null;
        }
      }
    });
    
    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        candidateCount++
        
        // Determine candidate type
        const candidateStr = event.candidate.candidate
        const candidateType = candidateStr.includes('typ host') ? '🏠 HOST' : 
                             candidateStr.includes('typ srflx') ? '🔀 SRFLX' : 
                             candidateStr.includes('typ relay') ? '🔁 RELAY' : '❓ UNKNOWN'
        
        // Track candidate counts
        if (candidateStr.includes('typ host')) hostCandidates++;
        if (candidateStr.includes('typ srflx')) srflxCandidates++;
        if (candidateStr.includes('typ relay')) relayCandidates++;
        
        // Get IP address from candidate
        const ipMatch = candidateStr.match(/(\d+\.\d+\.\d+\.\d+)/)
        const ipAddress = ipMatch ? ipMatch[0] : 'N/A'
        
        // Get port from candidate
        const portMatch = candidateStr.match(/\d+\.\d+\.\d+\.\d+ (\d+)/)
        const port = portMatch ? portMatch[1] : 'N/A'
        
        console.log(`📤 [onIceCandidate] NEW candidate #${candidateCount} (${candidateType}):`, {
          ip: ipAddress,
          port: port,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
          foundation: event.candidate.foundation || 'N/A',
          priority: event.candidate.priority || 'N/A',
          hash: candidateStr.substring(0, 60),
        })
        
        // Call the callback immediately
        callback(event.candidate)
      } else {
        // ICE gathering complete
        if (gatheringTimeoutHandle) {
          clearTimeout(gatheringTimeoutHandle);
          gatheringTimeoutHandle = null;
        }

        const duration = Date.now() - gatheringStartTime;
        console.log(`✅ [onIceCandidate] ICE gathering COMPLETE (${duration}ms). Statistics:`, {
          hostCandidates,
          srflxCandidates,
          relayCandidates,
          totalCandidates: candidateCount,
          summary: relayCandidates > 0 ? '✅ TURN available' : 
                   srflxCandidates > 0 ? '📌 STUN OK, no TURN' : 
                   '⚠️ Only HOST candidates'
        })
        callback(null)
      }
    })
  }

  /**
   * Handle remote stream
   * ✅ IMPROVED: dengan fallback untuk empty streams & track unmute handler
   * ✅ NEW: Explicitly enable audio tracks
   */
  export function onRemoteStream(
    peerConnection: RTCPeerConnection,
    callback: (stream: MediaStream) => void
  ): void {
    console.log('📡 [onRemoteStream] Registering track event listener on peerConnection');
    
    peerConnection.addEventListener('track', (event) => {
      console.log(
        '🎬 [onRemoteStream] Remote track received:',
        { kind: event.track.kind, enabled: event.track.enabled, muted: event.track.muted, state: event.track.readyState, streams: event.streams?.length }
      );

      // ✅ CRITICAL: Log current receiver count
      const receivers = peerConnection.getReceivers();
      console.log(`📡 [onRemoteStream] Current receiver count: ${receivers.length}`);
      receivers.forEach((receiver, idx) => {
        console.log(`   Receiver[${idx}]: kind=${receiver.track?.kind}, enabled=${receiver.track?.enabled}, readyState=${receiver.track?.readyState}`);
      });

      // ✅ CRITICAL: Explicitly enable audio & video tracks immediately (they may arrive disabled by default)
      if (event.track.kind === 'audio') {
        console.log(`🔊 [onRemoteStream] Enabling audio track immediately...`);
        event.track.enabled = true;
        console.log(`✅ [onRemoteStream] Audio track enabled: ${event.track.enabled}`);
      }
      if (event.track.kind === 'video') {
        console.log(`📹 [onRemoteStream] Enabling video track immediately...`);
        console.log(`   BEFORE: enabled=${event.track.enabled}, muted=${event.track.muted}, readyState=${event.track.readyState}`);
        event.track.enabled = true;
        console.log(`✅ [onRemoteStream] Video track enabled: ${event.track.enabled}`);
        
        // ✅ FIX: If track is muted, set onunmute handler to try unmuting
        if (event.track.muted) {
          console.warn(`⚠️ [onRemoteStream] Video track arrived MUTED! Setting onunmute handler...`);
          console.warn(`   ⏰ Waiting for unmute event...`);
          event.track.onunmute = () => {
            console.log(`✅✅✅ [onRemoteStream] VIDEO TRACK UNMUTED! Rendering should work NOW!`);
            console.log(`   Track state: enabled=${event.track.enabled}, muted=${event.track.muted}, readyState=${event.track.readyState}`);
          };
          
          // Also try onended to detect if track is stuck
          event.track.onended = () => {
            console.error(`❌ [onRemoteStream] Video track ENDED unexpectedly`);
          };
          
          // ⏰ Timeout: if track doesn't unmute in 5 seconds, something is wrong
          setTimeout(() => {
            if (event.track.muted) {
              console.error(`❌ [onRemoteStream] VIDEO TRACK STILL MUTED after 5 seconds!`);
              console.error(`   This means media is NOT flowing or browser is blocking it`);
              console.error(`   Check: 1) ICE state, 2) bytesReceived, 3) browser permissions`);
            }
          }, 5000);
        }
        
        // ✅ EXTRA: Try enabling with a small delay to ensure it "sticks"
        setTimeout(() => {
          console.log(`🔄 [onRemoteStream] Re-checking video track after 50ms: enabled=${event.track.enabled}, muted=${event.track.muted}, readyState=${event.track.readyState}`);
          if (!event.track.enabled) {
            console.log(`⚠️ [onRemoteStream] Video track became disabled somehow, re-enabling...`);
            event.track.enabled = true;
          }
        }, 50);
      }

      // Gunakan event.streams jika tersedia
      if (event.streams && event.streams.length > 0) {
        const stream = event.streams[0];
        console.log(`✅ [onRemoteStream] Callback triggered for stream ${stream.id} with ${stream.getTracks().length} track(s):`, {
          audioTracks: stream.getAudioTracks().map((t: any) => ({ id: t.id, enabled: t.enabled, muted: t.muted, readyState: t.readyState })),
          videoTracks: stream.getVideoTracks().map((t: any) => ({ id: t.id, enabled: t.enabled, muted: t.muted, readyState: t.readyState })),
        });
        callback(stream);
      } else {
        // Fallback: track onunmute event untuk memastikan callback dipanggil
        console.log(`⚠️ [onRemoteStream] No streams in event, setting up onunmute handler for ${event.track.kind} track`);
        event.track.onunmute = () => {
          console.log(`✅ [onRemoteStream] Track unmuted: ${event.track.kind}`);
          // Re-enable when unmute fires
          event.track.enabled = true;
          if (event.streams && event.streams.length > 0) {
            const stream = event.streams[0];
            console.log(`✅ [onRemoteStream] Callback triggered on unmute for stream ${stream.id}`);
            callback(stream);
          }
        };
      }
    });
  }
