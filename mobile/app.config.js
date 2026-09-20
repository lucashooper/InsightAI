const fs = require('fs');
const path = require('path');

function readEnvValue(key) {
  const fromProcess = process.env[key];
  if (fromProcess && fromProcess.length > 10) return fromProcess;

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return undefined;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    if (name === key) return trimmed.slice(eq + 1).trim();
  }
  return undefined;
}

const elevenLabsKey = readEnvValue('EXPO_PUBLIC_ELEVENLABS_API_KEY');
const revenueCatAndroidKey = readEnvValue('EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY');

const productionProfiles = new Set(['production', 'preview', 'investor-apk']);
const includeDevClient = !productionProfiles.has(process.env.EAS_BUILD_PROFILE ?? '');

module.exports = ({ config }) => ({
  ...config,
  name: "Insight-App",
  owner: "crupid",
  slug: "insight-app",
  scheme: "insight",
  version: "1.15",
  orientation: "portrait",
  icon: "./assets/icon.png",
  // Light-mode-first: the app ignores the OS dark setting on every screen.
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    buildNumber: "133",
    bundleIdentifier: "com.crupid.mobile",
    scheme: "insight",
    infoPlist: {
      NSMicrophoneUsageDescription: "Insight uses the microphone for voice journaling, Vent Mode conversations, and speech-to-text notes.",
      NSSpeechRecognitionUsageDescription: "Insight uses speech recognition to convert your voice into text for journal entries and Vent Mode.",
      NSPhotoLibraryUsageDescription: "Insight needs access to your photo library so you can select a profile picture for your account.",
      ITSAppUsesNonExemptEncryption: false,
      NSFaceIDUsageDescription: "Insight uses Face ID to quickly unlock your journal so only you can access your entries.",
      CFBundleURLTypes: [
        {
          CFBundleURLName: "insight",
          CFBundleURLSchemes: ["insight"]
        }
      ]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#0D0B18"
    },
    versionCode: 118,
    permissions: [
      "INTERNET",
      "RECORD_AUDIO",
      "CAMERA",
      "READ_MEDIA_IMAGES",
      "POST_NOTIFICATIONS",
      "USE_BIOMETRIC",
      "USE_FINGERPRINT",
      "VIBRATE"
    ],
    predictiveBackGestureEnabled: false,
    package: "com.crupid.mobile"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "19faa7e4-fc94-4539-a3c3-673c45d7353d",
    },
    EXPO_PUBLIC_SUPABASE_URL: "https://ptpqvghlaesyrzlljzkk.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cHF2Z2hsYWVzeXJ6bGxqemtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDc4MzEsImV4cCI6MjA2ODY4MzgzMX0.dmkb2_Hdf0vQwirOwJKX4ssfr0ltA1eIZ5_v1s5p6DE",
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "878031859491-dmj3m0e95nl2hmbt08c4oo7qm3a4j49l.apps.googleusercontent.com",
    EXPO_PUBLIC_ELEVENLABS_API_KEY: elevenLabsKey,
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: revenueCatAndroidKey,
  },
  updates: {
    url: "https://u.expo.dev/19faa7e4-fc94-4539-a3c3-673c45d7353d",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  plugins: [
    "./plugins/withDisableExplicitSwiftModules.js",
    ...(includeDevClient
      ? [["expo-dev-client", { addGeneratedScheme: true }]]
      : []),
    [
      "expo-splash-screen",
      {
        backgroundColor: "#A9E4E0",
        image: "./public/splash-logo.png",
        imageWidth: 128,
        resizeMode: "contain"
      }
    ],
    [
      "expo-build-properties",
      {
        ios: {
          extraPods: [
            { name: "GoogleUtilities", modular_headers: true },
            { name: "RecaptchaInterop", modular_headers: true },
            { name: "AppCheckCore", version: "11.2.0" }
          ]
        },
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35
        }
      }
    ],
    "expo-speech-recognition",
    "expo-secure-store",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: "com.googleusercontent.apps.878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef"
      }
    ],
    "expo-apple-authentication",
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Insight uses Face ID to quickly unlock your journal so only you can access your entries."
      }
    ]
  ]
});