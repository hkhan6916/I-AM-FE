import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './Home';
import PostScreen from './Post';
import ProfileScreen from './Profile';
import SearchStack from './Search';
import FriendsScreen from './Friends';
import themeStyle from '../../theme.style';

const Tab = createBottomTabNavigator();
const MainScreens = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: themeStyle.colors.primary.default,
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: [
        {
          display: 'flex',
        },
        null,
      ],
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home-outline';
        } else if (route.name === 'Post') {
          iconName = 'add-outline';
        } else if (route.name === 'Me') {
          iconName = 'happy-outline';
        } else if (route.name === 'Search') {
          iconName = 'search-outline';
        } else if (route.name === 'Friends') {
          iconName = 'people-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchStack} />
    <Tab.Screen name="Post" component={PostScreen} />
    <Tab.Screen name="Friends" component={FriendsScreen} />
    <Tab.Screen name="Me" component={ProfileScreen} />
  </Tab.Navigator>
);
export default MainScreens;
