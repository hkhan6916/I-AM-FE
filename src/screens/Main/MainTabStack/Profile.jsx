import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Button, StyleSheet, ScrollView, RefreshControl, SafeAreaView,
} from 'react-native';
import { setItemAsync } from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import Constants from 'expo-constants';
import apiCall from '../../../helpers/apiCall';
import PostCard from '../../../components/PostCard';

const { statusBarHeight } = Constants;

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();

  const logout = async () => {
    await setItemAsync('authToken', '');
    dispatch({ type: 'SET_USER_LOGGED_IN', payload: false });
  };

  const getUserPosts = async () => {
    if (!allPostsLoaded) {
      const { success, response } = await apiCall('GET', `/user/posts/${userPosts.length}`);
      if (success) {
        if (!response.length && userPosts.length) {
          setAllPostsLoaded(true);
        } else {
          setUserPosts([...userPosts, ...response]);
        }
      } else if (userPosts.length) {
        setAllPostsLoaded(true);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { success, response } = await apiCall('GET', `/user/posts/${userPosts.length}`);
    setRefreshing(false);
    if (success) {
      setUserPosts(response);
    }
  }, []);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y
      >= contentSize.height - paddingToBottom;
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
    <SafeAreaView style={styles.container}>
      <Button onPress={() => logout()} title="logout" />
      <ScrollView
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            getUserPosts();
          }
        }}
        refreshControl={(
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
      )}
      >
        {userPosts.map((post, i) => (
          <PostCard key={`postcard-${i}`} post={post} />
        ))}
      </ScrollView>
      <Text>Profile Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ProfileScreen;
