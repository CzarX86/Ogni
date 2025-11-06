import { log } from './logger';

export class SecurityService {
  private static instance: SecurityService;

  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data (for logging purposes only)
   */
  hashData(data: string): string {
    // Simple hash for logging - NOT for passwords
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Check if password meets security requirements
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rate limiting helper
   */
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = identifier;
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * GDPR compliance: Data anonymization
   */
  anonymizeUserData(userData: any): any {
    const anonymized = { ...userData };

    // Remove or hash personal identifiable information
    if (anonymized.email) {
      anonymized.email = this.hashData(anonymized.email) + '@anonymized.com';
    }

    if (anonymized.phone) {
      anonymized.phone = '***-***-' + anonymized.phone.slice(-4);
    }

    if (anonymized.firstName) {
      anonymized.firstName = anonymized.firstName.charAt(0) + '***';
    }

    if (anonymized.lastName) {
      anonymized.lastName = anonymized.lastName.charAt(0) + '***';
    }

    return anonymized;
  }

  /**
   * GDPR compliance: Right to be forgotten
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      // This would implement actual data deletion across all services
      // For now, just log the request
      log.info('GDPR: User data deletion requested', { userId });

      // In a real implementation, this would:
      // 1. Delete user from authentication
      // 2. Anonymize/delete orders
      // 3. Delete reviews
      // 4. Remove from analytics
      // 5. Clear personal data from all collections

      // Placeholder implementation
      console.log(`Deleting data for user: ${userId}`);
    } catch (error) {
      log.error('Failed to delete user data', { error, userId });
      throw new Error('Failed to process data deletion request');
    }
  }

  /**
   * GDPR compliance: Data export
   */
  async exportUserData(userId: string): Promise<any> {
    try {
      // This would collect all user data across services
      log.info('GDPR: User data export requested', { userId });

      // Placeholder implementation
      const userData = {
        userId,
        exportDate: new Date().toISOString(),
        data: {
          // This would include all user-related data
          profile: {},
          orders: [],
          reviews: [],
          analytics: {}
        }
      };

      return userData;
    } catch (error) {
      log.error('Failed to export user data', { error, userId });
      throw new Error('Failed to process data export request');
    }
  }

  /**
   * Security headers validation
   */
  validateSecurityHeaders(headers: Record<string, string>): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const requiredHeaders = [
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy'
    ];

    for (const header of requiredHeaders) {
      if (!headers[header.toLowerCase()]) {
        issues.push(`Missing security header: ${header}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * CSRF token generation and validation
   */
  generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;

    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeEquals(token, sessionToken);
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Log security events
   */
  logSecurityEvent(event: string, details: any): void {
    log.warn('Security Event', { event, details, timestamp: new Date().toISOString() });
  }
}