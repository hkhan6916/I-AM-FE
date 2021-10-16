import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { setItemAsync } from 'expo-secure-store';
import apiCall from '../helpers/apiCall';
import AuthScreens from './Auth';
import MainScreens from './Main';

const Screens = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loginAttemptStatus = useSelector((state) => state.loggedIn);
  const getUserFeed = async () => {
    const { success } = await apiCall('GET', '/user/feed');
    if (success) {
      setLoggedIn(true);
      setLoaded(true);
    } else {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!loaded || loginAttemptStatus.state) {
      (async () => {
        // await setItemAsync('authToken', '');
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
    <NavigationContainer>
      {loaded && loggedIn
        ? <MainScreens /> : <AuthScreens />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Screens;
