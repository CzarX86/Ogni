import { log } from '../utils/logger';

export interface ProductDescriptionRequest {
  productName: string;
  category: string;
  price: number;
  features?: string[];
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'luxury' | 'fun' | 'technical';
  language?: string;
  maxLength?: number;
}

export interface ProductDescriptionResponse {
  description: string;
  keywords: string[];
  seoTitle: string;
  seoDescription: string;
  confidence: number;
  generatedAt: Date;
}

export interface ProductEnhancementRequest {
  currentDescription: string;
  productName: string;
  improvements: ('seo' | 'engagement' | 'conversion' | 'clarity' | 'uniqueness')[];
  targetLength?: number;
}

export interface ProductEnhancementResponse {
  enhancedDescription: string;
  improvements: string[];
  beforeAfterComparison: {
    before: string;
    after: string;
    changes: string[];
  };
  confidence: number;
  generatedAt: Date;
}

export interface BulkDescriptionRequest {
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    features?: string[];
  }>;
  options?: {
    tone?: 'professional' | 'casual' | 'luxury' | 'fun' | 'technical';
    language?: string;
    maxLength?: number;
  };
}

export interface BulkDescriptionResponse {
  results: Array<{
    productId: string;
    description: ProductDescriptionResponse | null;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    averageConfidence: number;
  };
  generatedAt: Date;
}

/**
 * AI Service for Product Descriptions
 * Uses LangChain and AI models to generate and enhance product descriptions
 */
export class AIService {
  private static readonly API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'https://api.openai.com/v1';
  private static readonly API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
  private static readonly MODEL = process.env.REACT_APP_AI_MODEL || 'gpt-3.5-turbo';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Generate a product description using AI
   */
  static async generateProductDescription(
    request: ProductDescriptionRequest
  ): Promise<ProductDescriptionResponse> {
    try {
      log.info('Generating product description', {
        productName: request.productName,
        category: request.category
      });

      // In a real implementation, this would call LangChain/OpenAI API
      // For now, we'll simulate the response
      const mockResponse = await this.simulateAIGeneration(request);

      log.info('Product description generated successfully', {
        productName: request.productName,
        confidence: mockResponse.confidence
      });

      return mockResponse;
    } catch (error) {
      log.error('Failed to generate product description', { error, request });
      throw new Error('Failed to generate product description');
    }
  }

  /**
   * Enhance an existing product description
   */
  static async enhanceProductDescription(
    request: ProductEnhancementRequest
  ): Promise<ProductEnhancementResponse> {
    try {
      log.info('Enhancing product description', {
        productName: request.productName,
        improvements: request.improvements
      });

      // In a real implementation, this would call LangChain/OpenAI API
      const mockResponse = await this.simulateEnhancement(request);

      log.info('Product description enhanced successfully', {
        productName: request.productName,
        confidence: mockResponse.confidence
      });

      return mockResponse;
    } catch (error) {
      log.error('Failed to enhance product description', { error, request });
      throw new Error('Failed to enhance product description');
    }
  }

  /**
   * Generate descriptions for multiple products in bulk
   */
  static async generateBulkDescriptions(
    request: BulkDescriptionRequest
  ): Promise<BulkDescriptionResponse> {
    try {
      log.info('Generating bulk product descriptions', {
        productCount: request.products.length
      });

      const results = await Promise.allSettled(
        request.products.map(async (product) => {
          try {
            const descriptionRequest: ProductDescriptionRequest = {
              productName: product.name,
              category: product.category,
              price: product.price,
              features: product.features,
              ...request.options
            };

            const result = await this.generateProductDescription(descriptionRequest);
            return {
              productId: product.id,
              description: result
            };
          } catch (error) {
            log.warn('Failed to generate description for product', {
              productId: product.id,
              error
            });
            return {
              productId: product.id,
              description: null,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const processedResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            productId: request.products[index].id,
            description: null,
            error: result.reason?.message || 'Unknown error'
          };
        }
      });

      const successful = processedResults.filter(r => r.description !== null);
      const averageConfidence = successful.length > 0
        ? successful.reduce((sum, r) => sum + (r.description?.confidence || 0), 0) / successful.length
        : 0;

      const response: BulkDescriptionResponse = {
        results: processedResults,
        summary: {
          total: request.products.length,
          successful: successful.length,
          failed: processedResults.length - successful.length,
          averageConfidence
        },
        generatedAt: new Date()
      };

      log.info('Bulk product descriptions generated', {
        total: response.summary.total,
        successful: response.summary.successful,
        failed: response.summary.failed,
        averageConfidence: response.summary.averageConfidence
      });

      return response;
    } catch (error) {
      log.error('Failed to generate bulk descriptions', { error });
      throw new Error('Failed to generate bulk descriptions');
    }
  }

  /**
   * Analyze product description quality
   */
  static analyzeDescriptionQuality(description: string): {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  } {
    const analysis = {
      score: 0,
      strengths: [] as string[],
      weaknesses: [] as string[],
      suggestions: [] as string[]
    };

    // Length analysis
    const wordCount = description.split(' ').length;
    if (wordCount >= 50 && wordCount <= 200) {
      analysis.score += 20;
      analysis.strengths.push('Optimal length for readability');
    } else if (wordCount < 30) {
      analysis.weaknesses.push('Too short - lacks detail');
      analysis.suggestions.push('Add more product features and benefits');
    } else {
      analysis.weaknesses.push('Too long - may overwhelm readers');
      analysis.suggestions.push('Break into shorter paragraphs or bullet points');
    }

    // Keyword analysis
    const keywords = this.extractKeywords(description);
    if (keywords.length >= 3) {
      analysis.score += 15;
      analysis.strengths.push('Good keyword integration');
    } else {
      analysis.weaknesses.push('Limited keyword usage');
      analysis.suggestions.push('Include more relevant keywords naturally');
    }

    // Engagement analysis
    const hasQuestions = description.includes('?');
    const hasBenefits = /\b(benefits?|advantages?|features?)\b/i.test(description);
    const hasCallToAction = /\b(buy|purchase|order|get|shop)\b/i.test(description);

    if (hasBenefits) {
      analysis.score += 20;
      analysis.strengths.push('Highlights product benefits');
    } else {
      analysis.weaknesses.push('Missing benefit-focused language');
      analysis.suggestions.push('Focus on what the product does for the customer');
    }

    if (hasCallToAction) {
      analysis.score += 15;
      analysis.strengths.push('Includes call-to-action elements');
    } else {
      analysis.weaknesses.push('No clear call-to-action');
      analysis.suggestions.push('Add subtle purchase encouragement');
    }

    // Uniqueness analysis
    const uniqueWords = new Set(description.toLowerCase().split(' ')).size;
    const totalWords = description.split(' ').length;
    const uniquenessRatio = uniqueWords / totalWords;

    if (uniquenessRatio > 0.6) {
      analysis.score += 15;
      analysis.strengths.push('Good lexical diversity');
    } else {
      analysis.weaknesses.push('Repetitive language');
      analysis.suggestions.push('Use more varied vocabulary');
    }

    // SEO analysis
    const hasTitle = /^[A-Z][^.!?]*[.!?]$/.test(description.split('.')[0]);
    if (hasTitle) {
      analysis.score += 15;
      analysis.strengths.push('Strong opening sentence');
    } else {
      analysis.weaknesses.push('Weak opening');
      analysis.suggestions.push('Start with a compelling, complete sentence');
    }

    return analysis;
  }

  /**
   * Extract keywords from text
   */
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction - in reality, this would use NLP
    const words = text.toLowerCase().split(' ');
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall']);

    const keywords = words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
      .slice(0, 10); // Limit to top 10

    return keywords;
  }

  /**
   * Simulate AI generation (for development/testing)
   */
  private static async simulateAIGeneration(
    request: ProductDescriptionRequest
  ): Promise<ProductDescriptionResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const tone = request.tone || 'professional';
    const language = request.language || 'pt-BR';

    // Generate mock description based on product details
    let description = '';

    switch (tone) {
      case 'luxury':
        description = `Descubra a excelência em ${request.productName}, uma peça excepcional da categoria ${request.category}. Com preço acessível de R$ ${request.price.toFixed(2)}, este produto representa o ápice da qualidade e sofisticação. ${request.features ? request.features.join('. ') : 'Características premium que elevam sua experiência.'}`;
        break;
      case 'casual':
        description = `Ei, confira o ${request.productName}! Este produto incrível da categoria ${request.category} está custando apenas R$ ${request.price.toFixed(2)}. ${request.features ? request.features.join('. ') : 'Tem tudo que você precisa para se divertir e aproveitar.'} Perfeito para o dia a dia!`;
        break;
      case 'technical':
        description = `${request.productName} - Produto técnico da categoria ${request.category}. Preço: R$ ${request.price.toFixed(2)}. ${request.features ? 'Especificações: ' + request.features.join('. ') : 'Características técnicas avançadas.'} Ideal para usuários exigentes.`;
        break;
      default: // professional
        description = `Apresentamos o ${request.productName}, um excelente produto da categoria ${request.category} com preço competitivo de R$ ${request.price.toFixed(2)}. ${request.features ? request.features.join('. ') : 'Oferece qualidade e funcionalidade para suas necessidades diárias.'} Uma escolha inteligente para consumidores conscientes.`;
    }

    // Limit length if specified
    if (request.maxLength && description.length > request.maxLength) {
      description = description.substring(0, request.maxLength - 3) + '...';
    }

    const keywords = this.extractKeywords(description);
    const seoTitle = `${request.productName} - ${request.category} | R$ ${request.price.toFixed(2)}`;
    const seoDescription = description.length > 160
      ? description.substring(0, 157) + '...'
      : description;

    return {
      description,
      keywords,
      seoTitle,
      seoDescription,
      confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
      generatedAt: new Date()
    };
  }

  /**
   * Simulate enhancement (for development/testing)
   */
  private static async simulateEnhancement(
    request: ProductEnhancementRequest
  ): Promise<ProductEnhancementResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    let enhancedDescription = request.currentDescription;

    const improvements: string[] = [];
    const changes: string[] = [];

    // Apply requested improvements
    if (request.improvements.includes('seo')) {
      // Add SEO-friendly elements
      enhancedDescription = enhancedDescription.replace(
        /^([^.!?]*[.!?])/,
        '$1 Palavras-chave importantes incluídas para melhor visibilidade.'
      );
      improvements.push('SEO optimization');
      changes.push('Added SEO keywords and meta elements');
    }

    if (request.improvements.includes('engagement')) {
      // Add engaging language
      enhancedDescription += ' Não perca esta oportunidade incrível!';
      improvements.push('Engagement enhancement');
      changes.push('Added compelling call-to-action');
    }

    if (request.improvements.includes('conversion')) {
      // Add conversion-focused elements
      enhancedDescription += ' Compre agora e transforme sua experiência!';
      improvements.push('Conversion optimization');
      changes.push('Added conversion-focused language');
    }

    if (request.improvements.includes('clarity')) {
      // Improve clarity
      enhancedDescription = enhancedDescription.replace(/\s+/g, ' ').trim();
      improvements.push('Clarity improvement');
      changes.push('Improved readability and flow');
    }

    if (request.improvements.includes('uniqueness')) {
      // Add unique elements
      enhancedDescription += ' Uma oferta exclusiva que você não encontra em qualquer lugar.';
      improvements.push('Uniqueness enhancement');
      changes.push('Added unique selling propositions');
    }

    // Limit length if specified
    if (request.targetLength && enhancedDescription.length > request.targetLength) {
      enhancedDescription = enhancedDescription.substring(0, request.targetLength - 3) + '...';
    }

    return {
      enhancedDescription,
      improvements,
      beforeAfterComparison: {
        before: request.currentDescription,
        after: enhancedDescription,
        changes
      },
      confidence: 0.9 + Math.random() * 0.05, // 0.9-0.95
      generatedAt: new Date()
    };
  }

  /**
   * Check if AI service is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // In a real implementation, this would check API connectivity
      return !!this.API_KEY;
    } catch (error) {
      log.error('AI service availability check failed', { error });
      return false;
    }
  }

  /**
   * Get service health status
   */
  static async getHealthStatus(): Promise<{
    available: boolean;
    model: string;
    latency: number;
    lastUsed: Date | null;
  }> {
    const available = await this.isAvailable();

    return {
      available,
      model: this.MODEL,
      latency: available ? 500 + Math.random() * 1000 : 0, // Mock latency
      lastUsed: available ? new Date() : null
    };
  }
}