import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductForm } from '../../components/admin/products/ProductForm';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Mock data - in real app this would come from API
  const [product, setProduct] = React.useState<Product | undefined>();
  const [categories] = React.useState<Array<{ id: string; name: string }>>([
    { id: '1', name: 'Eletrônicos' },
    { id: '2', name: 'Roupas' },
    { id: '3', name: 'Casa & Jardim' },
  ]);
  const [loading, setLoading] = React.useState(isEditing);

  React.useEffect(() => {
    if (isEditing && id) {
      // Mock loading of existing product
      const mockProduct: Product = {
        id,
        name: 'Smartphone XYZ',
        description: 'Um smartphone incrível com câmera de alta qualidade',
        price: 1999.99,
        images: ['https://via.placeholder.com/150'],
        stock: 50,
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTimeout(() => {
        setProduct(mockProduct);
        setLoading(false);
      }, 500);
    }
  }, [id, isEditing]);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    // In real app, call API to create/update product
    console.log('Saving product:', productData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Navigate back to product list
    navigate('/admin/products');
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ProductForm
        product={product}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </AdminLayout>
  );
};