import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { useSelector } from "react-redux";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { setItemAsync } from "expo-secure-store";
import apiCall from "../helpers/apiCall";
import AuthScreens from "./Auth";
import MainScreens from "./Main";
import themeStyle from "../theme.style";
import FeedContext from "../Context";
import registerNotifications from "../helpers/registerNotifications";
import * as SplashScreen from "expo-splash-screen";

const Screens = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [feed, setFeed] = useState([]);
  const [notificationToken, setNotificationToken] = useState("");
  const loginAttemptStatus = useSelector((state) => state.loggedIn);

  const Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: themeStyle.colors.grayscale.superLightGray,
    },
  };

  const getUserFeed = async () => {
    const { success, response } = await apiCall("POST", "/user/feed");
    if (success) {
      setFeed(response.feed);
      setLoggedIn(true);
    }
    setLoaded(true);
  };

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      // TODO: Change experience id in production
      token = (
        await Notifications.getExpoPushTokenAsync({
          experienceId: "@hkhan6916/I-Am-FE",
        })
      ).data;
    } else {
      alert("Must use physical device for Push Notifications");
    }
    if (Platform === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: themeStyle.colors.primary.light,
      });
    }

    return token;
  };

  useEffect(() => {
    (async () => {
      SplashScreen.preventAutoHideAsync();
      // if not loaded, but authenticated
      if (!loaded || loginAttemptStatus.state) {
        await getUserFeed();
      }
      // if loaded, but not authenticated. This is used for logging out a user.
      if (loaded && !loginAttemptStatus.state) {
        setLoggedIn(false);
      }
    })();
  }, [loginAttemptStatus]);

  useEffect(() => {
    if (!notificationToken && loaded) {
      registerForPushNotificationsAsync().then(async (token) => {
        try {
          if (token) {
            const { success } = await apiCall(
              "POST",
              "/user/notifications/token/update",
              { notificationToken: token }
            );
            if (success) {
              await setItemAsync("notificationToken", token);
            }
            setNotificationToken(token || "none");
          } else {
            setNotificationToken("none");
          }
        } catch (error) {
          setNotificationToken("none");
          return;
        }
      });
    }
    (async () => {
      if (loaded && notificationToken) {
        await SplashScreen.hideAsync();
      }
    })();
  }, [loaded, notificationToken]);

  return (
    <NavigationContainer theme={Theme}>
      {!loaded || !notificationToken ? (
        // just so the app has something to render always even if it's an empty view
        <View />
      ) : loaded && loggedIn && notificationToken ? (
        <FeedContext.Provider value={feed}>
          <MainScreens />
        </FeedContext.Provider>
      ) : (
        <AuthScreens />
      )}
    </NavigationContainer>
  );
};

export default Screens;
