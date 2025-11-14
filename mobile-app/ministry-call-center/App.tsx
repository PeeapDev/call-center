import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import LandingScreen from './src/screens/LandingScreen';
import CallScreen from './src/screens/CallScreen';
import ChatScreen from './src/screens/ChatScreen';

type Screen = 'login' | 'landing' | 'call' | 'chat' | 'cases';
type UserType = 'citizen' | 'staff';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userType, setUserType] = useState<UserType>('citizen');
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType');
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const storedName = await AsyncStorage.getItem('userName');

      if (storedUserType && storedPhone && storedName) {
        setUserType(storedUserType as UserType);
        setUserPhone(storedPhone);
        setUserName(storedName);
        setCurrentScreen('landing');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (type: UserType, phone: string, name: string) => {
    setUserType(type);
    setUserPhone(phone);
    setUserName(name);
    setCurrentScreen('landing');
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userType', 'userPhone', 'userName']);
      setCurrentScreen('login');
      setUserType('citizen');
      setUserPhone('');
      setUserName('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <>
      {currentScreen === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {currentScreen === 'landing' && (
        <LandingScreen
          userName={userName}
          userType={userType}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'call' && (
        <CallScreen onBack={() => handleNavigate('landing')} />
      )}

      {currentScreen === 'chat' && (
        <ChatScreen
          onNavigateToCall={() => handleNavigate('call')}
          onBack={() => handleNavigate('landing')}
        />
      )}

      <StatusBar style="light" />
    </>
  );
}
