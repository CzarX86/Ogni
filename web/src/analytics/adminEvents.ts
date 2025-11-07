import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { getApp } from 'firebase/app';
import { log } from 'shared/utils/logger';

// Initialize analytics
let analytics: Analytics | null = null;

try {
  const app = getApp();
  analytics = getAnalytics(app);
} catch (error) {
  log.warn('Firebase Analytics not available:', { error });
}

export interface AdminEventData {
  // Product management events
  product_created: {
    product_id: string;
    product_name: string;
    category: string;
    price: number;
  };
  product_updated: {
    product_id: string;
    product_name: string;
    changes: string[]; // List of changed fields
  };
  product_deleted: {
    product_id: string;
    product_name: string;
  };
  product_bulk_operation: {
    operation_type: 'create' | 'update' | 'delete';
    product_count: number;
    success_count: number;
    failure_count: number;
  };

  // Inventory events
  inventory_updated: {
    product_id: string;
    previous_quantity: number;
    new_quantity: number;
    change_reason: string;
  };
  inventory_alert: {
    product_id: string;
    alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
    current_stock: number;
    threshold?: number;
  };

  // Admin session events
  admin_login: {
    admin_id: string;
    login_method: string;
  };
  admin_logout: {
    admin_id: string;
    session_duration: number; // in minutes
  };
  admin_page_view: {
    page: string;
    admin_id: string;
  };

  // Order management events
  order_status_changed: {
    order_id: string;
    previous_status: string;
    new_status: string;
    changed_by: string;
  };

  // User management events
  user_promoted: {
    user_id: string;
    promoted_by: string;
    new_role: string;
  };
  user_demoted: {
    user_id: string;
    demoted_by: string;
    previous_role: string;
  };
}

export class AdminAnalytics {
  private static logEvent(eventName: string, parameters: Record<string, unknown>): void {
    if (!analytics) {
      log.info(`[AdminAnalytics] ${eventName}:`, parameters);
      return;
    }

    try {
      logEvent(analytics, eventName, parameters);
    } catch (error) {
      log.error('Error logging admin analytics event:', { error });
    }
  }

  // Product Management Events
  static productCreated(data: AdminEventData['product_created']): void {
    this.logEvent('admin_product_created', data);
  }

  static productUpdated(data: AdminEventData['product_updated']): void {
    this.logEvent('admin_product_updated', data);
  }

  static productDeleted(data: AdminEventData['product_deleted']): void {
    this.logEvent('admin_product_deleted', data);
  }

  static productBulkOperation(data: AdminEventData['product_bulk_operation']): void {
    this.logEvent('admin_product_bulk_operation', data);
  }

  // Inventory Events
  static inventoryUpdated(data: AdminEventData['inventory_updated']): void {
    this.logEvent('admin_inventory_updated', data);
  }

  static inventoryAlert(data: AdminEventData['inventory_alert']): void {
    this.logEvent('admin_inventory_alert', data);
  }

  // Admin Session Events
  static adminLogin(data: AdminEventData['admin_login']): void {
    this.logEvent('admin_login', data);
  }

  static adminLogout(data: AdminEventData['admin_logout']): void {
    this.logEvent('admin_logout', data);
  }

  static adminPageView(data: AdminEventData['admin_page_view']): void {
    this.logEvent('admin_page_view', data);
  }

  // Order Management Events
  static orderStatusChanged(data: AdminEventData['order_status_changed']): void {
    this.logEvent('admin_order_status_changed', data);
  }

  // User Management Events
  static userPromoted(data: AdminEventData['user_promoted']): void {
    this.logEvent('admin_user_promoted', data);
  }

  static userDemoted(data: AdminEventData['user_demoted']): void {
    this.logEvent('admin_user_demoted', data);
  }

  // Utility methods
  static trackAdminAction(action: string, details: Record<string, unknown>): void {
    if (!analytics) {
      log.info(`[AdminAnalytics] admin_action: ${action}`, details);
      return;
    }

    try {
      logEvent(analytics, 'admin_action', {
        action,
        ...details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      log.error('Error logging admin action:', { error });
    }
  }

  static trackPerformanceMetric(metric: string, value: number, unit: string): void {
    if (!analytics) {
      log.info(`[AdminAnalytics] performance_metric: ${metric} = ${value} ${unit}`);
      return;
    }

    try {
      logEvent(analytics, 'admin_performance', {
        metric,
        value,
        unit,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      log.error('Error logging performance metric:', { error });
    }
  }

  static trackError(errorType: string, errorMessage: string, context?: Record<string, unknown>): void {
    if (!analytics) {
      log.info(`[AdminAnalytics] error: ${errorType} - ${errorMessage}`, context);
      return;
    }

    try {
      logEvent(analytics, 'admin_error', {
        error_type: errorType,
        error_message: errorMessage,
        ...context,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      log.error('Error logging admin error:', { error });
    }
  }
}

// Helper functions for common admin actions
export const trackProductCreation = (productId: string, productName: string, category: string, price: number) => {
  AdminAnalytics.productCreated({
    product_id: productId,
    product_name: productName,
    category,
    price,
  });
};

export const trackProductUpdate = (productId: string, productName: string, changes: string[]) => {
  AdminAnalytics.productUpdated({
    product_id: productId,
    product_name: productName,
    changes,
  });
};

export const trackProductDeletion = (productId: string, productName: string) => {
  AdminAnalytics.productDeleted({
    product_id: productId,
    product_name: productName,
  });
};

export const trackInventoryChange = (
  productId: string,
  previousQuantity: number,
  newQuantity: number,
  reason: string
) => {
  AdminAnalytics.inventoryUpdated({
    product_id: productId,
    previous_quantity: previousQuantity,
    new_quantity: newQuantity,
    change_reason: reason,
  });
};

export const trackAdminLogin = (adminId: string) => {
  AdminAnalytics.adminLogin({
    admin_id: adminId,
    login_method: 'email',
  });
};

export const trackAdminPageView = (page: string, adminId: string) => {
  AdminAnalytics.adminPageView({
    page,
    admin_id: adminId,
  });
};