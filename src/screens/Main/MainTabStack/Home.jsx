import React, {
  useEffect, useContext, useState, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Constants from 'expo-constants';
import themeStyle from '../../../theme.style';
import FeedContext from '../../../Context';
import PostCard from '../../../components/PostCard';
import apiCall from '../../../helpers/apiCall';

const { statusBarHeight } = Constants;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const newPostCreated = useSelector((state) => state.postCreated);
  const initialFeed = useContext(FeedContext);
  const [feed, setFeed] = useState(initialFeed);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const calculateOffsets = async () => {
    if (!feed.length) {
      return {};
    }
    let i = 0;
    let friendsInterestsOffset = 0;
    while (i < feed.length) {
      if (feed[i].likedBy) {
        friendsInterestsOffset += 1;
      }
      i += 1;
    }

    return {
      friendsInterestsOffset,
      feedTimelineOffset: feed.length - friendsInterestsOffset,
    };
  };

  const getUserFeed = async () => {
    if (!allPostsLoaded && !refreshing) {
      const offsets = await calculateOffsets();
      const { success, response } = await apiCall('POST', '/user/feed', offsets);
      if (success) {
        // if (!response.length && feed.length) {
        if (!response.length) {
          setAllPostsLoaded(true);
        } else {
          setFeed([...feed, ...response]);
        }
      } else if (feed.length) {
        setAllPostsLoaded(true);
      }
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y
      >= contentSize.height - paddingToBottom;
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { success, response } = await apiCall('POST', '/user/feed', {});
    setRefreshing(false);
    if (success) {
      setFeed([]);
      setFeed(response);
    }
  }, []);

  useEffect(() => {
    if (newPostCreated.state) {
      setTimeout(() => {
        dispatch({ type: 'SET_POST_CREATED', payload: false });
      }, 3000);
    }
  }, [newPostCreated, feed]);
  return (
    <View style={styles.container}>
      {newPostCreated.state ? (
        <Text style={styles.newPostPill}>Post created</Text>
      ) : null}
      <ScrollView
        scrollEventThrottle={0}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            getUserFeed();
          }
        }}
        refreshControl={(
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        )}
      >
        {feed.map((post, i) => (
          <PostCard key={`postcard-${i}`} post={post} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
  },
  newPostPill: {
    zIndex: 3, // works on ios
    elevation: 3, // works on android
    backgroundColor: themeStyle.colors.primary.default,
    color: themeStyle.colors.grayscale.white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: statusBarHeight + 10,
  },
});

export default HomeScreen;
