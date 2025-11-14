import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  onLoginSuccess: (userType: 'citizen' | 'staff', phone: string, name: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'citizen' | 'staff'>('citizen');
  const [staffPassword, setStaffPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (phoneNumber: string) => {
    // Sierra Leone phone format: +232 XX XXX XXX or 0XX XXX XXX
    const phoneRegex = /^(\+232|0)?[2-9]\d{7}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid Sierra Leone phone number');
      return;
    }

    if (userType === 'staff' && !staffPassword.trim()) {
      Alert.alert('Error', 'Please enter staff password');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number
      let formattedPhone = phone.replace(/\s/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+232' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+232')) {
        formattedPhone = '+232' + formattedPhone;
      }

      if (userType === 'staff') {
        // Verify staff credentials
        // For demo: accept any phone with password "staff123"
        if (staffPassword === 'staff123') {
          const staffName = 'Staff Member';
          await AsyncStorage.multiSet([
            ['userType', 'staff'],
            ['userPhone', formattedPhone],
            ['userName', staffName],
          ]);
          
          onLoginSuccess('staff', formattedPhone, staffName);
        } else {
          Alert.alert('Error', 'Invalid staff credentials');
        }
      } else {
        // Citizen login - just store phone number
        const citizenName = 'Citizen';
        await AsyncStorage.multiSet([
          ['userType', 'citizen'],
          ['userPhone', formattedPhone],
          ['userName', citizenName],
        ]);
        
        onLoginSuccess('citizen', formattedPhone, citizenName);
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFillDemo = (type: 'citizen' | 'staff') => {
    if (type === 'citizen') {
      setPhone('077123456');
      setUserType('citizen');
    } else {
      setPhone('076987654');
      setStaffPassword('staff123');
      setUserType('staff');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.title}>Ministry of Education</Text>
          <Text style={styles.subtitle}>Sierra Leone</Text>
          <Text style={styles.tagline}>Call Center Mobile App</Text>
        </View>

        {/* User Type Selection */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              userType === 'citizen' && styles.typeButtonActive,
            ]}
            onPress={() => setUserType('citizen')}
          >
            <Text
              style={[
                styles.typeButtonText,
                userType === 'citizen' && styles.typeButtonTextActive,
              ]}
            >
              👤 Citizen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              userType === 'staff' && styles.typeButtonActive,
            ]}
            onPress={() => setUserType('staff')}
          >
            <Text
              style={[
                styles.typeButtonText,
                userType === 'staff' && styles.typeButtonTextActive,
              ]}
            >
              👨‍💼 Staff
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+232 77 123 456 or 077 123 456"
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          {userType === 'staff' && (
            <>
              <Text style={styles.label}>Staff Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter staff password"
                placeholderTextColor="#9ca3af"
                value={staffPassword}
                onChangeText={setStaffPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? '⏳ Logging in...' : '🚀 Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Accounts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Quick Demo Login:</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => quickFillDemo('citizen')}
            >
              <Text style={styles.demoButtonText}>👤 Citizen Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => quickFillDemo('staff')}
            >
              <Text style={styles.demoButtonText}>👨‍💼 Staff Demo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            {userType === 'citizen' ? '👤 Citizen Access' : '👨‍💼 Staff Access'}
          </Text>
          <Text style={styles.infoText}>
            {userType === 'citizen'
              ? '• Submit complaints\n• Track cases\n• Call ministry\n• Chat with AI assistant\n• View FAQs and notices'
              : '• Handle citizen calls\n• Manage cases\n• View statistics\n• Access staff tools'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#2563eb',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#9ca3af',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 4,
    marginBottom: 30,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoSection: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 10,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  demoButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  demoButtonText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
});
