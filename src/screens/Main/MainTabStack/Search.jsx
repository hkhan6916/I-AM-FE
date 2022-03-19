import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  FlatList,
  Text,
  View,
} from "react-native";
import UserThumbnail from "../../../components/UserThumbnail";
import themeStyle from "../../../theme.style";
import UserSearchBar from "../../../components/UserSearchBar";
import { StatusBar } from "expo-status-bar";
import NewsCard from "../../../components/NewsCard";

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [hideFeedAndSuggestions, setHideFeedAndSuggestions] = useState(false);

  const getNewsFeed = async () => {
    // const { data: response } = await axios({
    //   method: "get",
    //   url: "https://stocknewsapi.com/api/v1/category?section=general&items=20&token=qlxdenwcsdkf5lqac5fx0mtzwmtqgqmpqaxshmc4",
    // });
    // setNewsFeed(response?.data);
    setNewsFeed([
      {
        news_url:
          "https://www.kitco.com/news/2022-03-17/Gold-price-has-a-path-to-2-200-after-Fed-revealed-its-strategy-SSGA-s-Milling-Stanley.html",
        image_url:
          "https://cdn.snapi.dev/images/v1/6/q/three-all-cap-index-sectors-trade-below-economic-book-value-post-3q21-earnings-1155125-1282957.jpg",
        title:
          "Gold price has a path to $2,200 after Fed revealed its strategy - SSGA's Milling-Stanley",
        text: "(Kitco News) - The Federal Reserve has laid out a clear tightening path, and now gold prices are free to push to new highs above $2,000 an ounce as inflation will remain a clear threat to consumers, according to one market strategist.",
        source_name: "Kitco",
        date: "Thu, 17 Mar 2022 13:13:25 -0400",
        topics: ["gold"],
        sentiment: "Neutral",
        type: "Article",
      },
      {
        news_url: "https://www.youtube.com/watch?v=op0Wr7RLvdc",
        image_url:
          "https://cdn.snapi.dev/images/v1/q/k/fed-needs-to-be-more-aggressive-to-bring-down-inflation-says-whartons-jeremy-siegel-1282951.jpg",
        title:
          "Fed needs to be more aggressive to bring down inflation, says Wharton's Jeremy Siegel",
        text: "Jeremy Siegel, Wharton school professor, joins the 'Halftime Report' to discuss his thoughts on the Federal Reserve's decision to raise raises the federal funds rate by a quarter of a percentage point.",
        source_name: "CNBC Television",
        date: "Thu, 17 Mar 2022 13:09:09 -0400",
        topics: [],
        sentiment: "Neutral",
        type: "Video",
      },
      {
        news_url: "https://www.youtube.com/watch?v=HkoytNSFZyc",
        image_url:
          "https://cdn.snapi.dev/images/v1/d/o/what-the-feds-interest-rate-liftoff-means-for-the-economy-yahoo-u-1282956.jpg",
        title:
          "What the Fed's interest rate liftoff means for the economy: Yahoo U",
        text: "Yahoo Finance's Brian Cheung explains how the Federal Reserve raising interest rates affects the U.S. economy on this week's Yahoo U.",
        source_name: "Yahoo Finance",
        date: "Thu, 17 Mar 2022 13:05:28 -0400",
        topics: [],
        sentiment: "Negative",
        type: "Video",
      },
      {
        news_url:
          "https://seekingalpha.com/article/4496194-emerging-markets-can-weather-us-rate-tightening-cycle",
        image_url:
          "https://cdn.snapi.dev/images/v1/h/n/dow-nasdaq-transports-and-russell-2000-have-negative-weekly-charts-1156322-1282935.jpg",
        title: "Emerging Markets Can Weather The U.S. Rate Tightening Cycle",
        text: "Emerging Markets Can Weather The U.S. Rate Tightening Cycle",
        source_name: "Seeking Alpha",
        date: "Thu, 17 Mar 2022 12:58:00 -0400",
        topics: ["paylimitwall"],
        sentiment: "Neutral",
        type: "Article",
      },
      {
        news_url:
          "https://seekingalpha.com/article/4496191-fed-highlights-concerns-over-inflation-as-rate-hiking-cycle-begins",
        image_url:
          "https://cdn.snapi.dev/images/v1/y/q/fedex-and-ups-may-be-signs-of-supply-chain-improvements-1155229-1282936.jpg",
        title:
          "Fed Highlights Concerns Over Inflation As Rate-Hiking Cycle Begins",
        text: "Fed Highlights Concerns Over Inflation As Rate-Hiking Cycle Begins",
        source_name: "Seeking Alpha",
        date: "Thu, 17 Mar 2022 12:55:00 -0400",
        topics: ["paylimitwall"],
        sentiment: "Negative",
        type: "Article",
      },
    ]);
  };

  const renderItem = useCallback(
    ({ item }) => <NewsCard newsBlock={item} />,
    []
  );

  const keyExtractor = useCallback((item, i) => `${item?.title}-${i}`, []);

  useEffect(() => {
    (async () => {
      await getNewsFeed();
    })();
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
          onSubmitEditing={() => setShowAllResults(true)}
          setResults={setResults}
        />
        {!hideFeedAndSuggestions ? (
          <ScrollView style={{ flex: 1 }}>
            <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
              Suggested Users
            </Text>
            <View
              style={{
                marginVertical: 20,
                padding: 20,
                backgroundColor: "aqua",
              }}
            >
              <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                Some user who is public
              </Text>
            </View>
            <View
              style={{
                marginVertical: 20,
                padding: 20,
                backgroundColor: "aqua",
              }}
            >
              <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                Some user who is public
              </Text>
            </View>
            <View
              style={{
                marginVertical: 20,
                padding: 20,
                backgroundColor: "aqua",
              }}
            >
              <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                Some user who is public
              </Text>
            </View>
            <View
              style={{
                marginVertical: 20,
                padding: 20,
                backgroundColor: "aqua",
              }}
            >
              <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                Some user who is public
              </Text>
            </View>
          </ScrollView>
        ) : null}
        <FlatList
          data={results}
          renderItem={({ item: user }) => (
            <UserThumbnail
              key={user._id}
              user={user}
              avatarSize={showAllResults ? 70 : 55}
            />
          )}
          keyExtractor={(item) => item._id}
        />
        {!hideFeedAndSuggestions ? (
          <FlatList
            style={{
              height: "30%",
              padding: 5,
              margin: 5,
            }}
            data={newsFeed}
            keyExtractor={keyExtractor}
            ListHeaderComponent={() => (
              <View>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontSize: 16,
                  }}
                >
                  Latest Business News
                </Text>
              </View>
            )}
            renderItem={renderItem}
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
  userResult: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
export default SearchScreen;
