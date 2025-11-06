import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../../types';
import { ProductGrid } from '../../components/catalog';
import { ProductFilters } from '../../components/catalog';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import { SeedService } from '../../services/seedService';
import { CartService } from '../../services/cartService';
import { Button } from '../../components/ui/button';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Catálogo de Produtos
              </h1>
              <p className="text-gray-600 mt-2">
                Descubra nossa seleção de produtos de qualidade
              </p>
            </div>
            {products.length === 0 && !loading && (
              <Button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {seeding ? 'Populando...' : 'Popular Banco de Dados'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        {notification && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 flex items-start justify-between ${
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
        )}

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

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Carregando...' : `${filteredProducts.length} produto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          processingProductId={addingProductId}
          emptyMessage="Nenhum produto encontrado com os filtros selecionados. Tente ajustar seus filtros."
        />
      </div>
    </div>
  );
};

export default Catalog;