// the dotenv/config will read your .env file
// and merge it with process.env data
// This is just for the builds that happen outside of eas
import "dotenv/config";

export default {
  expo: {
    name: "Magnet",
    slug: "Magnet",
    version: "1.2.0",
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
        NSCameraUsageDescription:
          "Magnet uses access to your camera to do things such as let you take photos and videos to then post on Magnet.",
        NSPhotoLibraryAddUsageDescription:
          "Magnet uses access to your photos to do things such as let you pick images and videos to then post on Magnet.",
        NSPhotoLibraryUsageDescription:
          "Magnet uses access to your photos to do things such as let you pick images and videos to then post on Magnet.",
        NSMicrophoneUsageDescription:
          "Magnet uses access to your microphone to do things such as record audio when recording videos to then post on Magnet.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      googleServicesFile: "./google-services.json",
      package: "com.magnetapp.magnet",
      versionCode: 10,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "react-native-compressor",
      "react-native-vision-camera",
      [
        "@config-plugins/ffmpeg-kit-react-native",
        {
          package: "min-gpl",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "14.0",
          },
        },
      ],
      "expo-tracking-transparency",
    ],
    extra: {
      apiUrl:
        process.env.TESTING === "yes"
          ? process.env.TEST_API_URL
          : process.env.API_URL,
      apiWebSocketUrl:
        process.env.TESTING === "yes"
          ? process.env.TEST_API_WEBSOCKET_URL
          : process.env.API_WEBSOCKET_URL,
      experienceId: process.env.EXPERIENCE_ID,
      packageName: process.env.PACKAGE_NAME,
      appStoreId: process.env.APP_STORE_ID,
      eas: {
        // We need this for production builds. Need to store in .env and in expo.dev secrets
        projectId: "c8d33980-51de-472d-977a-dc62d80d2683",
      },
    },
  },
};
