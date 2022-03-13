import React, { Fragment, useState } from "react";
import { StyleSheet, SafeAreaView, ScrollView, Platform } from "react-native";
import UserThumbnail from "../../../components/UserThumbnail";
import themeStyle from "../../../theme.style";
import UserSearchBar from "../../../components/UserSearchBar";
import { StatusBar } from "expo-status-bar";

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  return (
    <Fragment>
      <SafeAreaView
        style={{
          flex: 0,
          backgroundColor: themeStyle.colors.grayscale.highest,
        }}
      />
      {Platform.OS === "ios" ? <StatusBar translucent={true} /> : null}
      <SafeAreaView style={styles.container}>
        <UserSearchBar
          onFocus={() => setShowAllResults(false)}
          onSubmitEditing={() => setShowAllResults(true)}
          setResults={setResults}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          {results.map((user) => (
            <UserThumbnail
              key={user._id}
              user={user}
              avatarSize={showAllResults ? 70 : 55}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </Fragment>
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
