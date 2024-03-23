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
  deleteUserSearchHistoryTable,
} from "../../../helpers/sqlite/userSearchHistory";
import apiCall from "../../../helpers/apiCall";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Ionicons } from "@expo/vector-icons";
import JobSearchModal from "../../../components/JobSearchModal";

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [searchFeed, setSearchFeed] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [hideFeedAndSuggestions, setHideFeedAndSuggestions] = useState(false);
  const [userSearchHistory, setUserSearchHistory] = useState([]);
  const [searchItemsVisible, setSearchItemsVisible] = useState(false);
  const [lastSuccessfulSearchQuery, setLastSuccessfulSearchQuery] =
    useState("");
  const [showJobsModal, setShowJobsModal] = useState(false);

  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  const mobileSpecificListProps =
    Platform.OS !== "web"
      ? {
          renderAheadOffset: 300,
        }
      : {};

  const db = Platform.OS == "web" ? {} : SQLite.openDatabase("localdb");

  const onUserSearch = async (searchQuery) => {
    setLastSuccessfulSearchQuery(searchQuery);
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
      setSearchFeed(
        [...searchFeed, ...response].filter(
          (item) =>
            !!(item.postAuthor.profileGifUrl || item.postAuthor.profileImageUrl) // Move this to the backend where we only return posts for users with completed profiles (with profile gifs)
        )
      );
    }
  };

  const rowRenderer = useCallback((_, item) => {
    //We have only one view type so no checks are needed here
    return <SearchFeedItem post={item} />;
  }, []);

  const thumbnailRenderer = useCallback(
    (_, item, index, extendedState) => {
      return (
        <UserThumbnail
          key={item._id}
          user={item}
          avatarSize={extendedState?.showAllResults ? 70 : 40}
          fontSize={!extendedState?.showAllResults ? 12 : 14}
          showSeparator={true}
          height={extendedState?.showAllResults ? 100 : 80}
        />
      );
    },
    [showAllResults]
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

  const userLayoutProviderAllResults = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 100;
      }
    )
  ).current;

  const onEndReached = async () => {
    const { response } = await apiCall(
      "POST",
      `/user/search/${results.length}`,
      {
        searchTerm: lastSuccessfulSearchQuery,
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
        if (!results.length && !lastSuccessfulSearchQuery) {
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
    <>
      <JobSearchModal setShowModal={setShowJobsModal} visible={showJobsModal} />
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
            onClear={async () => {
              await deleteUserSearchHistoryTable(db);
              setUserSearchHistory([]);
            }}
            setShowAllResults={setShowAllResults}
            showAllResults={showAllResults}
            onReset={() => !results.length && setHideFeedAndSuggestions(false)}
            resultsVisible={!!results.length}
            feedIsVisible={!hideFeedAndSuggestions}
            offset={results.length && showAllResults ? results.length : 0}
          />
          {/* <View
            style={{
              flexDirection: "row",
              margin: 5,
              borderWidth: 0.5,
              borderRadius: 5,
              borderColor: themeStyle.colors.grayscale.lowest,
              justifyContent: "space-between",
              padding: 10,
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                size={30}
                name="briefcase-sharp"
                color={themeStyle.colors.slateGray}
              />
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  marginLeft: 10,
                }}
              >
                Looking for work?
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowJobsModal(true)}>
              <View
                style={{
                  borderWidth: 2,
                  borderColor: themeStyle.colors.grayscale.lowest,
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                  Browse Jobs
                </Text>
              </View>
            </TouchableOpacity>
          </View> */}
          {!hideFeedAndSuggestions &&
          !results.length &&
          searchFeed.length >= 20 ? (
            <View
              style={{
                borderBottomWidth: 2,
                borderBottomColor: themeStyle.colors.grayscale.cardsOuter,
                backgroundColor: themeStyle.colors.grayscale.cards,
                // flexDirection: "row",
                // alignItems: "center",
                // justifyContent: "space-between",
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
              layoutProvider={userLayoutProviderAllResults}
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
          {!hideFeedAndSuggestions && !results.length ? (
            <>
              {searchFeed.length ? (
                <RecyclerListView
                  {...mobileSpecificListProps}
                  style={{
                    minHeight: 1,
                    minWidth: 1,
                  }}
                  dataProvider={dataProvider}
                  layoutProvider={layoutProvider}
                  onEndReached={() => getSearchFeed()}
                  onEndReachedThreshold={0.5}
                  rowRenderer={rowRenderer}
                  scrollViewProps={{
                    removeClippedSubviews: true,
                  }}
                />
              ) : (
                <>
                  {Array.from(Array(10).keys()).map((number) => (
                    <SkeletonPlaceholder
                      backgroundColor={themeStyle.colors.grayscale.low}
                      highlightColor={
                        themeStyle.colors.grayscale.cardContentSkeletonHighlight
                      }
                      key={number}
                    >
                      <SkeletonPlaceholder.Item
                        padding={2}
                        width={"100%"}
                        height={150}
                        display="flex"
                        flexDirection="row"
                      >
                        <SkeletonPlaceholder.Item
                          height={150}
                          width={150}
                          marginRight={0.5}
                        ></SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item
                          flex={1}
                          height={150}
                        ></SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder>
                  ))}
                </>
              )}
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default SearchScreen;
