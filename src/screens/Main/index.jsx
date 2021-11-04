import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabStack from './MainTabStack';
import UserProfileScreen from './SubScreens/UserProfileScreen';
import PostScreen from './SubScreens/PostScreen';
import RepostScreen from './SubScreens/RepostScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { elevation: 0 },
      cardStyle: { backgroundColor: '#fff' },
    }}
    initialRouteName="MainTabStack"
  >
    <Stack.Screen
      options={{
        headerShown: false,
      }}
      name="MainTabStack"
      component={MainTabStack}
    />
    <Stack.Screen
      options={{
        headerShown: true,
      }}
      name="UserProfileScreen"
      component={UserProfileScreen}
    />
    <Stack.Screen
      options={{
        headerShown: true,
      }}
      name="PostScreen"
      component={PostScreen}
    />
    <Stack.Screen
      options={{
        headerShown: true,
      }}
      name="RepostScreen"
      component={RepostScreen}
    />
  </Stack.Navigator>
);
export default MainStack;
