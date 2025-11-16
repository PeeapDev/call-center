/**
 * Application Configuration
 * 
 * To use with ngrok:
 * 1. Start backend: cd backend && npm run start:dev
 * 2. Start ngrok: ngrok http 3001
 * 3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
 * 4. Update BACKEND_URL below
 */

// CHANGE THIS TO YOUR NGROK URL!
// Example: export const BACKEND_URL = 'https://abc123.ngrok.io';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// WebSocket URL (for WebRTC)
export const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');

// API endpoints
export const API_ENDPOINTS = {
  health: `${BACKEND_URL}/health`,
  
  // AI
  aiChat: `${BACKEND_URL}/ai/chat`,
  aiKeys: `${BACKEND_URL}/ai/api-keys`,
  aiDocuments: `${BACKEND_URL}/ai/documents`,
  aiUpload: `${BACKEND_URL}/ai/upload`,
  
  // HR
  hrUsers: `${BACKEND_URL}/hr/users`,
  hrWebRTCConfig: `${BACKEND_URL}/hr/webrtc-config`,
  
  // Support Chat
  supportChat: `${BACKEND_URL}/support-chat/conversations`,
  supportMessages: `${BACKEND_URL}/support-chat/messages`,
  
  // Asterisk
  asteriskStatus: `${BACKEND_URL}/asterisk/status`,
  asteriskChannels: `${BACKEND_URL}/asterisk/channels`,
  
  // API Keys
  apiKeys: `${BACKEND_URL}/api-keys`,
  
  // Settings
  settings: `${BACKEND_URL}/settings`,
};

// Helper function to build URLs
export function buildApiUrl(endpoint: string): string {
  return `${BACKEND_URL}${endpoint}`;
}

// Helper function for WebSocket URLs
export function getWebSocketUrl(path: string = '/ws'): string {
  return `${WS_URL}${path}`;
}

// Export for easy access
export default {
  BACKEND_URL,
  WS_URL,
  API_ENDPOINTS,
  buildApiUrl,
  getWebSocketUrl,
};
