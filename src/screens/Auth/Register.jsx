import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, Button, Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiCall from '../../helpers/apiCall';

const RegisterationScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerationError, setRegisterationError] = useState('');
  const navigation = useNavigation();

  const registerUser = async () => {
    const payload = {
      firstName,
      lastName,
      email,
      password,
      file: null,
    };
    const formData = new FormData();

    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });

    const { success, message } = await apiCall('POST', '/user/register', formData);
    if (success) {
      navigation.navigate('Login');
    } else if (message === 'exists') {
      setRegisterationError('A user already exists with this Email Address.');
    } else {
      setRegisterationError('Error occured but this needs to include validation too!');
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={{ height: 40 }}
        value={firstName}
        placeholder="FirstName..."
        onChangeText={(v) => setFirstName(v)}
      />
      <TextInput
        style={{ height: 40 }}
        value={lastName}
        placeholder="LastName..."
        onChangeText={(v) => setLastName(v)}
      />
      <TextInput
        style={{ height: 40 }}
        value={email}
        placeholder="Email..."
        onChangeText={(v) => setEmail(v)}
      />
      <TextInput
        secureTextEntry
        style={{ height: 40 }}
        value={password}
        placeholder="Password... "
        onChangeText={(v) => setPassword(v)}
      />
      <Button title="Register" onPress={() => registerUser()} />
      {registerationError
        ? <Text style={styles.registerationError}>{registerationError}</Text> : null}
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
  registerationError: {
    textAlign: 'center',
    color: 'red',
    fontWeight: '500',
  },
});

export default RegisterationScreen;
