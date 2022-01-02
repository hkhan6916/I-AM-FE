import React, {
  useEffect, useContext, useState, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, RefreshControl, TouchableOpacity, SafeAreaView, StatusBar, FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import themeStyle from '../../../theme.style';
import FeedContext from '../../../Context';
import PostCard from '../../../components/PostCard';
import apiCall from '../../../helpers/apiCall';
import Logo from '../../../../assets/Logo';

const { statusBarHeight } = Constants;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const newPostCreated = useSelector((state) => state.postCreated);
  const initialFeed = useContext(FeedContext);
  const [feed, setFeed] = useState(initialFeed);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

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
    <SafeAreaView style={styles.container}>
      {newPostCreated.state ? (
        <Text style={styles.newPostPill}>Post created</Text>
      ) : null}
      <StatusBar
        backgroundColor={themeStyle.colors.grayscale.black}
        barStyle="light-content"
      />
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: themeStyle.colors.grayscale.white,
        borderBottomWidth: 1,
        borderBottomColor: themeStyle.colors.grayscale.black,
      }}
      >
        <View style={{ marginHorizontal: 20 }}>
          <Logo fill={themeStyle.colors.grayscale.black} />
        </View>
        <TouchableOpacity style={{ padding: 10, marginRight: 10 }} onPress={() => navigation.navigate('ChatListScreen')}>
          <Ionicons name="paper-plane-outline" size={24} color={themeStyle.colors.grayscale.black} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={feed}
        renderItem={({ item }) => (
          <View>
            <PostCard post={item} />
          </View>
        )}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        refreshControl={(
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => getUserFeed()}
        onEndReachedThreshold={0.5}
      />
      {/* <ScrollView
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
      </ScrollView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: statusBarHeight + 80,
  },
});

export default HomeScreen;
