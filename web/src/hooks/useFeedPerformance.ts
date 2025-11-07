import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedAnalyticsService } from '../analytics/feedEvents';

interface PerformanceMetrics {
  renderTime: number;
  scrollPerformance: number;
  loadTime: number;
  memoryUsage?: number;
}

interface UseFeedPerformanceOptions {
  enabled?: boolean;
  trackScroll?: boolean;
  trackRenders?: boolean;
}

export const useFeedPerformance = (options: UseFeedPerformanceOptions = {}) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    trackScroll = true,
    trackRenders = true,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    scrollPerformance: 0,
    loadTime: 0,
  });

  const renderStartTime = useRef<number>(0);
  const scrollStartTime = useRef<number>(0);
  const loadStartTime = useRef<number>(0);

  // Track render performance
  const startRenderTracking = useCallback(() => {
    if (enabled && trackRenders) {
      renderStartTime.current = performance.now();
    }
  }, [enabled, trackRenders]);

  const endRenderTracking = useCallback(() => {
    if (enabled && trackRenders && renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));

      // Track with analytics
      FeedAnalyticsService.trackFeedPerformance({
        userId: undefined, // Will be set by analytics service
        sessionId: 'performance-session',
        metric: 'render_time',
        value: renderTime,
        timestamp: new Date(),
      });

      renderStartTime.current = 0;
    }
  }, [enabled, trackRenders]);

  // Track scroll performance
  const startScrollTracking = useCallback(() => {
    if (enabled && trackScroll) {
      scrollStartTime.current = performance.now();
    }
  }, [enabled, trackScroll]);

  const endScrollTracking = useCallback((scrollDepth: number) => {
    if (enabled && trackScroll && scrollStartTime.current > 0) {
      const scrollTime = performance.now() - scrollStartTime.current;
      setMetrics(prev => ({ ...prev, scrollPerformance: scrollTime }));

      // Track scroll depth with analytics
      FeedAnalyticsService.trackScrollDepth(
        undefined, // userId
        'performance-session',
        scrollDepth,
        scrollTime
      );

      scrollStartTime.current = 0;
    }
  }, [enabled, trackScroll]);

  // Track load performance
  const startLoadTracking = useCallback(() => {
    if (enabled) {
      loadStartTime.current = performance.now();
    }
  }, [enabled]);

  const endLoadTracking = useCallback(() => {
    if (enabled && loadStartTime.current > 0) {
      const loadTime = performance.now() - loadStartTime.current;
      setMetrics(prev => ({ ...prev, loadTime }));

      // Track with analytics
      FeedAnalyticsService.trackFeedPerformance({
        userId: undefined,
        sessionId: 'performance-session',
        metric: 'load_time',
        value: loadTime,
        timestamp: new Date(),
      });

      loadStartTime.current = 0;
    }
  }, [enabled]);

  // Track memory usage (if available)
  const trackMemoryUsage = useCallback(() => {
    if (enabled && 'memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;

      setMetrics(prev => ({ ...prev, memoryUsage }));

      FeedAnalyticsService.trackFeedPerformance({
        userId: undefined,
        sessionId: 'performance-session',
        metric: 'scroll_performance', // Using scroll_performance as generic metric
        value: memoryUsage * 100, // Convert to percentage
        timestamp: new Date(),
      });
    }
  }, [enabled]);

  // Performance observer for long tasks
  useEffect(() => {
    if (!enabled || !window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task > 50ms
          FeedAnalyticsService.trackFeedPerformance({
            userId: undefined,
            sessionId: 'performance-session',
            metric: 'scroll_performance',
            value: entry.duration,
            timestamp: new Date(),
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  }, [enabled]);

  return {
    metrics,
    startRenderTracking,
    endRenderTracking,
    startScrollTracking,
    endScrollTracking,
    startLoadTracking,
    endLoadTracking,
    trackMemoryUsage,
  };
};