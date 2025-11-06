import { User } from '../../../shared/types';

// Mock the HttpApiClient
jest.mock('../../../shared/services/api', () => ({
  HttpApiClient: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  },
}));

import { HttpApiClient } from '../../../shared/services/api';
import { UserService } from '../../src/services/userService';

const mockHttpApiClient = HttpApiClient as jest.Mocked<typeof HttpApiClient>;

describe('User Account API Contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/profile', () => {
    it('should return user profile information', async () => {
      const mockProfileResponse = {
        success: true,
        data: {
          id: 'user-123',
          email: 'user@example.com',
          displayName: 'John Doe',
          role: 'customer',
          profile: {
            phone: '+5511999999999',
            address: {
              street: 'Rua das Flores',
              city: 'São Paulo',
              zip: '01234-567'
            }
          },
          appInstalled: false,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01')
        }
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockProfileResponse);

      const profile = await UserService.getUserProfile('user-123');

      expect(profile).toEqual(mockProfileResponse.data);
      expect(mockHttpApiClient.get).toHaveBeenCalledWith('/users/profile');
    });

    it('should handle profile not found', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'User not found',
        data: null
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockErrorResponse);

      await expect(UserService.getUserProfile('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('PUT /users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        phone: '+5511988888888',
        address: {
          street: 'Rua Nova',
          city: 'São Paulo',
          zip: '01234-567'
        }
      };

      const mockUpdateResponse = {
        success: true,
        data: {
          id: 'user-123',
          email: 'user@example.com',
          displayName: 'John Doe',
          role: 'customer',
          profile: {
            phone: '+5511988888888',
            address: {
              street: 'Rua Nova',
              city: 'São Paulo',
              zip: '01234-567'
            }
          },
          appInstalled: false,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-02')
        }
      };

      mockHttpApiClient.put.mockResolvedValueOnce(mockUpdateResponse);

      const updatedProfile = await UserService.updateUserProfile(updateData);

      expect(updatedProfile).toEqual(mockUpdateResponse.data);
      expect(mockHttpApiClient.put).toHaveBeenCalledWith('/users/profile', updateData);
    });

    it('should validate profile update data', async () => {
      const invalidData = {
        phone: 'invalid-phone' // Should be valid phone format
      };

      mockHttpApiClient.put.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(UserService.updateUserProfile(invalidData)).rejects.toThrow('Validation failed');
    });
  });

  describe('GET /users/orders', () => {
    it('should return user order history', async () => {
      const mockOrdersResponse = {
        success: true,
        data: [
          {
            id: 'order-1',
            userId: 'user-123',
            items: [
              {
                productId: 'product-1',
                quantity: 2,
                price: 99.99
              }
            ],
            total: 199.98,
            status: 'delivered',
            shipping: {
              address: 'Rua das Flores, São Paulo',
              method: 'standard',
              cost: 15.00
            },
            payment: {
              method: 'pix',
              status: 'paid',
              transactionId: 'tx-123'
            },
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-05')
          }
        ]
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockOrdersResponse);

      const orders = await UserService.getUserOrders();

      expect(orders).toEqual(mockOrdersResponse.data);
      expect(mockHttpApiClient.get).toHaveBeenCalledWith('/users/orders?limit=20&offset=0');
    });

    it('should support pagination for order history', async () => {
      const mockPaginatedResponse = {
        success: true,
        data: [
          {
            id: 'order-2',
            userId: 'user-123',
            items: [],
            total: 49.99,
            status: 'shipped',
            shipping: {},
            payment: {},
            createdAt: new Date('2025-01-02'),
            updatedAt: new Date('2025-01-03')
          }
        ]
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockPaginatedResponse);

      const orders = await UserService.getUserOrders(10, 10);

      expect(orders).toEqual(mockPaginatedResponse.data);
      expect(mockHttpApiClient.get).toHaveBeenCalledWith('/users/orders?limit=10&offset=10');
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        displayName: 'New User'
      };

      const mockRegisterResponse = {
        success: true,
        data: {
          id: 'user-456',
          email: 'newuser@example.com',
          displayName: 'New User',
          role: 'customer',
          profile: {},
          appInstalled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockRegisterResponse);

      const user = await UserService.register(registerData);

      expect(user).toEqual(mockRegisterResponse.data);
      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
    });

    it('should validate registration data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        displayName: ''
      };

      mockHttpApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(UserService.register(invalidData)).rejects.toThrow('Validation failed');
    });

    it('should handle duplicate email registration', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'securepassword123',
        displayName: 'Existing User'
      };

      const mockErrorResponse = {
        success: false,
        message: 'Email already exists',
        data: null
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockErrorResponse);

      await expect(UserService.register(registerData)).rejects.toThrow('Email already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'correctpassword'
      };

      const mockLoginResponse = {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            displayName: 'John Doe',
            role: 'customer'
          },
          token: 'jwt-token-123'
        }
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockLoginResponse);

      const authResult = await UserService.login(loginData);

      expect(authResult).toEqual(mockLoginResponse.data);
      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/auth/login', loginData);
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      const mockErrorResponse = {
        success: false,
        message: 'Invalid credentials',
        data: null
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockErrorResponse);

      await expect(UserService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      const mockLogoutResponse = {
        success: true,
        data: { message: 'Logged out successfully' }
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockLogoutResponse);

      const result = await UserService.logout();

      expect(result).toEqual(mockLogoutResponse.data);
      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/auth/logout', {});
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should initiate password reset', async () => {
      const resetData = {
        email: 'user@example.com'
      };

      const mockResetResponse = {
        success: true,
        data: { message: 'Password reset email sent' }
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockResetResponse);

      const result = await UserService.forgotPassword(resetData.email);

      expect(result).toEqual(mockResetResponse.data);
      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', resetData);
    });
  });
});