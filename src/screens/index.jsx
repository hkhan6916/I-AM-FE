import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import apiCall from '../helpers/apiCall';
import AuthScreens from './Auth';
import MainScreens from './Main';
import themeStyle from '../theme.style';
import FeedContext from '../Context';
import registerNotifications from '../helpers/registerNotifications';

const Screens = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [feed, setFeed] = useState([]);
  const [notificationToken, setNotificationToken] = useState('');

  const loginAttemptStatus = useSelector((state) => state.loggedIn);
  const Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: themeStyle.colors.grayscale.white,
    },
  };

  const getUserFeed = async () => {
    const { success, response } = await apiCall('POST', '/user/feed');
    if (success) {
      setFeed(response);
      setLoggedIn(true);
      setLoaded(true);
    } else {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!loaded || loginAttemptStatus.state) {
      (async () => {
        await getUserFeed();
      })();
    } if (loaded && !loginAttemptStatus.state) {
      setLoggedIn(false);
    }
  }, [loginAttemptStatus]);

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
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
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // TODO: Change experience id in production
      token = (await Notifications.getExpoPushTokenAsync({ experienceId: '@hkhan6916/I-Am-FE' })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }
    if (Platform === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  };

  useEffect(() => {
    if (!notificationToken && loaded) {
      registerForPushNotificationsAsync().then(async (token) => {
        try {
          const { success } = await apiCall('POST', '/user/notifications/token/update', { notificationToken: token });
          if (success) {
            await setItemAsync('notificationToken', token);
          }
          setNotificationToken(token || 'none');
        } catch (error) {
          await setItemAsync('notificationToken', token);
        }
      });
    }
  }, [loaded]);

  if (!loaded || !notificationToken) {
    return (
      <View style={styles.splashScreenContainer}>
        <Text>Splash Screen</Text>
      </View>
    );
  }
  return (
    <NavigationContainer theme={Theme}>
      {loaded && loggedIn && notificationToken
        ? (
          <FeedContext.Provider value={feed}>
            <MainScreens />
          </FeedContext.Provider>
        ) : <AuthScreens />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashScreenContainer: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Screens;
