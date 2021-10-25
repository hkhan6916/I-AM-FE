import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Image,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import apiCall from '../../../helpers/apiCall';
import themeStyle from '../../../theme.style';

const SearchScreen = () => {
  const [searchInput, setSearchInput] = useState();
  const [results, setResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const navigation = useNavigation();

  const userData = useSelector((state) => state.userData);

  const handleSearch = async (username) => {
    setSearchInput(username);
    const { response } = await apiCall('GET', `/user/search/${username}`);
    if (response.length) {
      setResults(response);
    } else {
      setResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Ionicons
          style={styles.searchIcon}
          name="search"
          size={12}
          color={searchInput ? '#000' : '#b8b894'}
        />
        <TextInput
          style={styles.searchBar}
          placeholderTextColor="#b8b894"
          autoCorrect={false}
          placeholder="Type a username..."
          onChangeText={(v) => handleSearch(v)}
          returnKeyType="search"
          onFocus={() => {
            setShowAllResults(false);
          }}
          onSubmitEditing={() => {
            setShowAllResults(true);
          }}
        />
      </View>
      <View>
        {results.map((user) => (
          <TouchableHighlight
            key={user._id}
            underlayColor="gray"
            style={styles.userResult}
            onPress={() => navigation.navigate('UserProfileScreen', { user })}
          >
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
            >
              <View style={{
                width: showAllResults ? 70 : 55,
                height: showAllResults ? 70 : 55,
                borderRadius: 10,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: themeStyle.colors.primary.default,
              }}
              >
                <Image
                  source={{ uri: user.profileGifUrl }}
                  resizeMode="cover"
                  style={{
                    borderRadius: 10,
                    alignSelf: 'center',
                    width: showAllResults ? 70 : 55,
                    height: showAllResults ? 70 : 55,
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
                {user.jobTitle
                && (
                <Text
                  numberOfLines={1}
                  style={{ color: themeStyle.colors.grayscale.mediumGray, maxWidth: 200 }}
                >
                  {user.jobTitle}
                </Text>
                )}
                {showAllResults && userData.state?.friendRequestsSent.includes(user._id)
                && (
                <Text
                  numberOfLines={1}
                  style={{
                    color: themeStyle.colors.grayscale.lightGray,
                    maxWidth: 200,
                    fontSize: 12,
                  }}
                >
                  Request sent
                </Text>
                )}
              </View>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
  },
  searchBar: {
    flex: 1,
    color: '#000',
  },
  searchSection: {
    flexDirection: 'row',
  },
  searchIcon: {
    padding: 10,
  },
  userResult: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    // backgroundColor: '#b8b894',
  },
});
export default SearchScreen;
