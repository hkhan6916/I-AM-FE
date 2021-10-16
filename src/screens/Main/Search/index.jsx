import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from './Search';
import UserProfileScreen from './UserProfile';

const Stack = createNativeStackNavigator();

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      options={{
        headerShown: false,
      }}
      name="SearchScreen"
      component={SearchScreen}
    />
    <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
  </Stack.Navigator>
);
export default SearchStack;
