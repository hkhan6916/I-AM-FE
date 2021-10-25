import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Button,
} from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';

const FriendsScreen = ({ friends }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Button title="Friend Requests" onPress={() => navigation.navigate('FriendRequestsScreen')} />
      {friends.map((friend, i) => (
        <Text key={`friend-${i}`}>{friend.firstName}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
});

export default FriendsScreen;
