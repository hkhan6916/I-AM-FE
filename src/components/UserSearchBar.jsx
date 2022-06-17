import { Ionicons, Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import themeStyle from "../theme.style";
import apiCall from "../helpers/apiCall";
import { deleteUserSearchHistoryTable } from "../helpers/sqlite/userSearchHistory";

const UserSearchBar = ({
  onFocus,
  onSubmitEditing,
  setResults,
  dataToSearchWithin,
  contactName,
  onEndEditing = () => null,
  userSearchHistory = [],
  onReset,
  resultsVisible,
  feedIsVisible = false,
  setShowAllResults,
  showAllResults,
  onClear,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [typingStatus, setTypingStatus] = useState({
    name: "",
    typing: false,
    typingTimeout: 0,
  });
  const searchUsers = (searchTerm) => {
    setShowHistory(true);
    if (showAllResults && setShowAllResults) {
      setShowAllResults(false);
    }
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
        const lowerSearchTerm = searchTerm?.toLowerCase();
        return (
          friend.firstName?.toLowerCase().includes(lowerSearchTerm) ||
          friend.lastName?.toLowerCase().includes(lowerSearchTerm) ||
          friend.username?.toLowerCase().includes(lowerSearchTerm) ||
          friend.jobTitle?.toLowerCase().includes(lowerSearchTerm)
        );
      });
      // if empty search, return empty array, if no results found return "none" else return result
      setResults(!searchTerm ? [] : !result.length ? "none" : result);
    }
  };

  const renderItem = useCallback(
    ({ item: search }) => {
      return (
        <TouchableOpacity onPress={() => searchUsers(search.searchQuery)}>
          <View
            style={{
              padding: 10,
              flexDirection: "row",
              marginVertical: 5,
            }}
          >
            <Feather
              name="clock"
              size={16}
              color={themeStyle.colors.grayscale.lowest}
            />
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                marginLeft: 20,
              }}
            >
              {search.searchQuery}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [resultsVisible, showHistory]
  );

  const keyExtractor = useCallback((item, i) => `${item.userId}-${i}`, []);

  const resetSearch = () => {
    Keyboard.dismiss();
    setResults([]);
    setShowHistory(false);
    setSearchInput("");
    if (onReset) {
      onReset();
    }
  };

  return (
    <View>
      <View
        style={
          dataToSearchWithin
            ? styles.localSearchStyles
            : styles.defaultContainerStyles
        }
      >
        {showHistory && !dataToSearchWithin ? (
          <TouchableOpacity onPress={() => resetSearch()}>
            <Ionicons
              style={styles.searchIcon}
              name="arrow-back"
              size={24}
              color={
                searchInput
                  ? themeStyle.colors.grayscale.lowest
                  : themeStyle.colors.grayscale.low
              }
            />
          </TouchableOpacity>
        ) : null}
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
        <TouchableWithoutFeedback onPress={onFocus ? () => onFocus() : null}>
          <TextInput
            onEndEditing={() => onEndEditing && onEndEditing()}
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
            onFocus={
              onFocus
                ? () => {
                    onFocus();
                    setShowHistory(true);
                  }
                : () => setShowHistory(true)
            }
            blurOnSubmit={false}
            onSubmitEditing={
              onSubmitEditing ? () => onSubmitEditing(searchInput) : null
            }
          />
        </TouchableWithoutFeedback>
        {searchInput ? (
          <TouchableOpacity
            onPress={() => {
              onEndEditing();
              setSearchInput("");
              setResults([]);
              // resetSearch();
              // setShowHistory(false);
            }}
          >
            <Ionicons
              style={styles.searchIcon}
              name="close"
              size={20}
              color={themeStyle.colors.grayscale.lowest}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {showHistory &&
      !resultsVisible &&
      !feedIsVisible &&
      !dataToSearchWithin ? (
        <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
          <Text
            style={{ color: themeStyle.colors.grayscale.lowest, margin: 10 }}
          >
            Search History
          </Text>
          <TouchableOpacity
            onPress={async () => {
              if (onClear) {
                onClear();
              }
            }}
          >
            <Text
              style={{ color: themeStyle.colors.grayscale.lowest, margin: 10 }}
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!dataToSearchWithin ? (
        <FlatList
          data={
            showHistory && !resultsVisible && !feedIsVisible
              ? userSearchHistory
              : []
          }
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps={"always"}
        />
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
export default React.memo(UserSearchBar);
