export default {
  expo: {
    name: "Insight",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/512px-Insight-ICON.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/512px-Insight-ICON.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      buildNumber: "69",
      infoPlist: {
        NSMicrophoneUsageDescription: "InsightAI uses the microphone for voice notes.",
        NSSpeechRecognitionUsageDescription: "InsightAI uses speech recognition to convert your voice into text for taking notes and searching your content.",
        NSPhotoLibraryUsageDescription: "InsightAI needs access to your photo library to let you select and upload a profile picture for your account.",
        ITSAppUsesNonExemptEncryption: false
      },
      bundleIdentifier: "com.crupid.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/512px-Insight-ICON.png",
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
        projectId: "ea3c5792-eb79-42fd-ae02-f5d8a1ec53dd"
      },
      // Hardcoded for EAS builds - process.env doesn't work at build time
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "878031859491-tub0qt8omp6enuiaqr7liivotmkq7gef.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "878031859491-dmj3m0e95nl2hmbt08c4oo7qm3a4j49l.apps.googleusercontent.com",
    },
    owner: "crupid",
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
