import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { UserService } from '../../services/userService';
import { User } from '@/shared/types';
import { MainLayout } from '@/components/shared/MainLayout';
import { ProfileOverview } from '../../components/account/ProfileOverview';
import { ProfileForm } from '../../components/account/ProfileForm';
import { ProfileAnalyticsService } from '../../analytics/profileEvents';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();

    // Track profile page view
    if (user?.id) {
      ProfileAnalyticsService.trackProfilePageView(
        user.id,
        'session_' + Date.now(), // In a real app, get from context
        'profile'
      );
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await UserService.getUserProfile();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load user profile</AlertDescription>
            </Alert>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid gap-6">
            <ProfileOverview user={user} />
            <ProfileForm
              initialData={{
                displayName: user.displayName || '',
                phone: user.profile?.phone || '',
                address: user.profile?.address || '',
              }}
              onUpdate={handleProfileUpdate}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};