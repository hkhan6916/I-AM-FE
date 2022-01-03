import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl,
} from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import themeStyle from '../../../../theme.style';
import apiCall from '../../../../helpers/apiCall';
import UserThumbnail from '../../../../components/UserThumbnail';

const FriendRequestsScreen = () => {
  const [currentTab, setCurrentTab] = useState('received');
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const userData = useSelector((state) => state.userData);

  const getFriendRequests = async () => {
    const { success, response } = await apiCall('GET', '/user/friend/requests');
    if (success) {
      setFriendRequestsReceived(response.received);
      setFriendRequestsSent(response.sent);
    }
  };

  const onRefresh = useCallback(async () => {
    await getFriendRequests();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    navigation.addListener('focus', async () => {
      await getFriendRequests();
    });
    return () => {
      setFriendRequestsReceived([]);
      setFriendRequestsSent([]);
    };
  }, [navigation]);

  useEffect(() => {
    (async () => {
      friendRequestsSent.forEach((request) => {
        if (!userData.state?.friendRequestsSent?.includes(request._id)) {
          const array = friendRequestsSent; // make a separate copy of the array
          const index = array.indexOf(request);
          if (index !== -1) {
            array.splice(index, 1);
            setFriendRequestsSent(array);
          }
        }
      });
      if (userData.state.friendRequestsSent.length > friendRequestsReceived.length) {
        await getFriendRequests();
      }
      friendRequestsReceived.forEach((request) => {
        if (!userData.state?.friendRequestsReceived?.includes(request._id)) {
          const array = friendRequestsReceived; // make a separate copy of the array
          const index = array.indexOf(request);
          if (index !== -1) {
            array.splice(index, 1);
            setFriendRequestsReceived(array);
          }
        }
      });
      if (userData.state.friendRequestsReceived.length > friendRequestsReceived.length) {
        await getFriendRequests();
      }
    })();
    return () => {
      setFriendRequestsReceived([]);
      setFriendRequestsSent([]);
    };
  }, [userData]);
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.requestsTab,
            currentTab === 'received' && styles.activeTab]}
          onPress={() => setCurrentTab('received')}
        >
          <Text style={styles.requestsTabText}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.requestsTab,
            currentTab === 'sent' && styles.activeTab]}
          onPress={() => setCurrentTab('sent')}
        >
          <Text style={styles.requestsTabText}>Sent</Text>
        </TouchableOpacity>
      </View>
      <ScrollView refreshControl={(
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
        )}
      >
        {currentTab === 'received' ? friendRequestsReceived.map((received) => (
          <UserThumbnail avatarSize={50} key={received._id} user={received} />
        ))
          : friendRequestsSent.map((sent) => (
            <UserThumbnail avatarSize={50} key={sent._id} user={sent} />
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: themeStyle.colors.secondary.default,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: themeStyle.colors.grayscale.lightGray,
  },
  requestsTab: {
    marginHorizontal: 10,
    height: 50,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  requestsTabText: {
    fontWeight: '700',
  },
});

export default FriendRequestsScreen;
