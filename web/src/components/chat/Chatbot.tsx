import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { MessageCircle, Send, Minimize2, Maximize2, X, MessageSquare } from 'lucide-react';

import { ChatService, ChatMessage, QuickReply } from '@/shared/services/chatService';

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  isOpen = false,
  onToggle,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Olá! Sou o assistente virtual da Ogni. Como posso ajudar você hoje?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Generate unique ID for the message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const userMessage: ChatMessage = {
      id: messageId,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response with random delay
    const delay = 1000 + Math.floor(Math.random() * 2000);
    setTimeout(() => {
      const botResponse = ChatService.generateBotResponse(content, messages);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, delay);
  }, [messages]);

    const quickReplies: QuickReply[] = [
    { id: '1', text: 'Ver produtos', action: 'products' },
    { id: '2', text: 'Status do pedido', action: 'order_status' },
    { id: '3', text: 'Devolução', action: 'returns' },
    { id: '4', text: 'Falar com humano', action: 'human' }
  ];

  const handleQuickReply = (reply: QuickReply) => {
    handleSendMessage(reply.text);
  };

  const handleWhatsAppHandoff = () => {
    const whatsappUrl = ChatService.generateWhatsAppUrl();

    window.open(whatsappUrl, '_blank');

    // Close chat after handoff
    if (onToggle) {
      onToggle();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>

        {/* Notification badge for new messages */}
        {messages.length > 1 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {messages.filter(m => m.sender === 'bot' && !m.type).length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className={`w-80 sm:w-96 shadow-2xl ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/chatbot-avatar.jpg" alt="Assistente Ogni" />
              <AvatarFallback className="bg-blue-500 text-white">O</AvatarFallback>
            </Avatar>
            <div>
              <div>Assistente Ogni</div>
              <div className="text-xs text-muted-foreground font-normal">
                Online agora
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* WhatsApp handoff button */}
                {messages[messages.length - 1]?.type === 'whatsapp_handoff' && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={handleWhatsAppHandoff}
                      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Continuar no WhatsApp
                    </Button>
                  </div>
                )}

                {/* Quick replies */}
                {messages[messages.length - 1]?.metadata?.quickReplies && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(messages[messages.length - 1]?.metadata?.quickReplies || []).map((reply) => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs"
                      >
                        {reply.text}
                      </Button>
                    ))}
                  </div>
                )}

                {messages[messages.length - 1]?.type === 'quick_reply' && !messages[messages.length - 1]?.metadata?.quickReplies && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {quickReplies.map((reply) => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs"
                      >
                        {reply.text}
                      </Button>
                    ))}
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};