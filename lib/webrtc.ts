// WebRTC utility functions for peer-to-peer communication

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  offerOptions?: RTCOfferOptions;
  answerOptions?: RTCAnswerOptions;
}

export const defaultWebRTCConfig: WebRTCConfig = {
  // STUN servers untuk NAT traversal (gratis & aman)
  // Gunakan multiple servers untuk redundansi & keamanan
  iceServers: [
    // Google STUN (gratis, reliable)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    
    // Backup: Mozilla STUN (fallback jika Google down)
    { urls: 'stun:stun.services.mozilla.com:3478' },
    
    // Backup: stunprotocol.org
    { urls: 'stun:stun.stunprotocol.org:3478' },
    
    // OPTIONAL: Jika ada TURN server sendiri (untuk enkripsi + relay)
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
  answerOptions: {},
};

/**
 * Create a new RTCPeerConnection
 */
export function createPeerConnection(config: WebRTCConfig = defaultWebRTCConfig): RTCPeerConnection {
  const peerConnection = new RTCPeerConnection({
    iceServers: config.iceServers,
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
    const offer = await peerConnection.createOffer(config.offerOptions);
    await peerConnection.setLocalDescription(offer);
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
    
    // Create RTCSessionDescription using object format (not deprecated)
    const offer = new RTCSessionDescription({
      type: 'offer',
      sdp: offerObj.sdp,
    })
    
    await peerConnection.setRemoteDescription(offer)
    
    const answer = await peerConnection.createAnswer(config.answerOptions)
    await peerConnection.setLocalDescription(answer)
    
    return JSON.stringify(answer)
  } catch (error) {
    console.error('Error creating answer:', error)
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
    
    // Create RTCSessionDescription using object format
    const offer = new RTCSessionDescription({
      type: 'offer',
      sdp: offerObj.sdp,
    })
    
    await peerConnection.setRemoteDescription(offer)
  } catch (error) {
    console.error('Error handling remote offer:', error)
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
    
    // Create RTCSessionDescription using object format
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: answerObj.sdp,
    })
    
    await peerConnection.setRemoteDescription(answer)
  } catch (error) {
    console.error('Error handling remote answer:', error)
    throw error
  }
}

/**
 * Add ICE candidate
 */
export async function addIceCandidate(
  peerConnection: RTCPeerConnection,
  candidateData: string | any
): Promise<void> {
  try {
    // Handle both string (JSON) and object formats
    let candidateObj: any
    
    if (typeof candidateData === 'string') {
      candidateObj = JSON.parse(candidateData)
    } else {
      candidateObj = candidateData
    }
    
    // Validate candidate data
    if (!candidateObj || !candidateObj.candidate) {
      console.warn('Invalid ICE candidate data:', candidateObj)
      return
    }
    
    // Create RTCIceCandidate from the data
    const candidate = new RTCIceCandidate({
      candidate: candidateObj.candidate,
      sdpMLineIndex: candidateObj.sdpMLineIndex,
      sdpMid: candidateObj.sdpMid,
    })
    
    await peerConnection.addIceCandidate(candidate)
    console.log('✅ ICE candidate added successfully')
  } catch (error) {
    console.error('Error adding ICE candidate:', error)
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
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error: any) {
    console.error('Error getting local stream:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Try fallback: relax constraints if initial request failed
    if (constraints.video) {
      console.warn('⚠️ Video constraints too strict, trying with relaxed constraints...');
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio: constraints.audio !== false,
          video: { width: { max: 640 }, height: { max: 480 } } // Relaxed video constraints
        });
        console.log('✅ Stream acquired with relaxed constraints');
        return fallbackStream;
      } catch (fallbackError: any) {
        console.error('Fallback failed:', fallbackError);
      }
    }
    
    // If still failing, provide detailed error
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
 */
export function addLocalStreamToPeerConnection(
  peerConnection: RTCPeerConnection,
  stream: MediaStream
): void {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
}

/**
 * Handle connection state changes
 */
export function onConnectionStateChange(
  peerConnection: RTCPeerConnection,
  callback: (state: RTCPeerConnectionState) => void
): void {
  peerConnection.addEventListener('connectionstatechange', () => {
    console.log('Connection state:', peerConnection.connectionState);
    callback(peerConnection.connectionState);
  });
}

/**
 * Handle ICE connection state changes
 */
export function onIceConnectionStateChange(
  peerConnection: RTCPeerConnection,
  callback: (state: RTCIceConnectionState) => void
): void {
  peerConnection.addEventListener('iceconnectionstatechange', () => {
    console.log('ICE connection state:', peerConnection.iceConnectionState);
    callback(peerConnection.iceConnectionState);
  });
}

/**
 * Handle ICE candidates
 */
export function onIceCandidate(
  peerConnection: RTCPeerConnection,
  callback: (candidate: RTCIceCandidate) => void
): void {
  peerConnection.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      console.log('New ICE candidate:', event.candidate);
      callback(event.candidate);
    }
  });
}

/**
 * Handle remote stream
 */
export function onRemoteStream(
  peerConnection: RTCPeerConnection,
  callback: (stream: MediaStream) => void
): void {
  peerConnection.addEventListener('track', (event) => {
    console.log('Remote track received:', event.track);
    callback(event.streams[0]);
  });
}
