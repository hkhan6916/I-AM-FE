// the dotenv/config will read your .env file
// and merge it with process.env data
// This is just for the builds that happen outside of eas
import "dotenv/config";

export default {
  expo: {
    name: "Magnet",
    slug: "Magnet",
    version: "1.0.5",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    jsEngine: "hermes",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.magnetapp.magnet",
      infoPlist: {
        NSCameraUsageDescription: "This app uses the camera.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      useNextNotificationsApi: true,
      googleServicesFile: "./google-services.json",
      package: "com.magnetapp.magnet",
      versionCode: 3,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["react-native-compressor", "react-native-vision-camera"],
    extra: {
      apiUrl: process.env.API_URL,
      apiWebSocketUrl: process.env.API_WEBSOCKET_URL,
      experienceId: process.env.EXPERIENCE_ID,
    },
  },
};
