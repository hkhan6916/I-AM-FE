import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  FlatList,
  Keyboard,
  Text,
  View,
  Dimensions,
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
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import FastImage from "react-native-fast-image";
import { useNavigation } from "@react-navigation/native";

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [searchFeed, setSearchFeed] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [hideFeedAndSuggestions, setHideFeedAndSuggestions] = useState(false);
  const [userSearchHistory, setUserSearchHistory] = useState([]);
  const [searchItemsVisible, setSearchItemsVisible] = useState(false);
  const [lastSuccessfullSearchQuery, setLastSuccessfullSearchQuery] =
    useState("");

  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
  const navigation = useNavigation();
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
      setSearchFeed(
        [...searchFeed, ...response].filter(
          (item) => !!item.postAuthor.profileGifUrl === true // Move this to the backend where we only return posts for users with completed profiles (with profile gifs)
        )
      );
      if (!searchItemsVisible && newFeed.length >= 20) {
        setTimeout(() => setSearchItemsVisible(true), 400);
      }
    }
  };

  const rowRenderer = useCallback(
    (type, item, index) => {
      //We have only one view type so not checks are needed here
      return <SearchFeedItem post={item} />;
      // return <FastImage source={{uri:item.mediaUrl}}/>
    },
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

  const thumbnailRenderer = useCallback(
    (_, item, index, extendedState) => {
      return (
        <UserThumbnail
          key={item._id}
          user={item}
          avatarSize={extendedState?.showAllResults ? 70 : 40}
          fontSize={12}
        />
      );
    },
    [searchItemsVisible, showAllResults]
  );

  let dataProvider = new DataProvider((r1, r2) => {
    return r1._id !== r2._id;
  }).cloneWithRows(searchFeed);

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 150;
      }
    )
  ).current;

  let userDataProvider = new DataProvider((r1, r2) => {
    return r1._id !== r2._id;
  }).cloneWithRows(results);

  const userLayoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 80;
      }
    )
  ).current;

  const searchResultsKeyExtractor = useCallback(
    (item, i) => `${item._id}-${i}`,
    []
  );

  const onEndReached = async () => {
    console.log("end reached");
    const { response } = await apiCall(
      "POST",
      `/user/search/${results.length}`,
      {
        searchTerm: lastSuccessfullSearchQuery,
      }
    );
    if (response.length) {
      setResults([...results, ...(response || [])]);
    }
  };

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

    navigation.addListener("focus", async () => {
      await createUserSearchHistoryTable(db);

      await getSearchFeed();

      const history = await getUserSearchHistory(db);
      setUserSearchHistory(history || []);
    });
    navigation.addListener("blur", async () => {
      setSearchFeed([]);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
      navigation.removeListener("focus");
      navigation.removeListener("blur");
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
        <View style={{ flex: 1 }}>
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
            offset={results.length && showAllResults ? results.length : 0}
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
          {results.length && showAllResults ? (
            <RecyclerListView
              style={{ minHeight: 1, minWidth: 1 }}
              dataProvider={userDataProvider}
              layoutProvider={userLayoutProvider}
              rowRenderer={thumbnailRenderer}
              onEndReached={() => onEndReached()}
              onEndReachedThreshold={0.5}
              extendedState={{ showAllResults }}
            />
          ) : results.length ? (
            <RecyclerListView
              style={{ minHeight: 1, minWidth: 1 }}
              dataProvider={userDataProvider}
              layoutProvider={userLayoutProvider}
              rowRenderer={thumbnailRenderer}
              onEndReachedThreshold={0.5}
            />
          ) : null}
          {!hideFeedAndSuggestions &&
          !results.length &&
          searchFeed.length >= 20 &&
          searchItemsVisible ? (
            <RecyclerListView
              style={{
                minHeight: 1,
                minWidth: 1,
              }}
              dataProvider={dataProvider}
              layoutProvider={layoutProvider}
              onEndReached={() => getSearchFeed()}
              onEndReachedThreshold={0.5}
              rowRenderer={rowRenderer}
              renderAheadOffset={300}
              scrollViewProps={{
                removeClippedSubviews: true,
              }}
            />
          ) : null}
        </View>
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
