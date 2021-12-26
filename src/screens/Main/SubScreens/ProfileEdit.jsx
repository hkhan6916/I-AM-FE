import React, { useState } from 'react';
import {
  View, Text, Button, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiCall from '../../../helpers/apiCall';

const ProfileEdit = () => {
  const [searchInput, setSearchInput] = useState();
  const [results, setResults] = useState([]);

  const handleSearch = async (query) => {
    setSearchInput(query);
    const { response } = await apiCall('GET', `/jobs/search/${query}`);
    if (response.length) {
      setResults(response);
    } else {
      setResults([]);
    }
  };

  return (
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
        placeholder="Search job titles..."
        onChangeText={(v) => handleSearch(v)}
        returnKeyType="search"
      />

      {results.map((result) => (
        <Text>{result.title}</Text>
      ))}
    </View>
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

export default ProfileEdit;
