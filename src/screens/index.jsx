import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './Auth/Login';
import RegisterationScreen from './Auth/Register';
import HomeScreen from './Main/Home';

const Stack = createNativeStackNavigator();
const Screens = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{
      headerShown: false,
    }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterationScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />

    </Stack.Navigator>
  </NavigationContainer>
);
export default Screens;
