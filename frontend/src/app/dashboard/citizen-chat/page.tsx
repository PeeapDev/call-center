'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Paperclip, Smile, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { API_ENDPOINTS, buildApiUrl } from '@/lib/config';

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'staff';
  content: string;
  timestamp: Date;
  staffName?: string;
  staffRole?: string;
  staffNumber?: string;
}

export default function CitizenChatPage() {
  const { data: session } = useSession();
  const [chatMode, setChatMode] = useState<'ai' | 'live'>('ai');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        content: 'Hello! I\'m your AI assistant from the Ministry of Education. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    if (chatMode === 'ai') {
      // Send to AI
      setTimeout(async () => {
        try {
          const response = await fetch(API_ENDPOINTS.aiChat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: inputMessage }),
          });

          const data = await response.json();

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: data.response || 'I\'m here to help! Could you please rephrase your question?',
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: 'Sorry, I\'m having trouble connecting. Please try again.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }, 1000);
    } else {
      // Send to live staff via backend API
      try {
        const user = session?.user as any;
        console.log('[Live Chat] Sending message:', { conversationId, user });
        
        // Create conversation if first message
        if (!conversationId) {
          const url = buildApiUrl('/support-chat/conversations');
          console.log('[Live Chat] Creating conversation at:', url);
          
          const convResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              citizenId: user?.id || 'citizen_' + Date.now(),
              citizenName: user?.name || 'Guest User',
              citizenEmail: user?.email || 'guest@example.com',
              initialMessage: inputMessage,
            }),
          });

          console.log('[Live Chat] Response status:', convResponse.status);
          const convData = await convResponse.json();
          console.log('[Live Chat] Response data:', convData);
          
          if (convData.status === 'ok') {
            setConversationId(convData.conversation.id);
            setIsConnected(true);

            const systemMessage: Message = {
              id: Date.now().toString(),
              sender: 'ai',
              content: '✅ Your message has been sent to our chat team. An agent will respond shortly.',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, systemMessage]);
            console.log('[Live Chat] ✅ Conversation created:', convData.conversation.id);
          } else {
            throw new Error(convData.message || 'Failed to create conversation');
          }
        } else {
          // Send message to existing conversation
          const url = buildApiUrl('/support-chat/messages');
          console.log('[Live Chat] Sending to:', url);
          
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: conversationId,
              senderId: user?.id || 'citizen_temp',
              senderType: 'citizen',
              content: inputMessage,
            }),
          });
          console.log('[Live Chat] ✅ Message sent');
        }
        setIsTyping(false);
      } catch (error) {
        console.error('[Live Chat] ❌ Error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }
  };

  const switchToChatMode = (mode: 'ai' | 'live') => {
    setChatMode(mode);
    
    if (mode === 'live' && !isConnected) {
      const systemMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: 'Connecting you to a live chat agent. Please wait...',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      setIsConnected(true);
    } else if (mode === 'ai') {
      const systemMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        content: 'Switched back to AI assistant. How can I help you?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      setStaffInfo(null);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <Card className="border-0 shadow-lg mb-4">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Live Chat</h1>
              <p className="text-sm text-blue-100 mt-1">
                {chatMode === 'ai' ? 'AI Assistant' : 'Live Chat with Staff'}
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                onClick={() => switchToChatMode('ai')}
                variant={chatMode === 'ai' ? 'default' : 'outline'}
                className={chatMode === 'ai' ? 'bg-white text-blue-600' : 'border-white text-white hover:bg-white/20'}
                size="sm"
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
              <Button
                onClick={() => switchToChatMode('live')}
                variant={chatMode === 'live' ? 'default' : 'outline'}
                className={chatMode === 'live' ? 'bg-white text-purple-600' : 'border-white text-white hover:bg-white/20'}
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>

          {/* Staff Info Badge */}
          {chatMode === 'live' && staffInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-3"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 font-semibold">
                {staffInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{staffInfo.name}</p>
                <p className="text-xs text-blue-100">{staffInfo.role} • {staffInfo.number}</p>
              </div>
            </motion.div>
          )}
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col border-0 shadow-lg">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Sender Info */}
                  {message.sender !== 'user' && (
                    <div className="flex items-center gap-2 mb-1 ml-1">
                      {message.sender === 'ai' ? (
                        <Bot className="w-4 h-4 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="text-xs font-medium text-gray-600">
                        {message.sender === 'ai' ? 'AI Assistant' : message.staffName}
                      </span>
                      {message.staffNumber && (
                        <Badge variant="outline" className="text-xs">
                          {message.staffNumber}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.sender === 'ai'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 mt-1 ml-1">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Smile className="w-5 h-5" />
            </Button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message & commands"
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
