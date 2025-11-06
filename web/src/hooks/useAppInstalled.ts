import { useState, useEffect } from 'react';

interface AppDetectionResult {
  isAppInstalled: boolean;
  isMobile: boolean;
  platform: 'ios' | 'android' | 'unknown';
  canOpenApp: boolean;
}

/**
 * Hook to detect if the mobile app is installed and provide app opening functionality
 */
export const useAppInstalled = (): AppDetectionResult => {
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');
  const [canOpenApp, setCanOpenApp] = useState(false);

  useEffect(() => {
    // Detect mobile platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobileDevice = isIOS || isAndroid;

    setIsMobile(isMobileDevice);

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    }

    // Check if app is installed (simplified check)
    // In a real implementation, this would check for custom URL scheme support
    const checkAppInstalled = async () => {
      if (!isMobileDevice) {
        setCanOpenApp(false);
        return;
      }

      try {
        // For iOS, we can try to open the app and see if it succeeds
        // For Android, we can check if the intent URL is supported
        const appUrl = platform === 'ios'
          ? 'ogni://' // iOS custom URL scheme
          : 'intent://ogni/#Intent;scheme=ogni;package=com.ogni.app;end'; // Android intent

        // Try to open the app (this is a simplified check)
        // In production, you'd use a more sophisticated method
        setCanOpenApp(true);
        setIsAppInstalled(true); // Assume installed for demo purposes
      } catch (error) {
        setCanOpenApp(false);
        setIsAppInstalled(false);
      }
    };

    checkAppInstalled();
  }, [platform]);

  return {
    isAppInstalled,
    isMobile,
    platform,
    canOpenApp,
  };
};

/**
 * Function to open the mobile app
 */
export const openMobileApp = (platform: 'ios' | 'android'): void => {
  const appUrl = platform === 'ios'
    ? 'ogni://' // iOS custom URL scheme
    : 'intent://ogni/#Intent;scheme=ogni;package=com.ogni.app;end'; // Android intent

  const fallbackUrl = platform === 'ios'
    ? 'https://apps.apple.com/app/ogni' // App Store URL
    : 'https://play.google.com/store/apps/details?id=com.ogni.app'; // Play Store URL

  // Try to open the app
  window.location.href = appUrl;

  // If app doesn't open within 2 seconds, redirect to store
  setTimeout(() => {
    window.location.href = fallbackUrl;
  }, 2000);
};