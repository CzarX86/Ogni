import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { ProductGrid } from '../../components/catalog';
import { ProductFilters } from '../../components/catalog';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

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
        const [productsData, categoriesData] = await Promise.all([
          ProductService.getAllProducts(),
          CategoryService.getAllCategories(),
        ]);

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
        console.error('Failed to load catalog data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

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
  }, [products, selectedCategory, selectedPriceRange, sortBy]);

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
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', productId);
  };

  const handleViewDetails = (productId: string) => {
    // TODO: Navigate to product detail page
    console.log('View details:', productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Catálogo de Produtos
          </h1>
          <p className="text-gray-600 mt-2">
            Descubra nossa seleção de produtos de qualidade
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          priceRange={priceRange}
          selectedPriceRange={selectedPriceRange}
          sortBy={sortBy}
          onCategoryChange={handleCategoryChange}
          onPriceRangeChange={handlePriceRangeChange}
          onSortChange={handleSortChange}
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
          emptyMessage="Nenhum produto encontrado com os filtros selecionados. Tente ajustar seus filtros."
        />
      </div>
    </div>
  );
};

export default Catalog;