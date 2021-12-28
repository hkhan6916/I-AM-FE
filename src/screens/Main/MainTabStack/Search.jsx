import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiCall from '../../../helpers/apiCall';
import UserThumbnail from '../../../components/UserThumbnail';

const SearchScreen = () => {
  const [searchInput, setSearchInput] = useState();
  const [results, setResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [test, setTest] = useState({
    name: '',
    typing: false,
    typingTimeout: 0,
  });

  const handleSearch = async (searchTerm) => {
    setSearchInput(searchTerm);
    const { response } = await apiCall('POST', `/user/search/${results.length}`, { searchTerm });
    if (response.length) {
      setResults(response);
    } else {
      setResults([]);
    }
  };

  const searchUsers = (searchTerm) => {
    if (test.typingTimeout) {
      clearTimeout(test.typingTimeout);
    }

    setTest({
      name: searchTerm,
      typing: false,
      typingTimeout: setTimeout(() => {
        handleSearch(searchTerm);
      }, 500),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
          placeholder="Search for someone..."
          onChangeText={(v) => searchUsers(v)}
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
          <UserThumbnail key={user._id} user={user} avatarSize={showAllResults ? 70 : 55} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
});
export default SearchScreen;
