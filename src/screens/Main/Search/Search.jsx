import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Image,
} from 'react-native';
import { Video } from 'expo-av';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import apiCall from '../../../helpers/apiCall';

const SearchScreen = () => {
  const [searchInput, setSearchInput] = useState();
  const [results, setResults] = useState([]);

  const navigation = useNavigation();

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
          placeholder="Password"
          onChangeText={(v) => handleSearch(v)}
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
            <View>
              <View style={{
                width: 60, height: 60, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#138294',
              }}
              >
                <Image
                  source={{ uri: user.profileGifUrl }}
                  resizeMode="cover"
                  style={{
                    borderRadius: 10,
                    alignSelf: 'center',
                    width: 60,
                    height: 60,
                  }}
                />
              </View>
              <Text>
                {user.firstName}
                {' '}
                {user.lastName}
              </Text>
              <Text>{user.username}</Text>
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
