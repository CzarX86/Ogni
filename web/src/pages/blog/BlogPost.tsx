import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, MessageCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogService } from '@/shared/services/blogService';
import { BlogPost } from '@/shared/models/blog';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { SEO, generateBlogPostStructuredData, SEOUtils } from '@/components/shared/SEO';
import { formatDate } from '@/shared/utils/format';

interface BlogPostPageProps {}

export const BlogPostPage: React.FC<BlogPostPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const postData = await BlogService.getPost(postSlug);
      if (!postData) {
        setError('Post não encontrado');
        return;
      }

      setPost(postData);

      // Load related posts
      const related = await BlogService.getRelatedPosts(postData.id, 3);
      setRelatedPosts(related);
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Erro ao carregar o post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    if (!post) return;
    setLiked(!liked);
    // In a real implementation, this would update the like count in the database
  };

  const handleShare = async () => {
    if (!post) return;

    const url = window.location.href;
    const title = post.title;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (err) {
        console.error('Error sharing:', err);
        fallbackShare(url, title);
      }
    } else {
      fallbackShare(url, title);
    }
  };

  const fallbackShare = (url: string, title: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado para a área de transferência!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copiado para a área de transferência!');
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Post não encontrado'}
          </h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate SEO data
  const seoData = {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords || post.tags,
    canonicalUrl: `${window.location.origin}/blog/${post.slug}`,
    ogImage: post.featuredImage,
    ogType: 'article' as const,
    twitterCard: 'summary_large_image' as const,
    structuredData: generateBlogPostStructuredData({
      title: post.title,
      excerpt: post.excerpt,
      authorName: post.authorName,
      publishedAt: post.publishedAt || new Date(),
      modifiedAt: post.updatedAt,
      featuredImage: post.featuredImage,
      canonicalUrl: `${window.location.origin}/blog/${post.slug}`,
      tags: post.tags
    }),
    lastModified: post.updatedAt,
    author: post.authorName,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    section: post.category.name,
    tags: post.tags
  };

  return (
    <>
      <SEO {...seoData} />

      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" style={{ backgroundColor: post.category.color }}>
                {post.category.icon} {post.category.name}
              </Badge>
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {post.excerpt}
            </p>

            {/* Author and Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                  <AvatarFallback>
                    {post.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{post.authorName}</div>
                  <div className="text-xs">Autor</div>
                </div>
              </div>

              {post.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} min de leitura</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount} visualizações</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <MarkdownRenderer content={post.content} className="mb-8" />

          {/* Engagement */}
          <div className="flex items-center justify-between py-6 border-t border-b">
            <div className="flex items-center gap-4">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                <span>{post.likeCount + (liked ? 1 : 0)}</span>
              </Button>

              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentCount}</span>
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Posts Relacionados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="group hover:shadow-lg transition-shadow">
                    <Link to={`/blog/${relatedPost.slug}`}>
                      {relatedPost.featuredImage && (
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
};