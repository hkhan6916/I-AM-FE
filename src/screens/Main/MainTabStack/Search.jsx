import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  FlatList,
  Keyboard,
} from "react-native";
import UserThumbnail from "../../../components/UserThumbnail";
import themeStyle from "../../../theme.style";
import UserSearchBar from "../../../components/UserSearchBar";
import { StatusBar } from "expo-status-bar";
import SearchFeedItem from "../../../components/SearchFeedItem";
import * as SQLite from "expo-sqlite";
import {
  createUserSearchHistoryTable,
  insertUserSearchHistory,
  getUserSearchHistory,
} from "../../../helpers/sqlite/userSearchHistory";
import apiCall from "../../../helpers/apiCall";
const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [searchFeed, setSearchFeed] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [hideFeedAndSuggestions, setHideFeedAndSuggestions] = useState(false);
  const [userSearchHistory, setUserSearchHistory] = useState([]);

  const db = SQLite.openDatabase("localdb");

  const onUserSearch = async (searchQuery) => {
    if (!results.length) {
      return;
    }
    await createUserSearchHistoryTable(db);

    await insertUserSearchHistory({
      db,
      searchQuery,
    });

    const newHistory = await getUserSearchHistory(db);
    setUserSearchHistory(newHistory);

    setShowAllResults(true);
  };

  const getSearchFeed = async () => {
    const { response, success } = await apiCall(
      "GET",
      `/posts/searchfeed/${searchFeed.length}`
    );
    if (success) {
      setSearchFeed([...searchFeed, ...response]);
    }
  };

  const renderSearchFeed = useCallback(
    ({ item }) => <SearchFeedItem post={item} />,
    []
  );

  const renderThumbnail = useCallback(
    ({ item: user }) => (
      <UserThumbnail
        key={user._id}
        user={user}
        avatarSize={showAllResults ? 70 : 40}
        fontSize={12}
      />
    ),
    []
  );

  const searchFeedKeyExtractor = useCallback(
    (item, i) => `${item?.title}-${i}`,
    []
  );
  const searchResultsKeyExtractor = useCallback(
    (item, i) => `${item._id}-${i}`,
    []
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setHideFeedAndSuggestions(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setHideFeedAndSuggestions(false);
      }
    );

    (async () => {
      await createUserSearchHistoryTable(db);

      await getSearchFeed();
      const history = await getUserSearchHistory(db);
      setUserSearchHistory(history || []);
    })();
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
          onFocus={() => {
            setShowAllResults(false);
            setHideFeedAndSuggestions(true);
          }}
          onEndEditing={() =>
            !results.length && setHideFeedAndSuggestions(false)
          }
          onSubmitEditing={(searchQuery) => onUserSearch(searchQuery)}
          setResults={setResults}
          userSearchHistory={userSearchHistory}
          onReset={() => !results.length && setHideFeedAndSuggestions(false)}
          resultsVisible={!!results.length}
          feedIsVisible={!hideFeedAndSuggestions}
        />
        {results.length ? (
          <FlatList
            data={results}
            renderItem={renderThumbnail}
            keyExtractor={searchResultsKeyExtractor}
            keyboardShouldPersistTaps={"always"}
          />
        ) : null}
        {!hideFeedAndSuggestions && !results.length ? (
          <FlatList
            style={{
              height: "100%",
            }}
            data={searchFeed}
            keyExtractor={searchFeedKeyExtractor}
            renderItem={renderSearchFeed}
            numColumns={3}
            contentContainerStyle={{ flexGrow: 1 }}
            onEndReached={() => getSearchFeed()}
            onEndReachedThreshold={0.9}
          />
        ) : null}
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default SearchScreen;
