'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, User, Clock, MessageSquare, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface ChatConversation {
  id: string;
  citizenName: string;
  citizenEmail: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  status: 'waiting' | 'active' | 'resolved';
  assignedTo?: string;
}

interface Message {
  id: string;
  sender: 'citizen' | 'staff';
  content: string;
  timestamp: Date;
  staffName?: string;
  staffRole?: string;
  staffNumber?: string;
}

export default function StaffChatPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;

  // Load mock conversations
  useEffect(() => {
    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        citizenName: 'John Doe',
        citizenEmail: 'john@example.com',
        lastMessage: 'I need help with enrollment...',
        timestamp: new Date(Date.now() - 5 * 60000),
        unread: 2,
        status: 'waiting',
      },
      {
        id: '2',
        citizenName: 'Jane Smith',
        citizenEmail: 'jane@example.com',
        lastMessage: 'When does the new semester start?',
        timestamp: new Date(Date.now() - 15 * 60000),
        unread: 0,
        status: 'active',
        assignedTo: user?.name,
      },
      {
        id: '3',
        citizenName: 'Mike Johnson',
        citizenEmail: 'mike@example.com',
        lastMessage: 'Thank you for your help!',
        timestamp: new Date(Date.now() - 30 * 60000),
        unread: 0,
        status: 'resolved',
      },
    ];
    setConversations(mockConversations);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);

    // Update conversation to show it's been claimed
    if (conversation.status === 'waiting' && !conversation.assignedTo) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id
            ? { ...conv, status: 'active', assignedTo: user?.name, unread: 0 }
            : conv
        )
      );
    }

    // Load conversation messages (mock for now)
    const mockMessages: Message[] = [
      {
        id: '1',
        sender: 'citizen',
        content: 'Hello, I need help with the enrollment process.',
        timestamp: new Date(Date.now() - 10 * 60000),
      },
      {
        id: '2',
        sender: 'citizen',
        content: 'Specifically, I\'m not sure what documents I need to submit.',
        timestamp: new Date(Date.now() - 9 * 60000),
      },
    ];

    setMessages(mockMessages);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation) return;

    const staffMessage: Message = {
      id: Date.now().toString(),
      sender: 'staff',
      content: inputMessage,
      timestamp: new Date(),
      staffName: user?.name,
      staffRole: user?.role,
      staffNumber: `ST-${Math.floor(Math.random() * 9000) + 1000}`,
    };

    setMessages((prev) => [...prev, staffMessage]);
    setInputMessage('');

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: inputMessage, timestamp: new Date() }
          : conv
      )
    );
  };

  const handleResolveChat = () => {
    if (!selectedConversation) return;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, status: 'resolved' }
          : conv
      )
    );

    setSelectedConversation({ ...selectedConversation, status: 'resolved' });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.citizenEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const waitingCount = conversations.filter((c) => c.status === 'waiting').length;
  const activeCount = conversations.filter((c) => c.status === 'active').length;

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-4">
      {/* Conversations List */}
      <Card className="w-96 flex flex-col border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Chat Support</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-orange-500">
                {waitingCount} Waiting
              </Badge>
              <Badge variant="default" className="bg-green-500">
                {activeCount} Active
              </Badge>
            </div>
          </CardTitle>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <MessageSquare className="w-12 h-12 mb-3" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {conversation.citizenName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{conversation.citizenName}</p>
                        <p className="text-xs text-gray-500">{conversation.citizenEmail}</p>
                      </div>
                    </div>
                    {conversation.unread > 0 && (
                      <Badge variant="default" className="bg-red-500 text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          conversation.status === 'waiting'
                            ? 'secondary'
                            : conversation.status === 'active'
                            ? 'default'
                            : 'outline'
                        }
                        className={
                          conversation.status === 'waiting'
                            ? 'bg-orange-100 text-orange-700'
                            : conversation.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }
                      >
                        {conversation.status}
                      </Badge>
                      {conversation.assignedTo && (
                        <span className="text-gray-500">• {conversation.assignedTo}</span>
                      )}
                    </div>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor((Date.now() - conversation.timestamp.getTime()) / 60000)}m ago
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      {selectedConversation ? (
        <Card className="flex-1 flex flex-col border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.citizenName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation.citizenName}</h3>
                  <p className="text-sm text-gray-600">{selectedConversation.citizenEmail}</p>
                </div>
              </div>

              {selectedConversation.status !== 'resolved' && (
                <Button onClick={handleResolveChat} variant="outline" size="sm" className="text-green-600 border-green-600">
                  Mark as Resolved
                </Button>
              )}
            </div>

            {/* Staff Info - Shown to citizen */}
            {selectedConversation.assignedTo && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <span>
                  Assigned to: <span className="font-medium">{selectedConversation.assignedTo}</span>
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.sender === 'staff' ? 'order-2' : 'order-1'}`}>
                    {/* Sender Info */}
                    {message.sender === 'staff' && (
                      <div className="flex items-center gap-2 mb-1 mr-1 justify-end">
                        <Badge variant="outline" className="text-xs">
                          {message.staffNumber}
                        </Badge>
                        <span className="text-xs font-medium text-gray-600">
                          {message.staffName} ({message.staffRole})
                        </span>
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'staff'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Timestamp */}
                    <p className={`text-xs text-gray-400 mt-1 ${message.sender === 'staff' ? 'text-right mr-1' : 'ml-1'}`}>
                      {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          {selectedConversation.status !== 'resolved' && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your response..."
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center border-0 shadow-lg">
          <div className="text-center text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium">Select a conversation to start</p>
            <p className="text-sm">Choose a chat from the list to view and respond</p>
          </div>
        </Card>
      )}
    </div>
  );
}
