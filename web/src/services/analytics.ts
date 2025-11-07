// Basic analytics service for tracking events
import { log } from 'shared/utils/logger';

interface AnalyticsEvent {
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = [];

  static trackEvent(eventName: string, data: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.events.push(event);
    log.info('Analytics event:', { event });

    // In production, send to analytics service
    // this.sendToAnalytics(event);
  }

  static trackConversion(conversionType: string, data: Record<string, unknown>): void {
    const conversion: AnalyticsEvent = {
      event: conversionType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    log.info('Analytics conversion:', { conversion });
    // In production, send to conversion tracking
    // this.sendConversion(conversion);
  }

  static getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  // Placeholder for future analytics integration
  private static sendToAnalytics(_event: AnalyticsEvent): void {
    // Implement actual analytics sending (Google Analytics, Mixpanel, etc.)
  }

  private static sendConversion(_conversion: AnalyticsEvent): void {
    // Implement conversion tracking
  }
}