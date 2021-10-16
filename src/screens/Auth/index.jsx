import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Login';
import RegisterationScreen from './Register';

const Stack = createNativeStackNavigator();
const AuthScreens = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterationScreen} />
  </Stack.Navigator>
);
export default AuthScreens;
