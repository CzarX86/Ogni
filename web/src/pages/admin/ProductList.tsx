import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductTable } from '../../components/admin/products/ProductTable';
import { ProductFilters } from '../../components/admin/products/ProductFilters';
import { ProductForm } from '../../components/admin/products/ProductForm';
import { BulkOperations } from '../../components/admin/products/BulkOperations';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState<Array<{ id: string; name: string }>>([
    { id: '1', name: 'Eletrônicos' },
    { id: '2', name: 'Roupas' },
    { id: '3', name: 'Casa & Jardim' },
  ]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Smartphone XYZ',
        description: 'Um smartphone incrível com câmera de alta qualidade',
        price: 1999.99,
        images: ['https://via.placeholder.com/150'],
        stock: 50,
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Camiseta Básica',
        description: 'Camiseta confortável para o dia a dia',
        price: 29.99,
        images: ['https://via.placeholder.com/150'],
        stock: 100,
        categoryId: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      // In real app, call API to delete product
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      // Update existing product
      const updatedProduct: Product = {
        ...editingProduct,
        ...productData,
        updatedAt: new Date(),
      };
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
    } else {
      // Create new product
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts(prev => [...prev, newProduct]);
    }

    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleProductSelect = (productId: string, selected: boolean) => {
    if (selected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkDelete = (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
    setSelectedProducts([]);
  };

  const handleBulkUpdateCategory = (productIds: string[], categoryId: string) => {
    setProducts(prev => prev.map(p =>
      productIds.includes(p.id) ? { ...p, categoryId } : p
    ));
    setSelectedProducts([]);
  };

  const handleBulkUpdatePrice = (productIds: string[], priceAdjustment: number, adjustmentType: 'fixed' | 'percentage') => {
    setProducts(prev => prev.map(p => {
      if (!productIds.includes(p.id)) return p;

      const newPrice = adjustmentType === 'fixed'
        ? p.price + priceAdjustment
        : p.price * (1 + priceAdjustment / 100);

      return { ...p, price: Math.max(0, newPrice) };
    }));
    setSelectedProducts([]);
  };

  const handleBulkActivate = (productIds: string[]) => {
    // Note: Product type doesn't have 'active' field, so this is a placeholder
    console.log('Bulk activate products:', productIds);
    setSelectedProducts([]);
  };

  const handleBulkDeactivate = (productIds: string[]) => {
    // Note: Product type doesn't have 'active' field, so this is a placeholder
    console.log('Bulk deactivate products:', productIds);
    setSelectedProducts([]);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  if (showForm) {
    return (
      <AdminLayout>
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie o catálogo de produtos</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Novo Produto
          </button>
        </div>

        {/* Filters */}
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {/* Bulk Operations */}
        <BulkOperations
          selectedProducts={products.filter(p => selectedProducts.includes(p.id))}
          onBulkDelete={handleBulkDelete}
          onBulkUpdateCategory={handleBulkUpdateCategory}
          onBulkUpdatePrice={handleBulkUpdatePrice}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          categories={categories}
        />

        {/* Products Table */}
        <ProductTable
          products={filteredAndSortedProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          selectedProducts={selectedProducts}
          onProductSelect={handleProductSelect}
          onSelectAll={handleSelectAll}
        />

        {/* Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-sm text-gray-600">Total de Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock > 0).length}
              </div>
              <div className="text-sm text-gray-600">Em Estoque</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stock === 0).length}
              </div>
              <div className="text-sm text-gray-600">Esgotados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categorias</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
