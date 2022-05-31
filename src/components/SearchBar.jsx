import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import themeStyle from "../theme.style";

const SearchBar = ({ onTypingEnd, onFocus, onSubmitEditing, placeholder }) => {
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
        if (onTypingEnd) {
          onTypingEnd(searchTerm);
        }
      }, 250),
    });
  };

  return (
    <View style={styles.defaultContainerStyles}>
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
        placeholder={placeholder || "Type here..."}
        onChangeText={(v) => searchUsers(v)}
        returnKeyType="search"
        onFocus={onFocus ? () => onFocus() : null}
        onSubmitEditing={onSubmitEditing ? () => onSubmitEditing() : null}
      />
      <View>
        <TouchableOpacity
          onPress={() => {
            onTypingEnd("");
            setSearchInput("");
          }}
          style={{
            paddingHorizontal: 10,
            zIndex: 10,
          }}
        >
          <Ionicons
            style={{ opacity: searchInput ? 1 : 0 }}
            name="close"
            size={20}
            color={themeStyle.colors.grayscale.lowest}
          />
        </TouchableOpacity>
      </View>
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
  searchIcon: {
    padding: 10,
  },
});
export default React.memo(SearchBar);
