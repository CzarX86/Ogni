import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Calendar, Clock, User, Search, Filter } from 'lucide-react';
import { BlogService } from '@/shared/services/blogService';
import { BlogPost, BlogCategory } from '@/shared/models/blog';
import { SEO, generateBlogPostStructuredData, SEOUtils } from '@/components/shared/SEO';
import { formatDate } from '@/shared/utils/format';

interface BlogListProps {
  category?: string;
  search?: string;
}

export const BlogList: React.FC<BlogListProps> = ({ category, search }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(search || '');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const blogService = new BlogService();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  const loadCategories = async () => {
    try {
      const cats = await BlogService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filters = {
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        sortBy,
        page: currentPage,
        limit: 12
      };

      const result = await BlogService.getPosts(filters);
      setPosts(result.posts);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: 'newest' | 'oldest' | 'popular') => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Generate structured data for the blog listing
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Ogni',
    description: 'Dicas, tendências e novidades sobre moda, tecnologia e lifestyle',
    url: window.location.href,
    publisher: {
      '@type': 'Organization',
      name: 'Ogni',
      logo: `${window.location.origin}/logo.png`
    },
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${window.location.origin}/blog/${post.slug}`,
      datePublished: post.publishedAt?.toISOString(),
      author: {
        '@type': 'Person',
        name: post.authorName
      }
    }))
  };

  return (
    <>
      <SEO
        title="Blog Ogni - Dicas, Tendências e Novidades"
        description="Descubra dicas incríveis sobre moda, tecnologia, lifestyle e muito mais no blog da Ogni. Conteúdo exclusivo para você se manter informado."
        keywords={['blog', 'dicas', 'tendências', 'moda', 'tecnologia', 'lifestyle']}
        structuredData={structuredData}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Ogni
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Dicas, tendências e novidades sobre moda, tecnologia e lifestyle para você se manter sempre informado.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filtrar por:</span>
            </div>

            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
                <SelectItem value="popular">Mais populares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum post encontrado para os filtros selecionados.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className="mt-4"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <Link to={`/blog/${post.slug}`}>
                    {post.featuredImage && (
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 text-gray-900">
                            {post.category.name}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.authorName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Não publicado'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{SEOUtils.calculateReadingTime(post.content)} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const distance = Math.abs(page - currentPage);
                    return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-1">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="min-w-10"
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};