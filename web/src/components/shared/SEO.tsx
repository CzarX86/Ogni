import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BlogSEOData } from '@/shared/models/blog';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: object;
  noIndex?: boolean;
  lastModified?: Date;
  author?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  section?: string;
  tags?: string[];
}

/**
 * SEO Component
 * Manages all meta tags, Open Graph, Twitter Cards, and structured data
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
  lastModified,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  // Default values
  const defaultTitle = 'Ogni - Sua Loja Online de Confiança';
  const defaultDescription = 'Descubra produtos incríveis com entrega rápida e segura. Moda, tecnologia e muito mais com as melhores ofertas.';
  const defaultImage = '/og-image.jpg';
  const siteUrl = window.location.origin;

  const fullTitle = title ? `${title} | Ogni` : defaultTitle;
  const metaDescription = description || defaultDescription;
  const canonical = canonicalUrl || window.location.href;
  const imageUrl = ogImage ? (ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`) : `${siteUrl}${defaultImage}`;

  // Generate keywords string
  const keywordsString = keywords.length > 0 ? keywords.join(', ') : 'loja online, compras, produtos, entrega, ofertas';

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywordsString} />
      <link rel="canonical" href={canonical} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Author and dates */}
      {author && <meta name="author" content={author} />}
      {lastModified && <meta name="last-modified" content={lastModified.toISOString()} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime.toISOString()} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime.toISOString()} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Ogni" />

      {/* Article specific Open Graph */}
      {ogType === 'article' && section && <meta property="article:section" content={section} />}
      {tags.length > 0 && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Additional meta tags for better SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="pt-BR" />
      <meta name="theme-color" content="#3b82f6" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

/**
 * Blog SEO Component
 * Specialized SEO component for blog posts
 */
export const BlogSEO: React.FC<{ seoData: BlogSEOData }> = ({ seoData }) => {
  return (
    <SEO
      title={seoData.title}
      description={seoData.description}
      keywords={seoData.keywords}
      canonicalUrl={seoData.canonicalUrl}
      ogImage={seoData.ogImage}
      ogType={seoData.ogType}
      twitterCard={seoData.twitterCard}
      structuredData={seoData.structuredData}
      lastModified={seoData.lastModified}
    />
  );
};

/**
 * Generate structured data for blog posts
 */
export const generateBlogPostStructuredData = (post: {
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: Date;
  modifiedAt: Date;
  featuredImage?: string;
  canonicalUrl: string;
  tags: string[];
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ogni',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/logo.png`
      }
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.modifiedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl
    },
    image: post.featuredImage ? `${window.location.origin}${post.featuredImage}` : undefined,
    keywords: post.tags.join(', '),
    articleSection: 'Blog',
    url: post.canonicalUrl
  };
};

/**
 * Generate structured data for organization
 */
export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ogni',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    description: 'Sua loja online de confiança com produtos incríveis e entrega rápida.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-11-99999-9999',
      contactType: 'customer service',
      availableLanguage: 'Portuguese'
    },
    sameAs: [
      'https://www.facebook.com/ogni',
      'https://www.instagram.com/ogni',
      'https://www.twitter.com/ogni'
    ]
  };
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{
  name: string;
  url: string;
}>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
};

/**
 * SEO utilities
 */
export class SEOUtils {
  /**
   * Generate SEO-friendly slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove multiple hyphens
  }

  /**
   * Generate excerpt from content
   */
  static generateExcerpt(content: string, maxLength: number = 160): string {
    // Remove markdown formatting and HTML tags
    const plainText = content
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find the last complete word within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }

    return truncated + '...';
  }

  /**
   * Calculate reading time
   */
  static calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
    const plainText = content
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .trim();

    const wordCount = plainText.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Extract headings from markdown content
   */
  static extractHeadings(content: string): Array<{
    level: number;
    text: string;
    id: string;
  }> {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: Array<{
      level: number;
      text: string;
      id: string;
    }> = [];

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = this.generateSlug(text);

      headings.push({ level, text, id });
    }

    return headings;
  }

  /**
   * Generate SEO title from post title
   */
  static generateSEOTitle(title: string, maxLength: number = 60): string {
    if (title.length <= maxLength) {
      return title;
    }

    // Try to cut at word boundary
    const truncated = title.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex);
    }

    return truncated;
  }

  /**
   * Generate SEO description from excerpt
   */
  static generateSEODescription(excerpt: string, maxLength: number = 160): string {
    if (excerpt.length <= maxLength) {
      return excerpt;
    }

    const truncated = excerpt.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }

    return truncated + '...';
  }

  /**
   * Extract keywords from content
   */
  static extractKeywords(content: string, maxKeywords: number = 10): string[] {
    const words = content
      .toLowerCase()
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Count word frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }
}