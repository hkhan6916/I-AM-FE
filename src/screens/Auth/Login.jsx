import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Button,
} from 'react-native';
import { setItemAsync } from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import apiCall from '../../helpers/apiCall';

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigation = useNavigation();

  const verifyToken = async () => {
    const { success } = await apiCall('GET', '/user/feed');
    if (success) {
      navigation.navigate('Home');
    }
  };

  const authenticateUser = async () => {
    const { response, success } = await apiCall('POST', '/user/login', { identifier, password });
    if (success && response.token) {
      await setItemAsync('authToken', response.token);
      navigation.navigate('Home');
    } else {
      setLoginError('Whoops, your credentials do not match. Please try again.');
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);
  return (
    <View style={styles.container}>
      <TextInput
        style={{ height: 40 }}
        value={identifier}
        placeholder="Username or Email..."
        onChangeText={(v) => setIdentifier(v)}
      />
      <TextInput
        style={{ height: 40 }}
        value={password}
        placeholder="Password... "
        onChangeText={(v) => setPassword(v)}
      />
      <Button title="Login" onPress={() => authenticateUser()} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />

      {loginError ? <Text style={styles.loginError}>{loginError}</Text> : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginError: {
    textAlign: 'center',
    color: 'red',
    fontWeight: '500',
  },
});

export default LoginScreen;
