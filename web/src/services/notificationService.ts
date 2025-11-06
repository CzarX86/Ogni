import { log } from '@/shared/utils/logger';

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  shares: boolean;
  follows: boolean;
  productUpdates: boolean;
  marketing: boolean;
}

export interface SocialNotificationData {
  type: 'like' | 'comment' | 'share' | 'follow';
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  commentContent?: string;
  timestamp: Date;
}

/**
 * Notification Service
 * Handles browser push notifications for social interactions and updates
 */
export class NotificationService {
  private static readonly VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';
  private static readonly NOTIFICATION_STORAGE_KEY = 'notification_preferences';
  private static serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private static pushSubscription: PushSubscription | null = null;

  /**
   * Initialize notification service
   */
  static async initialize(): Promise<void> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        log.warn('This browser does not support notifications');
        return;
      }

      // Register service worker for push notifications
      await this.registerServiceWorker();

      // Check current permission status
      const permission = Notification.permission;
      log.info('Notification permission status', { permission });

      if (permission === 'default') {
        // Permission not requested yet
        return;
      }

      if (permission === 'granted') {
        await this.subscribeToPush();
      }
    } catch (error) {
      log.error('Failed to initialize notifications', { error });
    }
  }

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        await this.subscribeToPush();
      }

      log.info('Notification permission requested', { permission });
      return permission;
    } catch (error) {
      log.error('Failed to request notification permission', { error });
      return 'denied';
    }
  }

  /**
   * Register service worker for push notifications
   */
  private static async registerServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        log.info('Service worker registered for notifications');
      } else {
        throw new Error('Service workers not supported');
      }
    } catch (error) {
      log.error('Failed to register service worker', { error });
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   */
  private static async subscribeToPush(): Promise<void> {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service worker not registered');
      }

      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
      });

      log.info('Subscribed to push notifications', {
        endpoint: this.pushSubscription.endpoint
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.pushSubscription);
    } catch (error) {
      log.error('Failed to subscribe to push notifications', { error });
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribeFromPush(): Promise<void> {
    try {
      if (this.pushSubscription) {
        await this.pushSubscription.unsubscribe();
        this.pushSubscription = null;
        log.info('Unsubscribed from push notifications');
      }
    } catch (error) {
      log.error('Failed to unsubscribe from push notifications', { error });
      throw error;
    }
  }

  /**
   * Send push subscription to server
   */
  private static async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
          auth: btoa(String.fromCharCode(...Array.from(new Uint8Array(subscription.getKey('auth')!))))
        }
      };

      // Send to server API
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      log.info('Subscription sent to server successfully');
    } catch (error) {
      log.error('Failed to send subscription to server', { error });
      throw error;
    }
  }

  /**
   * Show browser notification
   */
  static showNotification(payload: NotificationPayload): void {
    try {
      if (Notification.permission !== 'granted') {
        log.warn('Notification permission not granted');
        return;
      }

      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/icon-192x192.png',
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
      });

      // Auto-close after 5 seconds unless interaction is required
      if (!payload.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle notification click
      notification.onclick = () => {
        if (payload.data?.url) {
          window.focus();
          window.location.href = payload.data.url;
        }
        notification.close();
      };

      log.info('Notification shown', { title: payload.title });
    } catch (error) {
      log.error('Failed to show notification', { error });
    }
  }

  /**
   * Show social interaction notification
   */
  static showSocialNotification(data: SocialNotificationData): void {
    const preferences = this.getNotificationPreferences();

    // Check if user wants this type of notification
    const preferenceKey = data.type === 'like' ? 'likes' : data.type;
    if (!preferences[preferenceKey as keyof NotificationPreferences]) {
      return;
    }

    let title: string;
    let body: string;
    let url: string;

    switch (data.type) {
      case 'like':
        title = 'Novo like!';
        body = `${data.userName} curtiu "${data.productName}"`;
        url = `/product/${data.productId}`;
        break;
      case 'comment':
        title = 'Novo comentário!';
        body = `${data.userName} comentou em "${data.productName}"${data.commentContent ? `: "${data.commentContent.substring(0, 50)}${data.commentContent.length > 50 ? '...' : ''}"` : ''}`;
        url = `/product/${data.productId}#comments`;
        break;
      case 'share':
        title = 'Produto compartilhado!';
        body = `${data.userName} compartilhou "${data.productName}"`;
        url = `/product/${data.productId}`;
        break;
      case 'follow':
        title = 'Novo seguidor!';
        body = `${data.userName} começou a te seguir`;
        url = `/profile/${data.userId}`;
        break;
      default:
        return;
    }

    this.showNotification({
      title,
      body,
      icon: '/icon-192x192.png',
      data: { url, type: data.type, productId: data.productId, userId: data.userId },
      tag: `social-${data.type}-${data.productId}-${data.userId}`,
    });
  }

  /**
   * Show product update notification
   */
  static showProductUpdateNotification(productId: string, productName: string, updateType: 'price_drop' | 'back_in_stock' | 'new_review'): void {
    const preferences = this.getNotificationPreferences();

    if (!preferences.productUpdates) {
      return;
    }

    let title: string;
    let body: string;

    switch (updateType) {
      case 'price_drop':
        title = 'Preço reduzido!';
        body = `O preço de "${productName}" foi reduzido`;
        break;
      case 'back_in_stock':
        title = 'Produto disponível!';
        body = `"${productName}" voltou ao estoque`;
        break;
      case 'new_review':
        title = 'Nova avaliação!';
        body = `"${productName}" recebeu uma nova avaliação`;
        break;
      default:
        return;
    }

    this.showNotification({
      title,
      body,
      icon: '/icon-192x192.png',
      data: { url: `/product/${productId}`, type: 'product_update', productId },
      tag: `product-${updateType}-${productId}`,
    });
  }

  /**
   * Get notification preferences from localStorage
   */
  static getNotificationPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(this.NOTIFICATION_STORAGE_KEY);
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
      }
    } catch (error) {
      log.error('Failed to load notification preferences', { error });
    }
    return this.getDefaultPreferences();
  }

  /**
   * Save notification preferences to localStorage
   */
  static saveNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
    try {
      const current = this.getNotificationPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
      log.info('Notification preferences saved', { preferences: updated });
    } catch (error) {
      log.error('Failed to save notification preferences', { error });
    }
  }

  /**
   * Get default notification preferences
   */
  private static getDefaultPreferences(): NotificationPreferences {
    return {
      likes: true,
      comments: true,
      shares: false,
      follows: true,
      productUpdates: true,
      marketing: false,
    };
  }

  /**
   * Check if notifications are supported and enabled
   */
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Check if user is subscribed to push notifications
   */
  static async isSubscribed(): Promise<boolean> {
    try {
      if (!this.serviceWorkerRegistration) {
        return false;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      log.error('Failed to check subscription status', { error });
      return false;
    }
  }

  /**
   * Utility function to convert VAPID key
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Test notification (for debugging)
   */
  static showTestNotification(): void {
    this.showNotification({
      title: 'Teste de Notificação',
      body: 'Esta é uma notificação de teste do Ogni',
      icon: '/icon-192x192.png',
      data: { url: '/', type: 'test' },
      tag: 'test-notification',
    });
  }
}