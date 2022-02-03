import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import themeStyle from "../theme.style";
import apiCall from "../helpers/apiCall";

const SearchBar = ({ onFocus, onSubmitEditing, setResults }) => {
  const [searchInput, setSearchInput] = useState();
  const [typingStatus, setTypingStatus] = useState({
    name: "",
    typing: false,
    typingTimeout: 0,
  });
  const searchUsers = (searchTerm) => {
    if (typingStatus.typingTimeout) {
      clearTimeout(typingStatus.typingTimeout);
    }
    setSearchInput(searchTerm);
    setTypingStatus({
      name: searchTerm,
      typing: false,
      typingTimeout: setTimeout(() => {
        handleSearch(searchTerm);
      }, 250),
    });
  };
  const handleSearch = async (searchTerm) => {
    const { response } = await apiCall("POST", `/user/search/0`, {
      searchTerm,
    });
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
        size={16}
        color={
          searchInput
            ? themeStyle.colors.grayscale.black
            : themeStyle.colors.grayscale.lightGray
        }
      />
      <TextInput
        style={styles.searchBar}
        placeholderTextColor="#b8b894"
        autoCorrect={false}
        placeholder="name, username or job title..."
        onChangeText={(v) => searchUsers(v)}
        returnKeyType="search"
        onFocus={() => onFocus()}
        onSubmitEditing={() => onSubmitEditing()}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    color: themeStyle.colors.grayscale.black,
  },
  searchSection: {
    flexDirection: "row",
    height: 48,
    alignItems: "center",
    backgroundColor: themeStyle.colors.grayscale.superLightGray,
  },
  searchIcon: {
    padding: 10,
  },
});
export default SearchBar;