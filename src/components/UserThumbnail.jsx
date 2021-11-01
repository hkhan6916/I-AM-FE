import React from 'react';
import {
  View, Text, TouchableHighlight, StyleSheet, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import themeStyle from '../theme.style';

const UserThumbnail = ({ user }) => {
  const navigation = useNavigation();
  return (
    <TouchableHighlight
      key={user._id}
      underlayColor={themeStyle.colors.grayscale.mediumGray}
      style={styles.userResult}
      onPress={() => navigation.navigate('UserProfileScreen', { userId: user._id })}
    >
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
      >
        <View style={{
          width: 70,
          height: 70,
          borderRadius: 70,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: themeStyle.colors.primary.default,
        }}
        >
          <Image
            source={{ uri: user.profileGifUrl }}
            resizeMode="cover"
            style={{
              borderRadius: 70,
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
          <Text numberOfLines={1} style={{ fontWeight: '700', maxWidth: 200 }}>{user.username}</Text>
          <Text style={{ maxWidth: 200 }} numberOfLines={1}>
            {user.firstName}
            {' '}
            {user.lastName}
          </Text>
          {user.jobTitle && (
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
