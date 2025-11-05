import React, { useState } from 'react';
import { Category } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  priceRange: { min: number; max: number };
  selectedPriceRange: { min: number; max: number };
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest' | 'rating';
  searchTerm: string;
  onCategoryChange: (categoryId?: string) => void;
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  onSortChange: (sort: 'name' | 'price-low' | 'price-high' | 'newest' | 'rating') => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  priceRange,
  selectedPriceRange,
  sortBy,
  searchTerm,
  onCategoryChange,
  onPriceRangeChange,
  onSortChange,
  onSearchChange,
  onClearFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Nome (A-Z)' },
    { value: 'price-low', label: 'Preço (Menor primeiro)' },
    { value: 'price-high', label: 'Preço (Maior primeiro)' },
    { value: 'newest', label: 'Mais recentes' },
    { value: 'rating', label: 'Melhor avaliados' },
  ] as const;

  const hasActiveFilters =
    !!selectedCategory ||
    selectedPriceRange.min > priceRange.min ||
    selectedPriceRange.max < priceRange.max ||
    searchTerm.trim().length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Filters Content */}
      <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div>
          <label htmlFor="catalog-search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar produtos
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0011.15 11.15z"
                />
              </svg>
            </span>
            <input
              id="catalog-search"
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Busque por nome ou descrição"
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              id="category-select"
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faixa de Preço
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={selectedPriceRange.min || ''}
                onChange={(e) => onPriceRangeChange({
                  ...selectedPriceRange,
                  min: parseFloat(e.target.value) || priceRange.min
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={priceRange.min}
                max={priceRange.max}
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={selectedPriceRange.max || ''}
                onChange={(e) => onPriceRangeChange({
                  ...selectedPriceRange,
                  max: parseFloat(e.target.value) || priceRange.max
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={priceRange.min}
                max={priceRange.max}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};