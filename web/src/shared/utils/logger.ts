type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      // In a real app, get from auth context
      // userId: getCurrentUserId(),
      // sessionId: getCurrentSessionId(),
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console logging
    const logMethod = level === 'debug' ? 'debug' : level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log';
    console[logMethod](`[${level.toUpperCase()}] ${message}`, context || '');

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  // Analytics events
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    this.info(`Event: ${eventName}`, properties);
    // Send to analytics service
  }

  // Performance tracking
  time(label: string): void {
    console.time(label);
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
  }

  // Get recent logs (for debugging)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  private sendToLoggingService(entry: LogEntry): void {
    // Implement sending to external logging service
    // e.g., LogRocket, Sentry, DataDog, etc.
    try {
      // Example: send to a logging endpoint
      // fetch('/api/logs', {
      //   method: 'POST',
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }
}

export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, context?: Record<string, any>) => logger.error(message, context),
  trackEvent: (eventName: string, properties?: Record<string, any>) => logger.trackEvent(eventName, properties),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
};