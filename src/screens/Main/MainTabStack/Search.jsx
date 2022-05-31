import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  FlatList,
  Keyboard,
  Text,
  View,
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
  const [searchItemsVisible, setSearchItemsVisible] = useState(false);
  const [lastSuccessfullSearchQuery, setLastSuccessfullSearchQuery] =
    useState("");

  const db = SQLite.openDatabase("localdb");

  const onUserSearch = async (searchQuery) => {
    setLastSuccessfullSearchQuery(searchQuery);
    if (!results.length) {
      return;
    }

    await createUserSearchHistoryTable(db);

    await insertUserSearchHistory({
      db,
      searchQuery,
    });
    Keyboard.dismiss();
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
      const newFeed = [...searchFeed, ...response];
      setSearchFeed([...searchFeed, ...response]);
      if (!searchItemsVisible && newFeed.length >= 20) {
        setTimeout(() => setSearchItemsVisible(true), 400);
      }
    }
  };

  const renderSearchFeed = useCallback(
    ({ item }) => <SearchFeedItem visible={searchItemsVisible} post={item} />,
    [searchItemsVisible]
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
    [showAllResults]
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
        if (!results.length && !lastSuccessfullSearchQuery) {
          setHideFeedAndSuggestions(false);
        }
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
          onSubmitEditing={(searchQuery) => onUserSearch(searchQuery)}
          setResults={setResults}
          userSearchHistory={userSearchHistory}
          setShowAllResults={setShowAllResults}
          showAllResults={showAllResults}
          onReset={() => !results.length && setHideFeedAndSuggestions(false)}
          resultsVisible={!!results.length}
          feedIsVisible={!hideFeedAndSuggestions}
        />
        {!hideFeedAndSuggestions &&
        !results.length &&
        searchFeed.length >= 20 ? (
          <View
            style={{
              borderBottomWidth: 2,
              borderBottomColor: themeStyle.colors.grayscale.cardsOuter,
              backgroundColor: themeStyle.colors.grayscale.cards,
            }}
          >
            <Text
              style={{
                color: themeStyle.colors.primary.default,
                fontSize: 20,
                marginHorizontal: 5,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Explore
            </Text>
          </View>
        ) : null}
        {results.length ? (
          <FlatList
            data={results}
            renderItem={renderThumbnail}
            keyExtractor={searchResultsKeyExtractor}
            keyboardShouldPersistTaps={"always"}
          />
        ) : null}
        {!hideFeedAndSuggestions &&
        !results.length &&
        searchFeed.length >= 20 ? ( // this is so the feed can fill the whole screen else display nothing.
          <FlatList
            style={{
              height: "100%",
            }}
            data={searchFeed}
            keyExtractor={searchFeedKeyExtractor}
            renderItem={renderSearchFeed}
            // numColumns={3}
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
