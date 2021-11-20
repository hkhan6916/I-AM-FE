import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabStack from './MainTabStack';
import UserProfileScreen from './SubScreens/UserProfileScreen';
import PostScreen from './SubScreens/PostScreen';
import RepostScreen from './SubScreens/RepostScreen';
import VideoScreen from './SubScreens/VideoScreen';
import CommentsScreen from './SubScreens/CommentsScreen';
import themeStyle from '../../theme.style';

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
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="UserProfileScreen"
      component={UserProfileScreen}
    />
    <Stack.Screen
      options={{
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="PostScreen"
      component={PostScreen}
    />
    <Stack.Screen
      options={{
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="RepostScreen"
      component={RepostScreen}
    />
    <Stack.Screen
      options={{
        title: 'FullScreen',
        headerShown: false,
      }}
      name="VideoScreen"
      component={VideoScreen}
    />
    <Stack.Screen
      options={{
        title: 'Comments',
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="CommentsScreen"
      component={CommentsScreen}
    />
  </Stack.Navigator>
);
export default MainStack;
