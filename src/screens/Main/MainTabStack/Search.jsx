import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import UserThumbnail from "../../../components/UserThumbnail";
import themeStyle from "../../../theme.style";
import SearchBar from "../../../components/SearchBar";

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <SearchBar
        onFocus={() => setShowAllResults(false)}
        onSubmitEditing={() => setShowAllResults(true)}
        setResults={setResults}
      />
      <View>
        {results.map((user) => (
          <UserThumbnail
            key={user._id}
            user={user}
            avatarSize={showAllResults ? 70 : 55}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userResult: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
export default SearchScreen;
