import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import API_CONFIG from '../config/api';
import { callApiService, CallRequest } from '../services/call-api.service';

interface CallScreenProps {
  onBack: () => void;
}

export default function CallScreen({ onBack }: CallScreenProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedIVR, setSelectedIVR] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState('Initializing...');
  const [isMuted, setIsMuted] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize - just set ready (no WebRTC needed)
    setIsRegistered(true);
    setCallStatus('Ready to call');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isInCall]);

  const makeCall = async () => {
    if (!selectedIVR) {
      Alert.alert('Select Option', 'Please select an IVR option before calling');
      return;
    }

    try {
      setCallStatus('Connecting...');
      setCallDuration(0);

      // Make call via API (no WebRTC in mobile)
      const request: CallRequest = {
        phoneNumber: '+232 76 123 456', // User's phone
        ivrOption: selectedIVR,
        callerName: 'Mobile User',
      };

      const response = await callApiService.initiateCall(request);

      if (response.success) {
        setCurrentCallId(response.callId || null);
        setIsInCall(true);
        setCallStatus('Connected');
        
        if (response.assignedAgent) {
          Alert.alert(
            'Call Connected',
            `Connected to ${response.assignedAgent.name}. Your call is being routed.`,
            [{ text: 'OK' }]
          );
        } else if (response.queuePosition) {
          setCallStatus(`Queue Position: ${response.queuePosition}`);
          Alert.alert(
            'In Queue',
            `You are #${response.queuePosition} in queue. Estimated wait: ${response.estimatedWait || 0} minutes.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error(response.message || 'Call failed');
      }
    } catch (error: any) {
      console.error('❌ Failed to make call:', error);
      setCallStatus('Ready to call');
      setIsInCall(false);
      Alert.alert('Call Failed', error.message || 'Failed to connect. Please try again.');
    }
  };

  const sendDTMF = (digit: string) => {
    // DTMF sent via backend when IVR selected
    console.log('📞 DTMF:', digit);
    Alert.alert('Option Selected', `You selected option ${digit}`);
  };

  const hangUp = async () => {
    if (currentCallId) {
      try {
        await callApiService.endCall(currentCallId);
      } catch (error) {
        console.error('Failed to end call:', error);
      }
    }
    setIsInCall(false);
    setCurrentCallId(null);
    setCallStatus('Ready to call');
    setCallDuration(0);
  };

  const toggleMute = () => {
    // Mute handled by phone's native call interface
    setIsMuted(!isMuted);
    Alert.alert('Mute', isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ministry of Education</Text>
          <Text style={styles.headerSubtitle}>Sierra Leone Call Center</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            isRegistered ? styles.statusOnline : styles.statusOffline,
          ]}
        >
          <Text style={styles.statusText}>
            {isRegistered ? '✅ Online' : '⏳ Connecting...'}
          </Text>
        </View>

        {/* Call Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>{callStatus}</Text>
        </View>

        {!isInCall ? (
          /* Dial Section */
          <View style={styles.dialSection}>
            <Text style={styles.dialTitle}>📞 Call Ministry Hotline</Text>
            <Text style={styles.dialSubtitle}>
              Free call to Ministry of Education
            </Text>

            <TouchableOpacity
              style={[
                styles.callButton,
                !isRegistered && styles.callButtonDisabled,
              ]}
              onPress={makeCall}
              disabled={!isRegistered}
            >
              <Text style={styles.callButtonText}>
                {isRegistered ? '📞 Call Now' : '⏳ Connecting...'}
              </Text>
            </TouchableOpacity>

            {/* Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>What to expect:</Text>
              <Text style={styles.infoText}>1. You'll hear an IVR menu</Text>
              <Text style={styles.infoText}>2. Select your service (1-4)</Text>
              <Text style={styles.infoText}>3. Wait for an agent</Text>
              <Text style={styles.infoText}>4. Explain your concern</Text>
            </View>
          </View>
        ) : (
          /* Active Call Section */
          <View style={styles.activeCallSection}>
            <Text style={styles.callActiveText}>📞 Call Active</Text>
            <Text style={styles.duration}>{formatDuration(callDuration)}</Text>

            {!selectedIVR && (
              <View style={styles.ivrSection}>
                <Text style={styles.ivrPrompt}>
                  🎤 Select Service:
                </Text>

                <View style={styles.ivrGrid}>
                  {API_CONFIG.ivrOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.ivrButton}
                      onPress={() => setSelectedIVR(option.value)}
                    >
                      <Text style={styles.ivrButtonIcon}>{option.icon}</Text>
                      <Text style={styles.ivrButtonLabel}>
                        {option.value}. {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {selectedIVR && (
              <View style={styles.queueInfo}>
                <Text style={styles.queueIcon}>⏳</Text>
                <Text style={styles.queueText}>
                  {callStatus.includes('Agent')
                    ? 'Agent Connected!'
                    : 'In Queue - Waiting for Agent'}
                </Text>
                <Text style={styles.queueSubtext}>
                  You selected option {selectedIVR}
                </Text>
                {!callStatus.includes('Agent') && (
                  <Text style={styles.queueNote}>
                    Please stay on the line...
                  </Text>
                )}
              </View>
            )}

            {/* Call Controls */}
            <View style={styles.callControls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isMuted && styles.controlButtonActive,
                ]}
                onPress={toggleMute}
              >
                <Text style={styles.controlIcon}>
                  {isMuted ? '🔇' : '🎤'}
                </Text>
                <Text style={styles.controlLabel}>
                  {isMuted ? 'Unmute' : 'Mute'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.hangupButton]}
                onPress={hangUp}
              >
                <Text style={styles.controlIcon}>📞</Text>
                <Text style={styles.controlLabel}>Hang Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => Alert.alert('Speaker', 'Audio routing via phone speaker')}
              >
                <Text style={styles.controlIcon}>🔊</Text>
                <Text style={styles.controlLabel}>Speaker</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 5,
    paddingRight: 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusBadge: {
    padding: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#6b7280',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dialSection: {
    alignItems: 'center',
  },
  dialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  dialSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 30,
  },
  callButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 50,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  callButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  callButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 5,
  },
  activeCallSection: {
    alignItems: 'center',
  },
  callActiveText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 10,
  },
  duration: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 30,
  },
  ivrSection: {
    width: '100%',
    marginBottom: 30,
  },
  ivrPrompt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 15,
  },
  ivrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ivrButton: {
    backgroundColor: '#2563eb',
    width: '48%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  ivrButtonIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  ivrButtonLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  queueInfo: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  queueIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  queueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
  },
  queueSubtext: {
    fontSize: 14,
    color: '#92400e',
  },
  queueNote: {
    fontSize: 12,
    color: '#92400e',
    fontStyle: 'italic',
    marginTop: 10,
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    backgroundColor: '#6b7280',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    minWidth: 80,
  },
  controlButtonActive: {
    backgroundColor: '#f59e0b',
  },
  hangupButton: {
    backgroundColor: '#ef4444',
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  controlLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
