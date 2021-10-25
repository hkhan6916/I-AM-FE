import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, StyleSheet, ScrollView,
} from 'react-native';
import { setItemAsync } from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import Constants from 'expo-constants';
import apiCall from '../../../helpers/apiCall';
import PostCard from '../../../components/PostCard';

const { statusBarHeight } = Constants;

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);

  const dispatch = useDispatch();

  const logout = async () => {
    await setItemAsync('authToken', '');
    dispatch({ type: 'SET_USER_LOGGED_IN', payload: false });
  };

  const getUserPosts = async () => {
    const { success, response } = await apiCall('GET', '/user/posts');

    if (success) {
      setUserPosts(response);
    }
  };

  useEffect(() => {
    (async () => {
      await getUserPosts();
    })();
    return () => {
      setUserPosts([]);
    };
  }, []);
  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
      <Button onPress={() => logout()} title="logout" />
      <ScrollView>
        {userPosts.map((post, i) => (
          <PostCard key={`postcard-${i}`} post={post} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: statusBarHeight,
  },
});
export default ProfileScreen;
