import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import themeStyle from "../theme.style";
import apiCall from "../helpers/apiCall";

const SearchBar = ({ onFocus, onSubmitEditing, setResults }) => {
  const [searchInput, setSearchInput] = useState("");
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

  const resetSearch = () => {
    setResults([]);
    setSearchInput("");
  };

  return (
    <View style={styles.searchSection}>
      <Ionicons
        style={styles.searchIcon}
        name="search"
        size={16}
        color={
          searchInput
            ? themeStyle.colors.grayscale.lowest
            : themeStyle.colors.grayscale.low
        }
      />
      <TextInput
        value={searchInput}
        style={styles.searchBar}
        placeholderTextColor={themeStyle.colors.grayscale.low}
        autoCorrect={false}
        placeholder="name, username or job title"
        onChangeText={(v) => searchUsers(v)}
        returnKeyType="search"
        onFocus={() => onFocus()}
        onSubmitEditing={() => onSubmitEditing()}
      />
      {searchInput ? (
        <TouchableOpacity onPress={() => resetSearch()}>
          <Ionicons
            style={styles.searchIcon}
            name="close"
            size={20}
            color={themeStyle.colors.grayscale.lowest}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    color: themeStyle.colors.grayscale.lowest,
    height: "100%",
  },
  searchSection: {
    flexDirection: "row",
    height: 48,
    alignItems: "center",
    backgroundColor: themeStyle.colors.grayscale.highest,
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.colors.grayscale.low,
  },
  searchIcon: {
    padding: 10,
  },
});
export default React.memo(SearchBar);
