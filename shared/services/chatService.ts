import { log } from '../utils/logger';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'whatsapp_handoff';
  metadata?: {
    intent?: string;
    confidence?: number;
    quickReplies?: QuickReply[];
  };
}

export interface QuickReply {
  id: string;
  text: string;
  action?: string;
  payload?: any;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastActivity: Date;
  status: 'active' | 'transferred' | 'closed';
  metadata?: {
    userAgent?: string;
    referrer?: string;
    ipAddress?: string;
  };
}

export interface WhatsAppConfig {
  phoneNumber: string;
  defaultMessage: string;
  businessName: string;
}

export class ChatService {
  private static readonly COLLECTION_SESSIONS = 'chat_sessions';
  private static readonly COLLECTION_MESSAGES = 'chat_messages';

  private static readonly WHATSAPP_CONFIG: WhatsAppConfig = {
    phoneNumber: '5511999999999', // Replace with actual business number
    defaultMessage: 'Olá! Fui transferido do chat do site e preciso de ajuda.',
    businessName: 'Ogni Atendimento'
  };

  /**
   * Create a new chat session
   */
  static async createSession(userId?: string, metadata?: ChatSession['metadata']): Promise<ChatSession> {
    try {
      const session: ChatSession = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        messages: [],
        startedAt: new Date(),
        lastActivity: new Date(),
        status: 'active',
        metadata
      };

      // In a real implementation, save to Firestore
      log.info('Chat session created', { sessionId: session.id, userId });

      return session;
    } catch (error) {
      log.error('Failed to create chat session', { error, userId });
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Add message to session
   */
  static async addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    try {
      const chatMessage: ChatMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      // In a real implementation, save to Firestore
      log.info('Message added to chat session', { sessionId, messageId: chatMessage.id });

      return chatMessage;
    } catch (error) {
      log.error('Failed to add message to session', { error, sessionId });
      throw new Error('Failed to add message');
    }
  }

  /**
   * Generate bot response based on user message
   */
  static generateBotResponse(userMessage: string, context?: ChatMessage[]): ChatMessage {
    const message = userMessage.toLowerCase().trim();

    // Analyze intent and generate response
    const intent = this.analyzeIntent(message);

    switch (intent) {
      case 'whatsapp_handoff':
        return this.createWhatsAppHandoffResponse();

      case 'product_inquiry':
        return this.createProductInquiryResponse();

      case 'order_status':
        return this.createOrderStatusResponse();

      case 'returns_exchanges':
        return this.createReturnsResponse();

      case 'greeting':
        return this.createGreetingResponse();

      case 'farewell':
        return this.createFarewellResponse();

      default:
        return this.createDefaultResponse();
    }
  }

  /**
   * Analyze user message intent
   */
  private static analyzeIntent(message: string): string {
    // WhatsApp handoff keywords
    const whatsappKeywords = ['whatsapp', 'fone', 'telefone', 'ligar', 'atendimento humano', 'falar com pessoa'];
    if (whatsappKeywords.some(keyword => message.includes(keyword))) {
      return 'whatsapp_handoff';
    }

    // Product inquiry keywords
    const productKeywords = ['produto', 'comprar', 'preço', 'estoque', 'disponível'];
    if (productKeywords.some(keyword => message.includes(keyword))) {
      return 'product_inquiry';
    }

    // Order status keywords
    const orderKeywords = ['pedido', 'status', 'entrega', 'rastreamento', 'onde está'];
    if (orderKeywords.some(keyword => message.includes(keyword))) {
      return 'order_status';
    }

    // Returns keywords
    const returnKeywords = ['devolução', 'troca', 'devolver', 'problema', 'defeito'];
    if (returnKeywords.some(keyword => message.includes(keyword))) {
      return 'returns_exchanges';
    }

    // Greeting keywords
    const greetingKeywords = ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi'];
    if (greetingKeywords.some(keyword => message.includes(keyword))) {
      return 'greeting';
    }

    // Farewell keywords
    const farewellKeywords = ['tchau', 'até logo', 'obrigado', 'valeu', 'bye', 'goodbye'];
    if (farewellKeywords.some(keyword => message.includes(keyword))) {
      return 'farewell';
    }

    return 'general';
  }

  /**
   * Create WhatsApp handoff response
   */
  private static createWhatsAppHandoffResponse(): ChatMessage {
    return {
      id: '',
      content: 'Vou transferir você para nosso atendimento via WhatsApp onde um especialista poderá ajudar melhor. Clique no botão abaixo para continuar.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'whatsapp_handoff'
    };
  }

  /**
   * Create product inquiry response
   */
  private static createProductInquiryResponse(): ChatMessage {
    return {
      id: '',
      content: 'Posso ajudar você a encontrar o produto ideal! Que tipo de produto você está procurando? Temos moda, tecnologia, casa e muito mais.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'quick_reply',
      metadata: {
        intent: 'product_inquiry',
        quickReplies: [
          { id: '1', text: 'Ver produtos de moda', action: 'category_fashion' },
          { id: '2', text: 'Produtos de tecnologia', action: 'category_tech' },
          { id: '3', text: 'Itens para casa', action: 'category_home' },
          { id: '4', text: 'Ver todos os produtos', action: 'view_all' }
        ]
      }
    };
  }

  /**
   * Create order status response
   */
  private static createOrderStatusResponse(): ChatMessage {
    return {
      id: '',
      content: 'Para verificar o status do seu pedido, preciso do número do pedido. Você pode encontrá-lo no email de confirmação da compra ou em "Meus Pedidos" na sua conta.',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
  }

  /**
   * Create returns response
   */
  private static createReturnsResponse(): ChatMessage {
    return {
      id: '',
      content: 'Para solicitar uma devolução ou troca, você pode acessar sua conta em "Meus Pedidos" ou falar diretamente com nosso atendimento. Posso ajudar com mais detalhes?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'quick_reply',
      metadata: {
        intent: 'returns',
        quickReplies: [
          { id: '1', text: 'Como solicitar devolução', action: 'returns_guide' },
          { id: '2', text: 'Falar com atendimento', action: 'contact_support' },
          { id: '3', text: 'Ver política de trocas', action: 'returns_policy' }
        ]
      }
    };
  }

  /**
   * Create greeting response
   */
  private static createGreetingResponse(): ChatMessage {
    const greetings = [
      'Olá! Sou o assistente virtual da Ogni. Como posso ajudar você hoje?',
      'Oi! Bem-vindo à Ogni! Em que posso ajudar?',
      'Olá! Estou aqui para ajudar. O que você precisa?'
    ];

    return {
      id: '',
      content: greetings[Math.floor(Math.random() * greetings.length)],
      sender: 'bot',
      timestamp: new Date(),
      type: 'quick_reply',
      metadata: {
        intent: 'greeting',
        quickReplies: [
          { id: '1', text: 'Ver produtos', action: 'browse_products' },
          { id: '2', text: 'Meus pedidos', action: 'my_orders' },
          { id: '3', text: 'Ajuda', action: 'help' }
        ]
      }
    };
  }

  /**
   * Create farewell response
   */
  private static createFarewellResponse(): ChatMessage {
    const farewells = [
      'Obrigado por conversar comigo! Se precisar de mais ajuda, estou aqui.',
      'Foi um prazer ajudar! Volte sempre que precisar.',
      'Até logo! Qualquer dúvida, é só chamar.'
    ];

    return {
      id: '',
      content: farewells[Math.floor(Math.random() * farewells.length)],
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
  }

  /**
   * Create default response
   */
  private static createDefaultResponse(): ChatMessage {
    const responses = [
      'Entendi! Vou ajudar você com isso. Pode me dar mais detalhes?',
      'Obrigado por perguntar! Como posso esclarecer isso melhor para você?',
      'Interessante! Conte-me mais sobre o que você precisa.',
      'Estou aqui para ajudar! Que tal reformular sua pergunta?'
    ];

    return {
      id: '',
      content: responses[Math.floor(Math.random() * responses.length)],
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
  }

  /**
   * Generate WhatsApp URL for handoff
   */
  static generateWhatsAppUrl(message?: string): string {
    const phoneNumber = this.WHATSAPP_CONFIG.phoneNumber.replace(/\D/g, '');
    const text = message || this.WHATSAPP_CONFIG.defaultMessage;
    const encodedMessage = encodeURIComponent(text);

    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Transfer session to WhatsApp
   */
  static async transferToWhatsApp(sessionId: string, userMessage?: string): Promise<void> {
    try {
      // Update session status
      // In a real implementation, update Firestore
      log.info('Chat session transferred to WhatsApp', { sessionId });

      // Generate WhatsApp URL
      const whatsappUrl = this.generateWhatsAppUrl(userMessage);

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      log.error('Failed to transfer to WhatsApp', { error, sessionId });
      throw new Error('Failed to transfer to WhatsApp');
    }
  }

  /**
   * Get chat analytics
   */
  static async getAnalytics(dateRange?: { start: Date; end: Date }): Promise<{
    totalSessions: number;
    totalMessages: number;
    whatsappTransfers: number;
    avgSessionDuration: number;
    satisfactionRate: number;
  }> {
    try {
      // In a real implementation, aggregate from Firestore
      return {
        totalSessions: 1250,
        totalMessages: 8750,
        whatsappTransfers: 320,
        avgSessionDuration: 180, // seconds
        satisfactionRate: 4.2 // out of 5
      };
    } catch (error) {
      log.error('Failed to get chat analytics', { error });
      return {
        totalSessions: 0,
        totalMessages: 0,
        whatsappTransfers: 0,
        avgSessionDuration: 0,
        satisfactionRate: 0
      };
    }
  }

  /**
   * Close chat session
   */
  static async closeSession(sessionId: string): Promise<void> {
    try {
      // In a real implementation, update Firestore
      log.info('Chat session closed', { sessionId });
    } catch (error) {
      log.error('Failed to close chat session', { error, sessionId });
      throw new Error('Failed to close session');
    }
  }
}