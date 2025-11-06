import { NotificationService, NotificationPayload, SocialNotificationData } from '../../src/services/notificationService';

// Mock Notification API
const mockNotification = {
  close: jest.fn(),
  onclick: jest.fn(),
};

(global as any).Notification = jest.fn().mockImplementation(() => mockNotification);
(global as any).Notification.permission = 'default';
(global as any).Notification.requestPermission = jest.fn();

// Mock service worker
const mockServiceWorkerRegistration = {
  pushManager: {
    subscribe: jest.fn(),
    getSubscription: jest.fn(),
  },
};

(global as any).navigator = {
  serviceWorker: {
    register: jest.fn().mockResolvedValue(mockServiceWorkerRegistration),
  },
};

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Reset Notification permission
    Object.defineProperty(window.Notification, 'permission', {
      writable: true,
      value: 'default',
    });

    // Mock successful service worker registration
    (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(mockServiceWorkerRegistration);
  });

  describe('initialize', () => {
    it('should register service worker when supported', async () => {
      await NotificationService.initialize();

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    it('should not initialize when notifications not supported', async () => {
      // Mock notifications not supported
      const originalNotification = window.Notification;
      delete (window as any).Notification;

      await NotificationService.initialize();

      expect(navigator.serviceWorker.register).not.toHaveBeenCalled();

      // Restore
      window.Notification = originalNotification;
    });
  });

  describe('requestPermission', () => {
    it('should request permission and subscribe when granted', async () => {
      (window.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');
      mockServiceWorkerRegistration.pushManager.subscribe.mockResolvedValue({
        endpoint: 'https://example.com/push',
        getKey: jest.fn().mockReturnValue(new Uint8Array(16)),
      });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const result = await NotificationService.requestPermission();

      expect(result).toBe('granted');
      expect(mockServiceWorkerRegistration.pushManager.subscribe).toHaveBeenCalled();
    });

    it('should return denied when permission denied', async () => {
      (window.Notification.requestPermission as jest.Mock).mockResolvedValue('denied');

      const result = await NotificationService.requestPermission();

      expect(result).toBe('denied');
      expect(mockServiceWorkerRegistration.pushManager.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('showNotification', () => {
    beforeEach(() => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'granted',
      });
    });

    it('should show notification with correct payload', () => {
      const payload: NotificationPayload = {
        title: 'Test Notification',
        body: 'This is a test',
        icon: '/test-icon.png',
        data: { test: 'data' },
        tag: 'test-tag',
      };

      NotificationService.showNotification(payload);

      expect(window.Notification).toHaveBeenCalledWith('Test Notification', {
        body: 'This is a test',
        icon: '/test-icon.png',
        badge: '/icon-192x192.png',
        data: { test: 'data' },
        tag: 'test-tag',
        requireInteraction: undefined,
        silent: undefined,
      });
    });

    it('should not show notification when permission not granted', () => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'denied',
      });

      const payload: NotificationPayload = {
        title: 'Test',
        body: 'Test body',
      };

      NotificationService.showNotification(payload);

      expect(window.Notification).not.toHaveBeenCalled();
    });

    it('should handle notification click', () => {
      const payload: NotificationPayload = {
        title: 'Test',
        body: 'Test body',
        data: { url: '/test-url' },
      };

      NotificationService.showNotification(payload);

      // Simulate click
      const notificationInstance = (window.Notification as jest.MockedClass<any>).mock.results[0].value;
      notificationInstance.onclick();

      expect(window.location.href).toBe('/test-url');
    });
  });

  describe('showSocialNotification', () => {
    beforeEach(() => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'granted',
      });
    });

    it('should show like notification', () => {
      const data: SocialNotificationData = {
        type: 'like',
        productId: 'prod1',
        productName: 'Test Product',
        userId: 'user1',
        userName: 'John Doe',
        timestamp: new Date(),
      };

      NotificationService.showSocialNotification(data);

      expect(window.Notification).toHaveBeenCalledWith('Novo like!', {
        body: 'John Doe curtiu "Test Product"',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: '/product/prod1',
          type: 'like',
          productId: 'prod1',
          userId: 'user1',
        },
        tag: 'social-like-prod1-user1',
        requireInteraction: undefined,
        silent: undefined,
      });
    });

    it('should show comment notification with content', () => {
      const data: SocialNotificationData = {
        type: 'comment',
        productId: 'prod1',
        productName: 'Test Product',
        userId: 'user1',
        userName: 'John Doe',
        commentContent: 'This is a great product!',
        timestamp: new Date(),
      };

      NotificationService.showSocialNotification(data);

      expect(window.Notification).toHaveBeenCalledWith('Novo comentário!', {
        body: 'John Doe comentou em "Test Product": "This is a great product!"',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: '/product/prod1#comments',
          type: 'comment',
          productId: 'prod1',
          userId: 'user1',
        },
        tag: 'social-comment-prod1-user1',
        requireInteraction: undefined,
        silent: undefined,
      });
    });

    it('should not show notification when preference is disabled', () => {
      // Disable likes notifications
      NotificationService.saveNotificationPreferences({ likes: false });

      const data: SocialNotificationData = {
        type: 'like',
        productId: 'prod1',
        productName: 'Test Product',
        userId: 'user1',
        userName: 'John Doe',
        timestamp: new Date(),
      };

      NotificationService.showSocialNotification(data);

      expect(window.Notification).not.toHaveBeenCalled();
    });
  });

  describe('showProductUpdateNotification', () => {
    beforeEach(() => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'granted',
      });
    });

    it('should show price drop notification', () => {
      NotificationService.showProductUpdateNotification('prod1', 'Test Product', 'price_drop');

      expect(window.Notification).toHaveBeenCalledWith('Preço reduzido!', {
        body: 'O preço de "Test Product" foi reduzido',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: '/product/prod1',
          type: 'product_update',
          productId: 'prod1',
        },
        tag: 'product-price_drop-prod1',
        requireInteraction: undefined,
        silent: undefined,
      });
    });

    it('should not show when product updates disabled', () => {
      NotificationService.saveNotificationPreferences({ productUpdates: false });

      NotificationService.showProductUpdateNotification('prod1', 'Test Product', 'price_drop');

      expect(window.Notification).not.toHaveBeenCalled();
    });
  });

  describe('Notification Preferences', () => {
    it('should return default preferences', () => {
      const preferences = NotificationService.getNotificationPreferences();

      expect(preferences).toEqual({
        likes: true,
        comments: true,
        shares: false,
        follows: true,
        productUpdates: true,
        marketing: false,
      });
    });

    it('should save and load preferences', () => {
      const newPreferences = {
        likes: false,
        comments: false,
        marketing: true,
      };

      NotificationService.saveNotificationPreferences(newPreferences);

      const loaded = NotificationService.getNotificationPreferences();
      expect(loaded.likes).toBe(false);
      expect(loaded.comments).toBe(false);
      expect(loaded.marketing).toBe(true);
      expect(loaded.shares).toBe(false); // Should keep default
    });
  });

  describe('Utility methods', () => {
    it('should check if notifications are supported', () => {
      expect(NotificationService.isSupported()).toBe(true);
    });

    it('should return permission status', () => {
      expect(NotificationService.getPermissionStatus()).toBe('default');
    });

    it('should show test notification', () => {
      Object.defineProperty(window.Notification, 'permission', {
        writable: true,
        value: 'granted',
      });

      NotificationService.showTestNotification();

      expect(window.Notification).toHaveBeenCalledWith('Teste de Notificação', expect.objectContaining({
        body: 'Esta é uma notificação de teste do Ogni',
      }));
    });
  });
});