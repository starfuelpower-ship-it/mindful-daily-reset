import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.53d04b63e0ee43f3822af5b2e6319d75',
  appName: 'Cozy Habits',
  webDir: 'dist',
  
  // PRODUCTION: Server block removed for App Store builds
  // DEVELOPMENT: Uncomment for hot reload from Lovable sandbox
  // server: {
  //   url: 'https://53d04b63-e0ee-43f3-822a-f5b2e6319d75.lovableproject.com?forceHideBadge=true',
  //   cleartext: true,
  // },

  // iOS-specific configuration
  ios: {
    scheme: 'App',
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
  },

  // Plugin configurations
  plugins: {
    // Push Notifications configuration
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    
    // Keyboard behavior
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },

    // Status bar styling
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff',
    },

    // Splash screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FFF8F5',
      showSpinner: false,
    },
  },
};

export default config;
