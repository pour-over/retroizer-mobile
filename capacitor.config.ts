import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.retroizer.app',
  appName: 'Retroizer',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0A0804',
    scrollEnabled: false,
    limitsNavigationsToAppBoundDomains: true,
  },
  android: {
    backgroundColor: '#0A0804',
    allowMixedContent: false,
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0A0804',
    },
  },
};

export default config;
