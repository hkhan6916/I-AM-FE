import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import apiCall from '../helpers/apiCall';
import AuthScreens from './Auth';
import MainScreens from './Main';
import themeStyle from '../theme.style';
import FeedContext from '../Context';

const Screens = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [feed, setFeed] = useState([]);
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

  if (!loaded) {
    return (
      <View style={styles.splashScreenContainer}>
        <Text>Splash Screen</Text>
      </View>
    );
  }
  return (
    <NavigationContainer theme={Theme}>
      {loaded && loggedIn
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
