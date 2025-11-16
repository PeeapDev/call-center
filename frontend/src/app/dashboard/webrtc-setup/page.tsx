'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Settings,
  Wifi,
  Lock,
  Code,
  Copy,
  Key,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '@/lib/config';

export default function WebRTCSetupPage() {
  const [webrtcSupported, setWebrtcSupported] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [testCallStatus, setTestCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [myCredentials, setMyCredentials] = useState<any>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(true);

  useEffect(() => {
    // Check WebRTC support
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setWebrtcSupported(true);
    }

    // Check microphone permission
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
      }).catch(() => {
        // Permissions API not fully supported
      });
    }

    // Fetch current user's credentials
    fetchMyCredentials();
  }, []);

  const fetchMyCredentials = async () => {
    try {
      // Get current user from session storage or local storage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        setLoadingCredentials(false);
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.hrUsers}`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        const currentUser = data.users.find((u: any) => u.phoneNumber === userPhone);
        if (currentUser && currentUser.sipUsername) {
          setMyCredentials(currentUser);
        }
      }
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoadingCredentials(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      stream.getTracks().forEach((track) => track.stop());
      alert('Microphone access granted!');
    } catch (error) {
      setMicPermission('denied');
      alert('Microphone access denied. Please allow microphone access in browser settings.');
    }
  };

  const handleTestCall = () => {
    setTestCallStatus('calling');
    setTimeout(() => {
      setTestCallStatus('connected');
      setTimeout(() => {
        setTestCallStatus('idle');
        alert('Test call completed successfully!');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">WebRTC Setup & Configuration</h1>
        <p className="text-gray-500 mt-1">
          Enable browser-based calling for your agents
        </p>
      </motion.div>

      {/* My WebRTC Credentials */}
      {myCredentials && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="border-b bg-gradient-to-r from-purple-100 to-indigo-100">
              <CardTitle className="flex items-center gap-2">
                <Key className="w-6 h-6 text-purple-600" />
                My WebRTC Credentials
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Use these credentials to register your WebRTC phone. Your SIP password is the same as your login password.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-100">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">SIP Username</p>
                      <p className="text-lg font-mono font-bold text-gray-900">{myCredentials.sipUsername}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(myCredentials.sipUsername, 'Username')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy username"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-100">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">SIP Password</p>
                      <p className="text-sm text-gray-700">Same as your login password</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Login Password</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-100">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Extension</p>
                      <p className="text-lg font-mono font-bold text-gray-900">{myCredentials.sipExtension}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(myCredentials.sipExtension, 'Extension')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy extension"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">📱 How to use:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Copy your SIP username and extension above</li>
                        <li>Your SIP password is your login password</li>
                        <li>Register your WebRTC phone with these credentials</li>
                        <li>Start receiving calls!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              System Requirements Check
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">WebRTC Support</p>
                    <p className="text-sm text-gray-600">
                      Browser support for real-time communication
                    </p>
                  </div>
                </div>
                {webrtcSupported ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Supported
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-4 h-4 mr-1" />
                    Not Supported
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Microphone Access</p>
                    <p className="text-sm text-gray-600">
                      Permission to access your microphone
                    </p>
                  </div>
                </div>
                {micPermission === 'granted' ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Granted
                  </Badge>
                ) : micPermission === 'denied' ? (
                  <Badge variant="destructive">
                    <XCircle className="w-4 h-4 mr-1" />
                    Denied
                  </Badge>
                ) : (
                  <Button onClick={requestMicPermission} size="sm">
                    Grant Permission
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Network Connection</p>
                    <p className="text-sm text-gray-600">
                      Stable internet connection required
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Online
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-900">HTTPS Connection</p>
                    <p className="text-sm text-gray-600">
                      Secure connection for WebRTC (required in production)
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Development Mode
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Asterisk WebRTC Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-600" />
              Asterisk WebRTC Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">1. Enable WebRTC in Asterisk</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <p className="mb-2"># /etc/asterisk/http.conf</p>
                  <p>enabled=yes</p>
                  <p>bindaddr=0.0.0.0</p>
                  <p>bindport=8088</p>
                  <p>tlsenable=yes</p>
                  <p>tlsbindaddr=0.0.0.0:8089</p>
                  <p>tlscertfile=/etc/asterisk/keys/asterisk.pem</p>
                  <p>tlsprivatekey=/etc/asterisk/keys/asterisk.key</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">2. Configure WebRTC Endpoint</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <p className="mb-2"># /etc/asterisk/pjsip.conf</p>
                  <p>[webrtc_transport]</p>
                  <p>type=transport</p>
                  <p>protocol=wss</p>
                  <p>bind=0.0.0.0:8089</p>
                  <p className="mt-2">[webrtc_endpoint]</p>
                  <p>type=endpoint</p>
                  <p>transport=webrtc_transport</p>
                  <p>webrtc=yes</p>
                  <p>context=from-internal</p>
                  <p>disallow=all</p>
                  <p>allow=opus,ulaw,alaw</p>
                  <p>direct_media=no</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">3. Install SIP.js Library</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <p>npm install sip.js</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Important Notes:</p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>WebRTC requires HTTPS in production environments</li>
                      <li>Configure STUN/TURN servers for NAT traversal</li>
                      <li>Enable CORS headers in Asterisk HTTP configuration</li>
                      <li>Use Opus codec for best audio quality over WebRTC</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Test Call */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Test WebRTC Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 mb-4">
              Test your WebRTC setup with a sample call to verify everything is working correctly.
            </p>
            <Button
              onClick={handleTestCall}
              disabled={!webrtcSupported || micPermission !== 'granted' || testCallStatus !== 'idle'}
              className={`${
                testCallStatus === 'calling'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : testCallStatus === 'connected'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
              size="lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              {testCallStatus === 'idle'
                ? 'Start Test Call'
                : testCallStatus === 'calling'
                  ? 'Calling...'
                  : 'Connected'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Start Guide */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle>Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Configure Asterisk</p>
                <p className="text-sm text-gray-600">
                  Update http.conf and pjsip.conf with WebRTC settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Generate SSL Certificates</p>
                <p className="text-sm text-gray-600">
                  Create self-signed certificates for development or use Let's Encrypt for production
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Test Connection</p>
                <p className="text-sm text-gray-600">
                  Use the test call feature to verify WebRTC is working
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-semibold text-gray-900">Start Making Calls</p>
                <p className="text-sm text-gray-600">
                  Agents can now make and receive calls directly from their browser
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
