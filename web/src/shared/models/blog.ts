export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  categoryId: string;
  category: BlogCategory;
  tags: string[];
  featuredImage?: string;
  images: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  readingTime: number; // in minutes
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  relatedPosts: string[]; // post IDs
  structuredData?: {
    '@type': string;
    [key: string]: any;
  };
  metadata: {
    wordCount: number;
    headings: Array<{
      level: number;
      text: string;
      id: string;
    }>;
    links: string[];
    images: Array<{
      url: string;
      alt?: string;
      caption?: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorId?: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  content: string;
  parentId?: string; // for nested comments
  replies: BlogComment[];
  isApproved: boolean;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogAnalytics {
  postId: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  socialShares: {
    facebook: number;
    twitter: number;
    linkedin: number;
    pinterest: number;
  };
  topReferrers: Array<{
    source: string;
    count: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface BlogSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  ogType: 'article' | 'website';
  twitterCard: 'summary' | 'summary_large_image';
  structuredData: object;
  metaRobots: string[];
  lastModified: Date;
}