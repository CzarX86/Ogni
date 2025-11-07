import React, { useState } from 'react';
import { Product } from '../../../types';

interface BulkOperationsProps {
  selectedProducts: Product[];
  onBulkDelete: (_productIds: string[]) => void;
  onBulkUpdateCategory: (_productIds: string[], _categoryId: string) => void;
  onBulkUpdatePrice: (_productIds: string[], _priceAdjustment: number, _adjustmentType: 'fixed' | 'percentage') => void;
  onBulkActivate: (_productIds: string[]) => void;
  onBulkDeactivate: (_productIds: string[]) => void;
  categories: Array<{ id: string; name: string }>;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedProducts,
  onBulkDelete,
  onBulkUpdateCategory,
  onBulkUpdatePrice,
  onBulkActivate,
  onBulkDeactivate,
  categories,
}) => {
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'fixed' | 'percentage'>('fixed');
  const [selectedCategory, setSelectedCategory] = useState('');

  if (selectedProducts.length === 0) {
    return null;
  }

  const handleBulkDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedProducts.length} produto(s)?`)) {
      onBulkDelete(selectedProducts.map(p => p.id));
      setShowBulkMenu(false);
    }
  };

  const handleBulkActivate = () => {
    onBulkActivate(selectedProducts.map(p => p.id));
    setShowBulkMenu(false);
  };

  const handleBulkDeactivate = () => {
    onBulkDeactivate(selectedProducts.map(p => p.id));
    setShowBulkMenu(false);
  };

  const handlePriceUpdate = () => {
    onBulkUpdatePrice(
      selectedProducts.map(p => p.id),
      priceAdjustment,
      adjustmentType
    );
    setShowPriceModal(false);
    setShowBulkMenu(false);
    setPriceAdjustment(0);
  };

  const handleCategoryUpdate = () => {
    if (selectedCategory) {
      onBulkUpdateCategory(selectedProducts.map(p => p.id), selectedCategory);
      setShowCategoryModal(false);
      setShowBulkMenu(false);
      setSelectedCategory('');
    }
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-800">
              {selectedProducts.length} produto(s) selecionado(s)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Ações em Massa ▼
            </button>
          </div>
        </div>

        {showBulkMenu && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                onClick={handleBulkActivate}
                className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
              >
                Ativar
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="px-3 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              >
                Desativar
              </button>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-3 py-2 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
              >
                Mudar Categoria
              </button>
              <button
                onClick={() => setShowPriceModal(true)}
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
              >
                Ajustar Preço
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price Adjustment Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajustar Preço</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Ajuste
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as 'fixed' | 'percentage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fixed">Valor Fixo (R$)</option>
                  <option value="percentage">Porcentagem (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {adjustmentType === 'fixed' ? 'Valor (R$)' : 'Porcentagem (%)'}
                </label>
                <input
                  type="number"
                  value={priceAdjustment}
                  onChange={(e) => setPriceAdjustment(parseFloat(e.target.value) || 0)}
                  step={adjustmentType === 'fixed' ? '0.01' : '1'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={adjustmentType === 'fixed' ? '10.00' : '10'}
                />
              </div>

              <div className="text-sm text-gray-600">
                {adjustmentType === 'fixed'
                  ? `Adicionar R$ ${priceAdjustment.toFixed(2)} a cada produto`
                  : `Ajustar preço em ${priceAdjustment}% para cada produto`
                }
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPriceModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePriceUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Change Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Mudar Categoria</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCategoryUpdate}
                disabled={!selectedCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};