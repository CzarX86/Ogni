import { log } from '../utils/logger';
import { BlogPost, BlogCategory, BlogComment, BlogAnalytics } from '../models/blog';

export interface BlogFilters {
  category?: string;
  tag?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  pagination: BlogPagination;
  filters: BlogFilters;
}

/**
 * Blog Service
 * Handles blog post and category management
 */
export class BlogService {
  private static readonly COLLECTION_POSTS = 'blog_posts';
  private static readonly COLLECTION_CATEGORIES = 'blog_categories';
  private static readonly COLLECTION_COMMENTS = 'blog_comments';

  /**
   * Get all blog posts with filtering and pagination
   */
  static async getPosts(
    filters: BlogFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<BlogPostListResponse> {
    try {
      log.info('Fetching blog posts', { filters, pagination });

      // In a real implementation, this would query Firestore
      // For now, return mock data
      const mockPosts: BlogPost[] = this.generateMockPosts();

      let filteredPosts = mockPosts;

      // Apply filters
      if (filters.category) {
        filteredPosts = filteredPosts.filter(post => post.categoryId === filters.category);
      }
      if (filters.tag) {
        filteredPosts = filteredPosts.filter(post =>
          post.tags.some(tag => tag.toLowerCase().includes(filters.tag!.toLowerCase()))
        );
      }
      if (filters.author) {
        filteredPosts = filteredPosts.filter(post => post.authorId === filters.author);
      }
      if (filters.status) {
        filteredPosts = filteredPosts.filter(post => post.status === filters.status);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
        );
      }

      // Apply date filters
      if (filters.dateFrom) {
        filteredPosts = filteredPosts.filter(post =>
          post.publishedAt && post.publishedAt >= filters.dateFrom!
        );
      }
      if (filters.dateTo) {
        filteredPosts = filteredPosts.filter(post =>
          post.publishedAt && post.publishedAt <= filters.dateTo!
        );
      }

      // Sort by published date (newest first)
      filteredPosts.sort((a, b) => {
        if (!a.publishedAt || !b.publishedAt) return 0;
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      });

      // Apply pagination
      const total = filteredPosts.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      return {
        posts: paginatedPosts,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages
        },
        filters
      };
    } catch (error) {
      log.error('Failed to fetch blog posts', { error, filters, pagination });
      throw new Error('Failed to fetch blog posts');
    }
  }

  /**
   * Get a single blog post by ID or slug
   */
  static async getPost(idOrSlug: string): Promise<BlogPost | null> {
    try {
      log.info('Fetching blog post', { idOrSlug });

      // In a real implementation, this would query Firestore
      const mockPosts = this.generateMockPosts();
      const post = mockPosts.find(p => p.id === idOrSlug || p.slug === idOrSlug);

      if (post) {
        // Increment view count
        await this.incrementViewCount(post.id);
        post.viewCount++;
      }

      return post || null;
    } catch (error) {
      log.error('Failed to fetch blog post', { error, idOrSlug });
      throw new Error('Failed to fetch blog post');
    }
  }

  /**
   * Create a new blog post
   */
  static async createPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'shareCount'>): Promise<BlogPost> {
    try {
      log.info('Creating blog post', { title: postData.title });

      const now = new Date();
      const post: BlogPost = {
        ...postData,
        id: `post_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0
      };

      // In a real implementation, this would save to Firestore
      log.info('Blog post created successfully', { postId: post.id });

      return post;
    } catch (error) {
      log.error('Failed to create blog post', { error, title: postData.title });
      throw new Error('Failed to create blog post');
    }
  }

  /**
   * Update an existing blog post
   */
  static async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      log.info('Updating blog post', { postId: id });

      const existingPost = await this.getPost(id);
      if (!existingPost) {
        throw new Error('Blog post not found');
      }

      const updatedPost: BlogPost = {
        ...existingPost,
        ...updates,
        updatedAt: new Date()
      };

      // In a real implementation, this would update Firestore
      log.info('Blog post updated successfully', { postId: id });

      return updatedPost;
    } catch (error) {
      log.error('Failed to update blog post', { error, postId: id });
      throw new Error('Failed to update blog post');
    }
  }

  /**
   * Delete a blog post
   */
  static async deletePost(id: string): Promise<void> {
    try {
      log.info('Deleting blog post', { postId: id });

      // In a real implementation, this would delete from Firestore
      log.info('Blog post deleted successfully', { postId: id });
    } catch (error) {
      log.error('Failed to delete blog post', { error, postId: id });
      throw new Error('Failed to delete blog post');
    }
  }

  /**
   * Get all blog categories
   */
  static async getCategories(): Promise<BlogCategory[]> {
    try {
      log.info('Fetching blog categories');

      // In a real implementation, this would query Firestore
      return this.generateMockCategories();
    } catch (error) {
      log.error('Failed to fetch blog categories', { error });
      throw new Error('Failed to fetch blog categories');
    }
  }

  /**
   * Get related posts for a given post
   */
  static async getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPost[]> {
    try {
      log.info('Fetching related posts', { postId, limit });

      const post = await this.getPost(postId);
      if (!post) return [];

      const allPosts = await this.getPosts();
      const relatedPosts = allPosts.posts
        .filter(p => p.id !== postId && p.categoryId === post.categoryId)
        .slice(0, limit);

      return relatedPosts;
    } catch (error) {
      log.error('Failed to fetch related posts', { error, postId });
      return [];
    }
  }

  /**
   * Get blog analytics
   */
  static async getAnalytics(postId?: string, dateRange?: { start: Date; end: Date }): Promise<BlogAnalytics[]> {
    try {
      log.info('Fetching blog analytics', { postId, dateRange });

      // In a real implementation, this would aggregate analytics data
      return this.generateMockAnalytics(postId);
    } catch (error) {
      log.error('Failed to fetch blog analytics', { error, postId });
      return [];
    }
  }

  /**
   * Increment view count for a post
   */
  private static async incrementViewCount(postId: string): Promise<void> {
    try {
      // In a real implementation, this would atomically increment in Firestore
      log.debug('Incremented view count', { postId });
    } catch (error) {
      log.error('Failed to increment view count', { error, postId });
    }
  }

  /**
   * Generate mock blog posts for development
   */
  private static generateMockPosts(): BlogPost[] {
    const categories = this.generateMockCategories();
    const now = new Date();

    return [
      {
        id: 'post_1',
        title: 'Como Escolher o Melhor Smartphone para suas Necessidades',
        slug: 'como-escolher-melhor-smartphone',
        excerpt: 'Um guia completo para ajudar você a escolher o smartphone ideal baseado no seu perfil de uso e orçamento.',
        content: `# Como Escolher o Melhor Smartphone para suas Necessidades

Escolher um smartphone pode ser uma tarefa desafiadora dada a quantidade de opções disponíveis no mercado. Este guia vai ajudar você a tomar uma decisão informada.

## 1. Defina suas Prioridades

Antes de começar a pesquisar, pergunte a si mesmo:
- Qual será o uso principal? (trabalho, jogos, fotografia, etc.)
- Qual é o seu orçamento?
- Você prefere Android ou iOS?

## 2. Características Técnicas Importantes

### Processador
O processador determina a velocidade e eficiência do aparelho...

### Armazenamento
Considere tanto armazenamento interno quanto expansão via cartão microSD...

### Câmera
Para fotografia: número de megapixels, estabilização óptica, modo noturno...

## 3. Conclusão

O melhor smartphone é aquele que atende às suas necessidades específicas. Não se deixe levar apenas pelas especificações técnicas - teste o aparelho pessoalmente sempre que possível.`,
        authorId: 'author_1',
        authorName: 'João Silva',
        authorAvatar: '/avatars/joao.jpg',
        categoryId: 'tech',
        category: categories[0],
        tags: ['smartphone', 'tecnologia', 'guia', 'compras'],
        featuredImage: '/blog/smartphone-guide.jpg',
        images: ['/blog/smartphone-guide.jpg', '/blog/smartphone-comparison.jpg'],
        status: 'published',
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        seoTitle: 'Como Escolher o Melhor Smartphone - Guia Completo 2025',
        seoDescription: 'Descubra como escolher o smartphone ideal para suas necessidades. Guia completo com dicas práticas e comparações.',
        seoKeywords: ['smartphone', 'celular', 'comprar', 'guia', 'tecnologia'],
        readingTime: 8,
        viewCount: 1250,
        likeCount: 45,
        commentCount: 12,
        shareCount: 8,
        relatedPosts: ['post_2', 'post_3'],
        structuredData: {
          '@type': 'Article',
          headline: 'Como Escolher o Melhor Smartphone para suas Necessidades',
          author: {
            '@type': 'Person',
            name: 'João Silva'
          },
          datePublished: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          image: '/blog/smartphone-guide.jpg'
        },
        metadata: {
          wordCount: 850,
          headings: [
            { level: 1, text: 'Como Escolher o Melhor Smartphone para suas Necessidades', id: 'como-escolher-melhor-smartphone' },
            { level: 2, text: '1. Defina suas Prioridades', id: 'defina-suas-prioridades' },
            { level: 2, text: '2. Características Técnicas Importantes', id: 'caracteristicas-tecnicas' },
            { level: 3, text: 'Processador', id: 'processador' },
            { level: 3, text: 'Armazenamento', id: 'armazenamento' },
            { level: 3, text: 'Câmera', id: 'camera' },
            { level: 2, text: '3. Conclusão', id: 'conclusao' }
          ],
          links: [],
          images: [
            { url: '/blog/smartphone-guide.jpg', alt: 'Comparação de smartphones' },
            { url: '/blog/smartphone-comparison.jpg', alt: 'Gráfico de comparação técnica' }
          ]
        },
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'post_2',
        title: 'Tendências de Moda Sustentável para 2025',
        slug: 'tendencias-moda-sustentavel-2025',
        excerpt: 'Descubra as principais tendências da moda sustentável que vão dominar o mercado em 2025.',
        content: `# Tendências de Moda Sustentável para 2025

A moda sustentável está se tornando cada vez mais importante. Veja as tendências que vão definir o futuro da indústria.

## Materiais Inovadores

- **Têxteis reciclados**: Feitos a partir de garrafas PET e outros materiais reciclados
- **Couro vegetal**: Alternativas veganas ao couro animal
- **Algodão orgânico**: Cultivado sem agrotóxicos

## Práticas Sustentáveis

### Upcycling e Remaking
Dar nova vida a peças antigas através de redesign...

### Economia Circular
Comprar menos, mas comprar melhor...

## Conclusão

A moda sustentável não é apenas uma tendência, é o futuro da indústria.`,
        authorId: 'author_2',
        authorName: 'Maria Santos',
        authorAvatar: '/avatars/maria.jpg',
        categoryId: 'lifestyle',
        category: categories[1],
        tags: ['moda', 'sustentabilidade', 'tendências', '2025'],
        featuredImage: '/blog/sustainable-fashion.jpg',
        images: ['/blog/sustainable-fashion.jpg'],
        status: 'published',
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        seoTitle: 'Tendências de Moda Sustentável 2025 - O Futuro da Indústria',
        seoDescription: 'Conheça as principais tendências da moda sustentável que vão revolucionar a indústria em 2025.',
        seoKeywords: ['moda sustentável', 'tendências 2025', 'sustentabilidade', 'eco fashion'],
        readingTime: 6,
        viewCount: 890,
        likeCount: 67,
        commentCount: 23,
        shareCount: 15,
        relatedPosts: ['post_1', 'post_4'],
        structuredData: {
          '@type': 'Article',
          headline: 'Tendências de Moda Sustentável para 2025',
          author: {
            '@type': 'Person',
            name: 'Maria Santos'
          },
          datePublished: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          image: '/blog/sustainable-fashion.jpg'
        },
        metadata: {
          wordCount: 620,
          headings: [
            { level: 1, text: 'Tendências de Moda Sustentável para 2025', id: 'tendencias-moda-sustentavel-2025' },
            { level: 2, text: 'Materiais Inovadores', id: 'materiais-inovadores' },
            { level: 2, text: 'Práticas Sustentáveis', id: 'praticas-sustentaveis' },
            { level: 3, text: 'Upcycling e Remaking', id: 'upcycling-remaking' },
            { level: 3, text: 'Economia Circular', id: 'economia-circular' },
            { level: 2, text: 'Conclusão', id: 'conclusao' }
          ],
          links: [],
          images: [
            { url: '/blog/sustainable-fashion.jpg', alt: 'Peças de moda sustentável' }
          ]
        },
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * Generate mock categories for development
   */
  private static generateMockCategories(): BlogCategory[] {
    return [
      {
        id: 'tech',
        name: 'Tecnologia',
        slug: 'tecnologia',
        description: 'Artigos sobre gadgets, inovação e tecnologia',
        color: '#3b82f6',
        icon: '💻',
        postCount: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'lifestyle',
        name: 'Estilo de Vida',
        slug: 'estilo-de-vida',
        description: 'Conteúdo sobre moda, bem-estar e lifestyle',
        color: '#ec4899',
        icon: '✨',
        postCount: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'business',
        name: 'Negócios',
        slug: 'negocios',
        description: 'Artigos sobre empreendedorismo e mercado',
        color: '#10b981',
        icon: '💼',
        postCount: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Generate mock analytics for development
   */
  private static generateMockAnalytics(postId?: string): BlogAnalytics[] {
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (postId) {
      return [{
        postId,
        views: 1250,
        uniqueViews: 980,
        avgTimeOnPage: 180, // seconds
        bounceRate: 35.2,
        socialShares: {
          facebook: 45,
          twitter: 23,
          linkedin: 12,
          pinterest: 8
        },
        topReferrers: [
          { source: 'google.com', count: 320 },
          { source: 'facebook.com', count: 180 },
          { source: 'twitter.com', count: 95 }
        ],
        deviceBreakdown: {
          desktop: 45.2,
          mobile: 48.1,
          tablet: 6.7
        },
        dateRange: {
          start: startDate,
          end: now
        }
      }];
    }

    return [];
  }
}