import { HttpApiClient } from '../../../shared/services/api';
import { AuthResult, LoginData } from '../../../shared/types';

export class AuthService {
  private static readonly BASE_URL = '/auth';

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResult> {
    try {
      const response = await HttpApiClient.post(`${this.BASE_URL}/login`, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to login');
      }
      return response.data as AuthResult;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async checkAuth(): Promise<boolean> {
    try {
      const response = await HttpApiClient.get(`${this.BASE_URL}/check`);
      return response.success;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  }
}