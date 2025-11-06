import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VirtualizedFeed } from '../../src/components/feed/VirtualizedFeed';
import { FeedItem as FeedItemType } from '../../../shared/types';

// Mock CSS imports
jest.mock('../../src/components/feed/VirtualizedFeed.css', () => ({}));

// Mock FeedItem component
jest.mock('../../src/components/feed/FeedItem', () => ({
  FeedItem: ({ item }: { item: FeedItemType }) => (
    <div data-testid={`feed-item-${item.product.id}`}>
      {item.product.name}
    </div>
  ),
}));

// Mock UI components
jest.mock('../../src/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('../../src/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div className={className}>Skeleton</div>,
}));

jest.mock('../../src/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

// Mock icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div>AlertCircle</div>,
  RefreshCw: () => <div>RefreshCw</div>,
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('VirtualizedFeed', () => {
  const mockItems: FeedItemType[] = [
    {
      product: {
        id: '1',
        name: 'Product 1',
        price: 100,
        categoryId: 'cat1',
      } as any,
      socialStats: {
        likes: 10,
        comments: 5,
        shares: 2,
        isLiked: false,
        isSaved: false,
      },
      algorithmScore: 0.8,
    },
    {
      product: {
        id: '2',
        name: 'Product 2',
        price: 200,
        categoryId: 'cat2',
      } as any,
      socialStats: {
        likes: 20,
        comments: 8,
        shares: 3,
        isLiked: true,
        isSaved: false,
      },
      algorithmScore: 0.6,
    },
  ];

  const defaultProps = {
    items: mockItems,
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    onLoadMore: jest.fn(),
    onRefresh: jest.fn(),
    itemHeight: 100,
    containerHeight: 300,
    overscan: 2,
    className: 'test-class',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders visible items within viewport', () => {
    const { container } = render(<VirtualizedFeed {...defaultProps} />);

    // Should render items within the visible range
    // With containerHeight=300 and itemHeight=100, should show ~3 items
    const renderedItems = container.querySelectorAll('[data-testid^="feed-item-"]');
    expect(renderedItems.length).toBeGreaterThan(0);
    expect(renderedItems.length).toBeLessThanOrEqual(mockItems.length);
  });

  it('shows loading skeleton when loading and no items', () => {
    const { container } = render(
      <VirtualizedFeed {...defaultProps} items={[]} loading={true} />
    );

    expect(container.textContent).toContain('Skeleton');
  });

  it('shows error state when error and no items', () => {
    const { container } = render(
      <VirtualizedFeed {...defaultProps} items={[]} error="Test error" />
    );

    expect(container.textContent).toContain('Failed to load feed');
    expect(container.textContent).toContain('Test error');
  });

  it('shows empty state when no items and not loading', () => {
    const { container } = render(
      <VirtualizedFeed {...defaultProps} items={[]} />
    );

    expect(container.textContent).toContain('No products found');
  });

  it('shows loading more indicator when loadingMore is true', () => {
    const { container } = render(
      <VirtualizedFeed {...defaultProps} loadingMore={true} />
    );

    expect(container.textContent).toContain('Loading more products');
  });

  it('shows end of feed message when no more items', () => {
    const { container } = render(
      <VirtualizedFeed {...defaultProps} hasMore={false} />
    );

    expect(container.textContent).toContain('You\'ve seen all products');
  });

  it('calls onLoadMore when scrolling near bottom', () => {
    const mockOnLoadMore = jest.fn();
    const { container } = render(
      <VirtualizedFeed {...defaultProps} onLoadMore={mockOnLoadMore} />
    );

    const scrollContainer = container.querySelector('.virtualized-feed-container');
    expect(scrollContainer).toBeInTheDocument();

    // Simulate scroll near bottom
    fireEvent.scroll(scrollContainer!, {
      target: {
        scrollTop: 1000,
        scrollHeight: 1200,
        clientHeight: 200,
      },
    });

    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  it('calls onRefresh when refresh button is clicked in error state', () => {
    const mockOnRefresh = jest.fn();
    const { getByText } = render(
      <VirtualizedFeed {...defaultProps} items={[]} error="Test error" onRefresh={mockOnRefresh} />
    );

    const retryButton = getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('shows performance info in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    const { container } = render(<VirtualizedFeed {...defaultProps} />);

    expect(container.textContent).toContain('Virtualized Feed');
    expect(container.textContent).toContain('items rendered');

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('does not show performance info in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
    });

    const { container } = render(<VirtualizedFeed {...defaultProps} />);

    expect(container.textContent).not.toContain('Virtualized Feed');

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
    });
  });

  it('handles different container heights', () => {
    const { container, rerender } = render(
      <VirtualizedFeed {...defaultProps} containerHeight={200} />
    );

    // Should render fewer items with smaller container
    let renderedItems = container.querySelectorAll('[data-testid^="feed-item-"]');
    const smallContainerCount = renderedItems.length;

    rerender(<VirtualizedFeed {...defaultProps} containerHeight={400} />);

    // Should render more items with larger container
    renderedItems = container.querySelectorAll('[data-testid^="feed-item-"]');
    expect(renderedItems.length).toBeGreaterThanOrEqual(smallContainerCount);
  });

  it('respects overscan parameter', () => {
    const { container, rerender } = render(
      <VirtualizedFeed {...defaultProps} overscan={1} />
    );

    const renderedItems1 = container.querySelectorAll('[data-testid^="feed-item-"]');
    const count1 = renderedItems1.length;

    rerender(<VirtualizedFeed {...defaultProps} overscan={3} />);

    const renderedItems2 = container.querySelectorAll('[data-testid^="feed-item-"]');
    const count2 = renderedItems2.length;

    // Higher overscan should potentially render more items
    expect(count2).toBeGreaterThanOrEqual(count1);
  });
});