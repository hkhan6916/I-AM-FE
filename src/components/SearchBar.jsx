import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import themeStyle from "../theme.style";
import apiCall from "../helpers/apiCall";

const SearchBar = ({
  onFocus,
  onSubmitEditing,
  setResults,
  dataToSearchWithin,
  contactName,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [typingStatus, setTypingStatus] = useState({
    name: "",
    typing: false,
    typingTimeout: 0,
  });
  const searchUsers = (searchTerm) => {
    if (!dataToSearchWithin) {
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
    } else {
      setSearchInput(searchTerm);

      handleSearch(searchTerm);
    }
  };

  const handleSearch = async (searchTerm) => {
    if (!dataToSearchWithin) {
      // if no local data, send apicall to find friends.
      const { response } = await apiCall("POST", `/user/search/0`, {
        searchTerm,
      });
      if (response.length) {
        setResults(response);
      } else {
        setResults([]);
      }
    } else {
      const result = dataToSearchWithin.filter((friend) => {
        return (
          friend.firstName?.includes(searchTerm) ||
          friend.lastName?.includes(searchTerm) ||
          friend.username?.includes(searchTerm) ||
          friend.jobTitle?.includes(searchTerm)
        );
      });
      // if empty search, return empty array, if no results found return "none" else return result
      setResults(!searchTerm ? [] : !result.length ? "none" : result);
    }
  };

  const resetSearch = () => {
    setResults([]);
    setSearchInput("");
  };

  return (
    <View
      style={
        dataToSearchWithin
          ? styles.localSearchStyles
          : styles.defaultContainerStyles
      }
    >
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
        placeholder={
          dataToSearchWithin
            ? `Search ${contactName ? `${contactName}'s` : ""} contacts`
            : "name, username or job title"
        }
        onChangeText={(v) => searchUsers(v)}
        returnKeyType="search"
        onFocus={onFocus ? () => onFocus() : null}
        onSubmitEditing={onSubmitEditing ? () => onSubmitEditing() : null}
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
  defaultContainerStyles: {
    flexDirection: "row",
    height: 48,
    alignItems: "center",
    backgroundColor: themeStyle.colors.grayscale.highest,
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.colors.grayscale.low,
  },
  localSearchStyles: {
    flexDirection: "row",
    height: 48,
    alignItems: "center",
    backgroundColor: themeStyle.colors.grayscale.higher,
    borderRadius: 48,
    marginBottom: 20,
  },
  searchIcon: {
    padding: 10,
  },
});
export default React.memo(SearchBar);
