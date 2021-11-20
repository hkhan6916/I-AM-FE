import React from 'react';
import {
  View, Text, TouchableHighlight, StyleSheet, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Avatar from './Avatar';
import themeStyle from '../theme.style';

const UserThumbnail = ({ user, avatarSize }) => {
  const navigation = useNavigation();
  return (
    <TouchableHighlight
      key={user._id}
      underlayColor="gray"
      style={styles.userResult}
      onPress={() => navigation.navigate('UserProfileScreen', { userId: user._id })}
    >
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
      >
        <Avatar
          navigation={navigation}
          size={avatarSize}
          avatarUrl={user.profileGifUrl}
          hasBorder
        />
        <View style={{
          display: 'flex', justifyContent: 'center', marginLeft: 20,
        }}
        >
          <Text numberOfLines={1} style={{ fontWeight: '700', maxWidth: 200 }}>{user.username}</Text>
          <Text style={{ maxWidth: 200 }} numberOfLines={1}>
            {user.firstName}
            {' '}
            {user.lastName}
          </Text>
          {user.jobTitle
                && (
                <Text
                  numberOfLines={1}
                  style={{ color: themeStyle.colors.grayscale.mediumGray, maxWidth: 200 }}
                >
                  {user.jobTitle}
                </Text>
                )}
        </View>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({

});

export default UserThumbnail;
