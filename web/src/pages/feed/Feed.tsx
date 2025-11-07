import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Feed } from '../../components/feed/Feed';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Users,
  ShoppingBag,
  Filter
} from 'lucide-react';
import { log } from 'shared/utils/logger';

const FeedPage: React.FC = () => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [algorithm, setAlgorithm] = useState<'personalized' | 'trending' | 'discovery'>('personalized');

  // Mock user detection - in a real app, this would come from auth context
  useEffect(() => {
    // Simulate checking if user is logged in
    const checkUser = async () => {
      try {
        // For demo purposes, we'll assume a user is logged in
        // In a real app, this would check authentication state
        setUserId('demo-user');
        log.info('Feed page loaded', { userId: 'demo-user' });
      } catch {
        log.info('Feed page loaded for anonymous user');
      }
    };

    checkUser();
  }, []);

  const handleAlgorithmChange = (newAlgorithm: 'personalized' | 'trending' | 'discovery') => {
    setAlgorithm(newAlgorithm);
    log.info('Algorithm changed', { algorithm: newAlgorithm });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-blue-600" />
                {t('feed.productFeed')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('feed.discoverProducts')}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {t('feed.filters')}
              </Button>
            </div>
          </div>

          {/* Algorithm selector */}
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm font-medium text-gray-700">{t('feed.algorithm')}:</span>
            <div className="flex space-x-2">
              <Button
                variant={algorithm === 'personalized' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleAlgorithmChange('personalized')}
                className="flex items-center"
              >
                <Heart className="h-4 w-4 mr-1" />
                {t('feed.personalized')}
              </Button>
              <Button
                variant={algorithm === 'trending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleAlgorithmChange('trending')}
                className="flex items-center"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                {t('feed.trending')}
              </Button>
              <Button
                variant={algorithm === 'discovery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleAlgorithmChange('discovery')}
                className="flex items-center"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {t('feed.discovery')}
              </Button>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('feed.priceRange')}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder={t('feed.min')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="number"
                        placeholder={t('feed.max')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('feed.category')}
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      aria-label="Category filter"
                    >
                      <option>{t('feed.allCategories')}</option>
                      <option>{t('feed.electronics')}</option>
                      <option>{t('feed.clothing')}</option>
                      <option>{t('feed.homeAndGarden')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('feed.availability')}
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      aria-label="Availability filter"
                    >
                      <option>{t('feed.allProducts')}</option>
                      <option>{t('feed.inStock')}</option>
                      <option>{t('feed.outOfStock')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                    {t('feed.applyFilters')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{t('feed.products')}</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{t('feed.likes')}</p>
                  <p className="text-2xl font-bold text-gray-900">856</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{t('feed.comments')}</p>
                  <p className="text-2xl font-bold text-gray-900">432</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{t('feed.shares')}</p>
                  <p className="text-2xl font-bold text-gray-900">128</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <Feed
          userId={userId}
          className="space-y-6"
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('feed.enjoyingFeed')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('feed.personalizeExperience')}
            </p>
            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Heart className="h-4 w-4 mr-1" />
                {t('feed.socialShopping')}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="h-4 w-4 mr-1" />
                {t('feed.aiPowered')}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {t('feed.personalizedFeed')}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedPage;