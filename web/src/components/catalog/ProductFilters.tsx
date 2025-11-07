import React, { useState } from 'react';
import { Category } from '../../types';
import { Filter, Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  priceRange: { min: number; max: number };
  selectedPriceRange: { min: number; max: number };
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest' | 'rating';
  searchTerm: string;
  onCategoryChange: (_categoryId?: string) => void;
  onPriceRangeChange: (_range: { min: number; max: number }) => void;
  onSortChange: (_sort: 'name' | 'price-low' | 'price-high' | 'newest' | 'rating') => void;
  onSearchChange: (_term: string) => void;
  onClearFilters: () => void;
}

const sortOptions: { value: ProductFiltersProps['sortBy']; label: string }[] = [
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'price-low', label: 'Menor preço' },
  { value: 'price-high', label: 'Maior preço' },
  { value: 'newest', label: 'Novidades' },
  { value: 'rating', label: 'Melhor avaliados' },
];

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
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-white/90 shadow-ogni backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 lg:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground"
        >
          <Filter className="h-4 w-4 transition-transform group-hover:rotate-12" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-secondary hover:text-secondary/80"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="border-b border-border/60 px-4 py-5 lg:px-6">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40 transition-colors group-focus-within:text-foreground/70" />
            <Input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Busque por coleção, banho ou ocasião"
              className="h-13 w-full rounded-full border-border/60 bg-white pl-12 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:ring-0"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/40 transition-colors hover:text-foreground/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-5 lg:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            <div className="space-y-2">
              <label
                htmlFor="category-select"
                className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60"
              >
                <SlidersHorizontal className="h-4 w-4 text-secondary" />
                Categoria
              </label>
              <div className="relative">
                <select
                  id="category-select"
                  value={selectedCategory || ''}
                  onChange={(event) => onCategoryChange(event.target.value || undefined)}
                  className="w-full cursor-pointer appearance-none rounded-full border border-border/60 bg-white px-4 py-3 pr-10 text-sm text-foreground/80 transition-colors focus:border-primary focus:outline-none focus:ring-0"
                >
                  <option value="">Todas as peças</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60">
                Faixa de preço
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={selectedPriceRange.min || ''}
                  onChange={(event) =>
                    onPriceRangeChange({
                      ...selectedPriceRange,
                      min: parseFloat(event.target.value) || priceRange.min,
                    })
                  }
                  className="h-11 w-full rounded-full border-border/60 bg-white text-sm focus:border-primary focus:ring-0"
                  min={priceRange.min}
                  max={priceRange.max}
                />
                <span className="text-foreground/40">—</span>
                <Input
                  type="number"
                  placeholder="Máx"
                  value={selectedPriceRange.max || ''}
                  onChange={(event) =>
                    onPriceRangeChange({
                      ...selectedPriceRange,
                      max: parseFloat(event.target.value) || priceRange.max,
                    })
                  }
                  className="h-11 w-full rounded-full border-border/60 bg-white text-sm focus:border-primary focus:ring-0"
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="sort-select"
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60"
              >
                Ordenação
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(event) => onSortChange(event.target.value as ProductFiltersProps['sortBy'])}
                  className="w-full cursor-pointer appearance-none rounded-full border border-border/60 bg-white px-4 py-3 pr-10 text-sm text-foreground/80 transition-colors focus:border-primary focus:outline-none focus:ring-0"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/60">
                Curadoria Ogni
              </p>
              <p className="mt-2 text-sm text-foreground/60">
                Combine filtros para explorar cápsulas especiais, como argolas minimalistas ou brincos festa.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
              {hasActiveFilters ? `${activeFilterCount} filtro(s) aplicado(s)` : 'Sem filtros ativos'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/70 hover:bg-secondary/10 hover:text-foreground"
                onClick={onClearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
