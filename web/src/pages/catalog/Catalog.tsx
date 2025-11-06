import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';
import { ProductGrid } from '../../components/catalog';
import { ProductFilters } from '../../components/catalog';
import { MainLayout } from '../../components/shared/MainLayout';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import { SeedService } from '../../services/seedService';
import { CartService } from '../../services/cartService';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  ShoppingBag,
  Truck,
  Shield,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const navigate = useNavigate();

  const userId = 'demo-user';

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest' | 'rating'>('name');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Iniciando carregamento de dados...');
        
        const [productsData, categoriesData] = await Promise.all([
          ProductService.getAllProducts(),
          CategoryService.getAllCategories(),
        ]);

        console.log('📦 Produtos carregados:', productsData.length);
        console.log('📂 Categorias carregadas:', categoriesData.length);
        
        setProducts(productsData);
        setCategories(categoriesData);

        // Calculate price range from products
        if (productsData.length > 0) {
          const prices = productsData.map((p: Product) => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange({ min: minPrice, max: maxPrice });
          setSelectedPriceRange({ min: minPrice, max: maxPrice });
        }
      } catch (error) {
        console.error('❌ Falha ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (normalizedSearch) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max
    );

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedPriceRange, sortBy, searchTerm]);

  const handleCategoryChange = (categoryId?: string) => {
    setSelectedCategory(categoryId);
  };

  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    setSelectedPriceRange(range);
  };

  const handleSortChange = (sort: 'name' | 'price-low' | 'price-high' | 'newest' | 'rating') => {
    setSortBy(sort);
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedPriceRange(priceRange);
    setSortBy('name');
    setSearchTerm('');
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingProductId(productId);
      await CartService.addItem(userId, productId, 1);
      setNotification({
        type: 'success',
        message: 'Produto adicionado ao carrinho com sucesso.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível adicionar o produto ao carrinho.';
      setNotification({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setAddingProductId(null);
    }
  };

  const handleViewDetails = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      console.log('Starting database seeding...');
      const result = await SeedService.seedDatabase();
      console.log('Seeding result:', result);
      if (result.success) {
        alert('Banco de dados populado com sucesso! Recarregue a página para ver os produtos.');
        // Reload data
        window.location.reload();
      } else {
        alert(`Erro ao popular banco: ${result.error}`);
      }
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Erro ao popular banco de dados: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <MainLayout
      cartItemCount={0} // TODO: implementar contador do carrinho
      onSearch={handleSearchChange}
      searchQuery={searchTerm}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-ogni opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Bem-vindo à revolução do e-commerce
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Compre com
              <span className="bg-gradient-ogni bg-clip-text text-transparent block md:inline"> Inteligência</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Descubra produtos incríveis com preços acessíveis, entrega rápida e experiências personalizadas em todo o Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="bg-gradient-ogni hover:opacity-90 text-white text-lg px-10 py-4 h-auto shadow-ogni transform hover:scale-105 transition-all duration-200">
                <ShoppingBag className="mr-3 h-6 w-6" />
                Explorar Produtos
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-lg px-10 py-4 h-auto shadow-lg transform hover:scale-105 transition-all duration-200">
                <Star className="mr-3 h-6 w-6" />
                Ofertas Especiais
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10k+</div>
                <div className="text-gray-600">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50k+</div>
                <div className="text-gray-600">Clientes Satisfeitos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-gray-600">Avaliação Média</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a Ogni?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tecnologia de ponta e atendimento excepcional para sua melhor experiência de compra
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="group hover:shadow-ogni transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Frete Grátis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Entrega gratuita para compras acima de R$ 99 em todo território nacional
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-ogni transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Compra 100% Segura</h3>
                <p className="text-gray-600 leading-relaxed">
                  Seus dados protegidos com criptografia avançada e certificação SSL
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-ogni transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Qualidade Garantida</h3>
                <p className="text-gray-600 leading-relaxed">
                  Produtos selecionados com os melhores reviews e garantia estendida
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent-foreground text-sm font-medium mb-6">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Nossa Coleção
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Produtos em Destaque
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore nossa coleção completa de produtos de alta qualidade, selecionados especialmente para você
            </p>
          </div>

          {/* Seed Database Button */}
          {products.length === 0 && !loading && (
            <div className="text-center mb-12">
              <Card className="max-w-lg mx-auto shadow-ogni border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-ogni rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Banco de dados vazio</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Parece que ainda não temos produtos cadastrados. Vamos popular com dados de teste para você explorar?
                  </p>
                  <Button
                    onClick={handleSeedDatabase}
                    disabled={seeding}
                    size="lg"
                    className="bg-gradient-ogni hover:opacity-90 text-white px-8 py-3 h-auto shadow-ogni transform hover:scale-105 transition-all duration-200"
                  >
                    {seeding ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Populando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-5 w-5" />
                        Popular com dados de teste
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notification */}
          {notification && (
            <div className="mb-8">
              <div
                className={`rounded-lg border p-4 flex items-start justify-between ${
                  notification.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <div>
                  <p className="font-medium">
                    {notification.type === 'success' ? 'Tudo certo!' : 'Algo deu errado'}
                  </p>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 text-sm font-medium underline"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-8">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              selectedPriceRange={selectedPriceRange}
              sortBy={sortBy}
              searchTerm={searchTerm}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onSortChange={handleSortChange}
              onSearchChange={handleSearchChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {loading ? 'Carregando...' : `${filteredProducts.length} produto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
              </p>
              {filteredProducts.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            processingProductId={addingProductId}
            emptyMessage="Nenhum produto encontrado com os filtros selecionados. Tente ajustar seus filtros ou explorar outras categorias."
          />

          {/* Load More / Pagination could go here */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-16">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 h-auto shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Carregar Mais Produtos
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Catalog;