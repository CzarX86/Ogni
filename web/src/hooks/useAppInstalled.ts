interface AppDetectionResult {
  isAppInstalled: boolean;
  isMobile: boolean;
  platform: 'ios' | 'android' | 'unknown';
  canOpenApp: boolean;
}

export const useAppInstalled = (): AppDetectionResult => {
  // Detect mobile platform and app installation status
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobileDevice = isIOS || isAndroid;

  const platform: 'ios' | 'android' | 'unknown' = isIOS ? 'ios' : isAndroid ? 'android' : 'unknown';

  // For demo purposes, assume app is installed on mobile devices
  const canOpenApp = isMobileDevice;
  const isAppInstalled = isMobileDevice;

  return {
    isAppInstalled,
    isMobile: isMobileDevice,
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