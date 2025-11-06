import React, { useState } from 'react';
import { Category } from '../../types';
import { Filter, Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

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
    { value: 'name', label: '🔤 Nome (A-Z)', icon: '🔤' },
    { value: 'price-low', label: '💰 Menor Preço', icon: '💰' },
    { value: 'price-high', label: '💎 Maior Preço', icon: '💎' },
    { value: 'newest', label: '✨ Mais Recentes', icon: '✨' },
    { value: 'rating', label: '⭐ Melhor Avaliados', icon: '⭐' },
  ] as const;

  const hasActiveFilters =
    !!selectedCategory ||
    selectedPriceRange.min > priceRange.min ||
    selectedPriceRange.max < priceRange.max ||
    searchTerm.trim().length > 0;

  const activeFilterCount = [
    !!selectedCategory,
    selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max,
    searchTerm.trim().length > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-ogni border border-gray-100 overflow-hidden">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-100">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium group"
        >
          <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Filtros</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-ogni rounded-full animate-pulse-slow">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-accent hover:text-accent/80"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filters Content */}
      <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
        {/* Search Bar - Full Width */}
        <div className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="🔍 Busque por nome, descrição ou categoria..."
              className="w-full pl-12 pr-4 h-14 text-base rounded-xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Grid */}
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <label htmlFor="category-select" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Categoria
              </label>
              <div className="relative">
                <select
                  id="category-select"
                  value={selectedCategory || ''}
                  onChange={(e) => onCategoryChange(e.target.value || undefined)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:bg-gray-100"
                >
                  <option value="">📦 Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {selectedCategory && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-ogni rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                💰 Faixa de Preço
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={selectedPriceRange.min || ''}
                  onChange={(e) => onPriceRangeChange({
                    ...selectedPriceRange,
                    min: parseFloat(e.target.value) || priceRange.min
                  })}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl h-12 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min={priceRange.min}
                  max={priceRange.max}
                />
                <span className="text-gray-400 font-medium">—</span>
                <Input
                  type="number"
                  placeholder="Máx"
                  value={selectedPriceRange.max || ''}
                  onChange={(e) => onPriceRangeChange({
                    ...selectedPriceRange,
                    max: parseFloat(e.target.value) || priceRange.max
                  })}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl h-12 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label htmlFor="sort-select" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                📊 Ordenar por
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:bg-gray-100"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <Button
                  onClick={onClearFilters}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-2 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent transition-all font-semibold group"
                >
                  <X className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Limpar Filtros
                </Button>
              ) : (
                <div className="w-full h-12 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
                  ✨ Sem filtros ativos
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Filtros ativos:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => onCategoryChange(undefined)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {(selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-sm font-medium">
                    R$ {selectedPriceRange.min} - R$ {selectedPriceRange.max}
                    <button
                      onClick={() => onPriceRangeChange(priceRange)}
                      className="hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                    "{searchTerm}"
                    <button
                      onClick={() => onSearchChange('')}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};