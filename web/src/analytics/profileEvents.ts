import { AnalyticsService } from 'shared/services/analytics';
import { log } from 'shared/utils/logger';

export interface ProfileViewEvent {
  userId: string;
  sessionId: string;
  page: 'profile' | 'order_history' | 'account_settings';
  viewDuration: number;
  timestamp: Date;
}

export interface ProfileUpdateEvent {
  userId: string;
  sessionId: string;
  fieldsUpdated: string[];
  updateSource: 'profile_form' | 'password_change' | 'settings';
  timestamp: Date;
  metadata?: {
    hasPhone?: boolean;
    hasAddress?: boolean;
    passwordStrength?: 'weak' | 'medium' | 'strong';
  };
}

export interface ProfileInteractionEvent {
  userId: string;
  sessionId: string;
  interactionType: 'view_orders' | 'edit_profile' | 'change_password' | 'logout' | 'delete_account';
  page: string;
  timestamp: Date;
  metadata?: {
    orderCount?: number;
    timeToAction?: number;
  };
}

export interface ProfileEngagementEvent {
  userId: string;
  sessionId: string;
  engagementType: 'login' | 'logout' | 'session_start' | 'session_end';
  sessionDuration?: number;
  timestamp: Date;
}

/**
 * Profile Analytics Service
 * Tracks user interactions and engagement with profile/account management features
 */
export class ProfileAnalyticsService {
  private static readonly PROFILE_VIEW_EVENT = 'profile_view';
  private static readonly PROFILE_UPDATE_EVENT = 'profile_update';
  private static readonly PROFILE_INTERACTION_EVENT = 'profile_interaction';
  private static readonly PROFILE_ENGAGEMENT_EVENT = 'profile_engagement';

  /**
   * Track profile page views
   */
  static trackProfileView(event: ProfileViewEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.PROFILE_VIEW_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        page: event.page,
        viewDuration: event.viewDuration,
        timestamp: event.timestamp.toISOString()
      });

      // Also track as page view for GA4
      AnalyticsService.trackPageView(`/account/${event.page}`);
    } catch (error) {
      log.error('Error tracking profile view:', { error });
    }
  }

  /**
   * Track profile updates
   */
  static trackProfileUpdate(event: ProfileUpdateEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.PROFILE_UPDATE_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        fieldsUpdated: event.fieldsUpdated,
        updateSource: event.updateSource,
        timestamp: event.timestamp.toISOString(),
        ...event.metadata
      });

      // Track conversion for profile completion
      if (event.fieldsUpdated.includes('phone') || event.fieldsUpdated.includes('address')) {
        AnalyticsService.trackCustomEvent('profile_completion', {
          fieldsCompleted: event.fieldsUpdated.length,
          completionRate: this.calculateProfileCompletion(event.metadata)
        });
      }
    } catch (error) {
      log.error('Error tracking profile update:', { error });
    }
  }

  /**
   * Track profile interactions
   */
  static trackProfileInteraction(event: ProfileInteractionEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.PROFILE_INTERACTION_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        interactionType: event.interactionType,
        page: event.page,
        timestamp: event.timestamp.toISOString(),
        ...event.metadata
      });

      // Track specific interactions as conversions
      if (event.interactionType === 'view_orders') {
        AnalyticsService.trackCustomEvent('order_history_view', {
          orderCount: event.metadata?.orderCount || 0
        });
      }
    } catch (error) {
      log.error('Error tracking profile interaction:', { error });
    }
  }

  /**
   * Track profile engagement events
   */
  static trackProfileEngagement(event: ProfileEngagementEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.PROFILE_ENGAGEMENT_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        engagementType: event.engagementType,
        sessionDuration: event.sessionDuration,
        timestamp: event.timestamp.toISOString()
      });
    } catch (error) {
      log.error('Error tracking profile engagement:', { error });
    }
  }

  /**
   * Helper method to track profile page view
   */
  static trackProfilePageView(
    userId: string,
    sessionId: string,
    page: 'profile' | 'order_history' | 'account_settings',
    viewDuration: number = 0
  ): void {
    this.trackProfileView({
      userId,
      sessionId,
      page,
      viewDuration,
      timestamp: new Date()
    });
  }

  /**
   * Helper method to track profile form updates
   */
  static trackProfileFormUpdate(
    userId: string,
    sessionId: string,
    fieldsUpdated: string[],
    hasPhone: boolean = false,
    hasAddress: boolean = false
  ): void {
    this.trackProfileUpdate({
      userId,
      sessionId,
      fieldsUpdated,
      updateSource: 'profile_form',
      timestamp: new Date(),
      metadata: {
        hasPhone,
        hasAddress
      }
    });
  }

  /**
   * Helper method to track password changes
   */
  static trackPasswordChange(
    userId: string,
    sessionId: string,
    passwordStrength: 'weak' | 'medium' | 'strong' = 'medium'
  ): void {
    this.trackProfileUpdate({
      userId,
      sessionId,
      fieldsUpdated: ['password'],
      updateSource: 'password_change',
      timestamp: new Date(),
      metadata: {
        passwordStrength
      }
    });
  }

  /**
   * Helper method to track order history views
   */
  static trackOrderHistoryView(
    userId: string,
    sessionId: string,
    orderCount: number
  ): void {
    this.trackProfileInteraction({
      userId,
      sessionId,
      interactionType: 'view_orders',
      page: 'order_history',
      timestamp: new Date(),
      metadata: {
        orderCount
      }
    });
  }

  /**
   * Helper method to track account logout
   */
  static trackLogout(
    userId: string,
    sessionId: string,
    sessionDuration: number
  ): void {
    this.trackProfileEngagement({
      userId,
      sessionId,
      engagementType: 'logout',
      sessionDuration,
      timestamp: new Date()
    });
  }

  /**
   * Helper method to track account login
   */
  static trackLogin(
    userId: string,
    sessionId: string
  ): void {
    this.trackProfileEngagement({
      userId,
      sessionId,
      engagementType: 'login',
      timestamp: new Date()
    });
  }

  /**
   * Calculate profile completion percentage
   */
  private static calculateProfileCompletion(metadata?: { hasPhone?: boolean; hasAddress?: boolean }): number {
    if (!metadata) return 0;

    let completed = 0;
    const total = 2; // phone and address

    if (metadata.hasPhone) completed++;
    if (metadata.hasAddress) completed++;

    return Math.round((completed / total) * 100);
  }

  /**
   * Track profile engagement time
   */
  static trackProfileEngagementTime(
    userId: string,
    sessionId: string,
    page: string,
    timeSpent: number
  ): void {
    try {
      AnalyticsService.trackCustomEvent('profile_engagement_time', {
        userId,
        sessionId,
        page,
        timeSpent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      log.error('Error tracking profile engagement time:', { error });
    }
  }

  /**
   * Track profile feature usage
   */
  static trackFeatureUsage(
    userId: string,
    sessionId: string,
    feature: 'profile_edit' | 'password_change' | 'order_history' | 'account_settings',
    action: 'start' | 'complete' | 'cancel',
    timeToComplete?: number
  ): void {
    try {
      AnalyticsService.trackCustomEvent('profile_feature_usage', {
        userId,
        sessionId,
        feature,
        action,
        timeToComplete,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      log.error('Error tracking feature usage:', { error });
    }
  }
}