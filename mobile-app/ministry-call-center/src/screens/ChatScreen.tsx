import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import API_CONFIG from '../config/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatScreenProps {
  onNavigateToCall: () => void;
  onBack: () => void;
}

export default function ChatScreen({ onNavigateToCall, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m the Ministry of Education AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call the chatbot API
      const response = await fetch(`${API_CONFIG.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'I apologize, but I couldn\'t process that request.',
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);

        // Check if bot suggests calling
        if (data.response.toLowerCase().includes('call') || 
            data.response.toLowerCase().includes('speak to agent')) {
          setTimeout(() => {
            Alert.alert(
              'Need More Help?',
              'Would you like to call and speak with an agent directly?',
              [
                { text: 'Continue Chat', style: 'cancel' },
                { text: 'Call Now', onPress: onNavigateToCall },
              ]
            );
          }, 1000);
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback to mock response
      const mockResponse = getMockResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: mockResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getMockResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes('exam') || lowerText.includes('result')) {
      return 'Exam results are typically released 6-8 weeks after completion. You can check results online at our website or call the hotline for assistance. Would you like me to connect you with an agent?';
    }

    if (lowerText.includes('register') || lowerText.includes('admission')) {
      return 'School registration for the new academic year is open from January to March. You\'ll need a birth certificate and proof of residence. Visit your nearest school or call us for more information.';
    }

    if (lowerText.includes('scholarship') || lowerText.includes('financial')) {
      return 'We offer various scholarship programs including merit-based and need-based scholarships. Applications are typically open in April. Would you like to speak with an agent about eligibility?';
    }

    if (lowerText.includes('teacher') || lowerText.includes('staff')) {
      return 'For teacher-related inquiries including registration, complaints, or welfare, please select option 2 when you call our hotline, or I can connect you directly with an agent now.';
    }

    if (lowerText.includes('call') || lowerText.includes('agent') || lowerText.includes('speak')) {
      return 'I can help you connect with an agent right now. They can assist with more complex questions. Would you like to call?';
    }

    if (lowerText.includes('thank') || lowerText.includes('bye')) {
      return 'You\'re welcome! If you need any further assistance, feel free to call our hotline or chat with me anytime. Have a great day! 😊';
    }

    return 'I understand you\'re asking about ' + userText + '. For detailed information, I recommend calling our hotline to speak with an agent who can provide specific guidance. Would you like to call now?';
  };

  const sendQuickReply = (text: string) => {
    setInputText(text);
    setTimeout(() => sendMessage(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AI Chat Assistant</Text>
          <Text style={styles.headerSubtitle}>🟢 Online - 24/7 Available</Text>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={onNavigateToCall}
        >
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user'
                ? styles.userBubble
                : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.sender === 'user'
                  ? styles.userText
                  : styles.botText,
              ]}
            >
              {message.text}
            </Text>
            <Text style={styles.messageTime}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <Text style={styles.typingText}>● ● ●</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <ScrollView
        horizontal
        style={styles.quickReplies}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.quickReplyButton}
          onPress={() => sendQuickReply('How do I check exam results?')}
        >
          <Text style={styles.quickReplyText}>📚 Exam Results</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickReplyButton}
          onPress={() => sendQuickReply('How do I register my child?')}
        >
          <Text style={styles.quickReplyText}>📝 Registration</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickReplyButton}
          onPress={() => sendQuickReply('Tell me about scholarships')}
        >
          <Text style={styles.quickReplyText}>💰 Scholarships</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickReplyButton}
          onPress={() => sendQuickReply('I want to speak with an agent')}
        >
          <Text style={styles.quickReplyText}>👤 Agent</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 5,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  callButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  typingText: {
    fontSize: 14,
    color: '#6b7280',
    letterSpacing: 2,
  },
  quickReplies: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quickReplyButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  quickReplyText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
