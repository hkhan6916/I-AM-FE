import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TouchableHighlight,
} from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import themeStyle from '../../../../theme.style';

const FriendRequestsScreen = ({ friendRequestsReceived, friendRequestsSent }) => {
  const [currentTab, setCurrentTab] = useState('received');

  const navigation = useNavigation();
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
      {currentTab === 'received' ? friendRequestsReceived.map((received) => (
        <TouchableHighlight
          key={received._id}
          underlayColor="gray"
          style={styles.userResult}
          onPress={() => navigation.navigate('UserProfileScreen', { user: received })}
        >
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
          >
            <View style={{
              width: 70,
              height: 70,
              borderRadius: 10,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: themeStyle.colors.primary.default,
            }}
            >
              <Image
                source={{ uri: received.profileGifUrl }}
                resizeMode="cover"
                style={{
                  borderRadius: 10,
                  alignSelf: 'center',
                  width: 70,
                  height: 70,
                }}
              />
            </View>
            <View style={{
              display: 'flex', justifyContent: 'center', marginLeft: 20,
            }}
            >
              <Text numberOfLines={1} style={{ fontWeight: '700', maxWidth: 200 }}>{received.username}</Text>
              <Text style={{ maxWidth: 200 }} numberOfLines={1}>
                {received.firstName}
                {' '}
                {received.lastName}
              </Text>
              {received.jobTitle
                && (
                <Text
                  numberOfLines={1}
                  style={{ color: themeStyle.colors.grayscale.mediumGray, maxWidth: 200 }}
                >
                  {received.jobTitle}
                </Text>
                )}
            </View>
          </View>
        </TouchableHighlight>
      ))
        : friendRequestsSent.map((sent) => (
          <TouchableHighlight
            key={sent._id}
            underlayColor="gray"
            style={styles.userResult}
            onPress={() => navigation.navigate('UserProfileScreen', { user: sent })}
          >
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
            >
              <View style={{
                width: 70,
                height: 70,
                borderRadius: 10,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: themeStyle.colors.primary.default,
              }}
              >
                <Image
                  source={{ uri: sent.profileGifUrl }}
                  resizeMode="cover"
                  style={{
                    borderRadius: 10,
                    alignSelf: 'center',
                    width: 70,
                    height: 70,
                  }}
                />
              </View>
              <View style={{
                display: 'flex', justifyContent: 'center', marginLeft: 20,
              }}
              >
                <Text numberOfLines={1} style={{ fontWeight: '700', maxWidth: 200 }}>{sent.username}</Text>
                <Text style={{ maxWidth: 200 }} numberOfLines={1}>
                  {sent.firstName}
                  {' '}
                  {sent.lastName}
                </Text>
                {sent.jobTitle
                && (
                <Text
                  numberOfLines={1}
                  style={{ color: themeStyle.colors.grayscale.mediumGray, maxWidth: 200 }}
                >
                  {sent.jobTitle}
                </Text>
                )}
              </View>
            </View>
          </TouchableHighlight>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: themeStyle.colors.secondary.default,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
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
