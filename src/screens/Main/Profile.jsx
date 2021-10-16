import React from 'react';
import { View, Text, Button } from 'react-native';
import { setItemAsync } from 'expo-secure-store';
import { useDispatch } from 'react-redux';

const ProfileScreen = () => {
  const dispatch = useDispatch();

  const logout = async () => {
    await setItemAsync('authToken', '');
    dispatch({ type: 'SET_USER_LOGGED_IN', payload: false });
  };
  return (
    <View>
      <Text>Profile Screen</Text>
      <Button onPress={() => logout()} title="logout" />
    </View>
  );
};

export default ProfileScreen;
