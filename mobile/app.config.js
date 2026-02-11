export default {
  expo: {
    name: "Insight",
    slug: "insight-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/InsightAI-New-Logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/InsightAI-New-Logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      buildNumber: "69",
      infoPlist: {
        NSMicrophoneUsageDescription: "InsightAI uses the microphone for voice notes.",
        NSSpeechRecognitionUsageDescription: "InsightAI uses speech recognition to convert your voice into text for taking notes and searching your content.",
        NSPhotoLibraryUsageDescription: "Insight uses your photo library so you can choose a profile picture from your existing photos. For example, you can select a photo to personalize your account profile displayed in the Settings screen. Your photos are not accessed for any other purpose.",
        ITSAppUsesNonExemptEncryption: false
      },
      bundleIdentifier: "com.crupid.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/InsightAI-New-Logo.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "RECORD_AUDIO"
      ],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.crupid.mobile"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "8ffc6ed0-5105-49a6-90c1-3b7ab9ba9011"
      },
      // Hardcoded for EAS builds - process.env doesn't work at build time
      EXPO_PUBLIC_SUPABASE_URL: "https://ptpqvghlaesyrzlljzkk.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cHF2Z2hsYWVzeXJ6bGxqemtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMDc4MzEsImV4cCI6MjA2ODY4MzgzMX0.dmkb2_Hdf0vQwirOwJKX4ssfr0ltA1eIZ5_v1s5p6DE",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "878031859491-dmj3m0e95nl2hmbt08c4oo7qm3a4j49l.apps.googleusercontent.com",
    },
    owner: "crupid2s-organization",
    plugins: [
      "expo-speech-recognition",
      "expo-secure-store",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef"
        }
      ],
      "expo-apple-authentication"
    ]
  }
}
