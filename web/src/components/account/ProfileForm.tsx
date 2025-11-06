import React from 'react';
import { useForm } from 'react-hook-form';
import { Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { UserService } from '../../services/userService';
import { UserProfile } from '@/shared/types';
import { ProfileAnalyticsService } from '../../analytics/profileEvents';

interface ProfileFormData {
  displayName: string;
  phone: string;
  address: string;
}

interface ProfileFormProps {
  initialData: {
    displayName: string;
    phone: string;
    address: string;
  };
  onUpdate: (updatedProfile: any) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onUpdate }) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: Partial<UserProfile> = {
        phone: data.phone || undefined,
      };

      const updatedUser = await UserService.updateUserProfile(updateData);
      setSuccess('Profile updated successfully');
      onUpdate(updatedUser);
      reset({
        displayName: updatedUser.displayName || '',
        phone: updatedUser.profile?.phone || '',
        address: updatedUser.profile?.address || '',
      });

      // Track profile update analytics
      ProfileAnalyticsService.trackProfileFormUpdate(
        updatedUser.id,
        'session_' + Date.now(), // In a real app, get from context
        Object.keys(updateData),
        !!updatedUser.profile?.phone,
        !!updatedUser.profile?.address
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="displayName"
              placeholder="Enter your full name"
              {...register('displayName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="Enter your phone number"
                className="pl-10"
                {...register('phone', {
                  pattern: {
                    value: /^\+?[\d\s\-\(\)]+$/,
                    message: 'Invalid phone number format',
                  },
                })}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="Enter your address"
                className="pl-10"
                {...register('address')}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || isUpdating}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};