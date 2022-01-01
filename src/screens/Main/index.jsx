import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabStack from './MainTabStack';
import UserProfileScreen from './SubScreens/UserProfileScreen';
import MediaScreen from './SubScreens/MediaScreen';
import RepostScreen from './SubScreens/RepostScreen';
import CommentsScreen from './SubScreens/CommentsScreen';
import themeStyle from '../../theme.style';
import PostScreen from './SubScreens/PostScreen';
import ChatScreen from './SubScreens/ChatScreen';
import ChatListScreen from './SubScreens/ChatListScreen';
import CreateChatScreen from './SubScreens/CreateChatScreen';
import ProfileEditScreen from './SubScreens/ProfileEditScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { elevation: 0 },
      cardStyle: { backgroundColor: themeStyle.colors.grayscale.white },
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
        headerShown: false,
      }}
      name="MediaScreen"
      component={MediaScreen}
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
    <Stack.Screen
      options={{
        title: 'View Post',
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="PostsScreen"
      component={PostScreen}
    />
    <Stack.Screen
      options={{
        title: 'ChatScreen',
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="ChatScreen"
      component={ChatScreen}
    />
    <Stack.Screen
      options={{
        title: 'ChatListScreen',
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="ChatListScreen"
      component={ChatListScreen}
    />
    <Stack.Screen
      options={{
        title: 'CreateChatScreen',
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="CreateChatScreen"
      component={CreateChatScreen}
    />
    <Stack.Screen
      options={{
        title: 'Edit Profile',
        headerShown: true,
        headerTintColor: themeStyle.colors.primary.default,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      name="ProfileEdit"
      component={ProfileEditScreen}
    />
  </Stack.Navigator>
);
export default MainStack;
