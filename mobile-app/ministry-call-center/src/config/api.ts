/**
 * API Configuration for Ministry Call Center Mobile App
 */

export const API_CONFIG = {
  // Backend API URL (ngrok)
  baseURL: 'https://rhett-yearlong-gregory.ngrok-free.dev',
  
  // WebRTC/SIP Configuration
  webrtc: {
    // Asterisk WebSocket URL (local network IP)
    wsServer: 'ws://192.168.1.17:8088/ws',
    
    // SIP credentials for mobile user
    sipUri: 'sip:webrtc_user@192.168.1.17',
    password: 'mobile_user_password',
    displayName: 'Mobile User',
    
    // STUN servers for NAT traversal
    stunServers: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
    ],
  },
  
  // Ministry hotline extension (main IVR entry point)
  hotlineExtension: '1000',
  
  // IVR options
  ivrOptions: [
    { value: '1', label: 'Exam Inquiries', icon: '📚' },
    { value: '2', label: 'Teacher Complaints', icon: '👨‍🏫' },
    { value: '3', label: 'Facilities', icon: '🏫' },
    { value: '4', label: 'Other Services', icon: '📞' },
  ],
};

export default API_CONFIG;
