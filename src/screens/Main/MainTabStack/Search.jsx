import React, { Fragment, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  FlatList,
  Image,
  Text,
  View,
} from "react-native";
import UserThumbnail from "../../../components/UserThumbnail";
import themeStyle from "../../../theme.style";
import UserSearchBar from "../../../components/UserSearchBar";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

const SearchScreen = () => {
  const [results, setResults] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [hideNews, setHideNews] = useState(false);

  const getNewsFeed = async () => {
    // const { data: response } = await axios({
    //   method: "get",
    //   url: "https://stocknewsapi.com/api/v1/category?section=general&items=20&token=qlxdenwcsdkf5lqac5fx0mtzwmtqgqmpqaxshmc4",
    // });
    // setNewsFeed(response?.data);
    setNewsFeed([
      {
        news_url:
          "https://techcrunch.com/2022/03/15/startup-banking-service-mercury-jumps-into-debt-lending-to-take-on-silicon-valley-bank/",
        image_url:
          "https://cdn.snapi.dev/images/v1/g/e/gettyimages-1326068857-1279371.jpg",
        title:
          "Startup banking service Mercury jumps into debt lending to take on Silicon Valley Bank",
        text: "Mercury, a well-funded, three-year-old startup that offers a host of banking services to startups, is today rolling out a new offering for its customers: venture debt. The idea is to loan out $200 million this year and up to $1 billion next year in startups that have already raised $2 million in funding from at [\u2026]",
        source_name: "TechCrunch",
        date: "Tue, 15 Mar 2022 17:38:14 -0400",
        topics: [],
        sentiment: "Neutral",
        type: "Article",
      },
      {
        news_url: "https://www.youtube.com/watch?v=6nxIspWljSI",
        image_url:
          "https://cdn.snapi.dev/images/v1/m/q/us-could-get-into-an-inflationary-spiral-unlike-anything-weve-seen-economist-1279376.jpg",
        title:
          "US could get into an inflationary spiral \u2018unlike anything we've seen': Economist",
        text: "Hoover Institution distinguished visiting fellow Kevin Hassett weighs in on inflation and the possibility of a recession. Subscribe to Fox Business!",
        source_name: "Fox Business",
        date: "Tue, 15 Mar 2022 17:30:01 -0400",
        topics: [],
        sentiment: "Negative",
        type: "Video",
      },
      {
        news_url:
          "https://www.forbes.com/sites/jasonbisnoff/2022/03/15/wall-streets-skittish-attitude-toward-putin-pays-off-as-russia-default-looms/",
        image_url:
          "https://cdn.snapi.dev/images/v1/3/p/wall-streets-skittish-attitude-toward-putin-pays-off-as-russia-default-looms-1279338.jpg",
        title:
          "Wall Street's Skittish Attitude Toward Putin Pays Off As Russia Default Looms",
        text: "Despite Citigroup losses of as much as $9.8 billion, the biggest U.S. banks have mostly steered clear of the country already under sanctions for Crimea.",
        source_name: "Forbes",
        date: "Tue, 15 Mar 2022 17:14:16 -0400",
        topics: ["paylimitwall"],
        sentiment: "Negative",
        type: "Article",
      },
      {
        news_url: "https://www.youtube.com/watch?v=ndY4PmSlzl4",
        image_url:
          "https://cdn.snapi.dev/images/v1/p/z/fed-decision-the-dot-plot-should-increase-morgan-stanley-cio-says-1279345.jpg",
        title:
          "Fed decision: \u2018The dot plot should increase,' Morgan Stanley CIO says",
        text: "Cresset Capital CIO Jack Ablin and Michael Kushma, Morgan Stanley Investment Management CIO of Broad Markets Fixed Income, joins Yahoo Finance Live to discuss the Fed's interest rate hikes as commodity prices continue to rise, inflation following the Russia-Ukraine conflict, volatile oil prices, avoiding buying the dip, and recession conditions.",
        source_name: "Yahoo Finance",
        date: "Tue, 15 Mar 2022 17:03:43 -0400",
        topics: [],
        sentiment: "Neutral",
        type: "Video",
      },
      {
        news_url:
          "https://www.marketwatch.com/story/api-data-reportedly-show-a-weekly-climb-in-us-crude-supplies-2022-03-15",
        image_url:
          "https://cdn.snapi.dev/images/v1/p/j/m02d20201008t2i1536705109w940fhfwllplsqrlynxmpeg9714r-1161599-1279320.jpg",
        title: "API data reportedly show a weekly climb in U.S. crude supplies",
        text: "The American Petroleum Institute reported late Tuesday that U.S. crude supplies rose by 3.75 million barrels for the week ended March 11, according to sources. The API also reportedly showed a weekly inventory decline of 3.8 million barrels for gasoline, while distillate stockpiles edged up by 888,000 barrels.",
        source_name: "Market Watch",
        date: "Tue, 15 Mar 2022 16:44:06 -0400",
        topics: ["oil", "paylimitwall"],
        sentiment: "Negative",
        type: "Article",
      },
      {
        news_url: "https://www.youtube.com/watch?v=Mcpv-qhbMvc",
        image_url:
          "https://cdn.snapi.dev/images/v1/t/j/stocks-close-in-the-green-led-by-amazon-tesla-and-microsoft-1279300.jpg",
        title: "Stocks close in the green, led by Amazon, Tesla, and Microsoft",
        text: "Yahoo Finance's Jared Blikre examines the market action heading into the closing bell, as well as taking a look at Nasdaq leaders, sector actions, Hycroft Mining, the travel industry, volatility levels, ARK ETF component stocks, and semiconductors.",
        source_name: "Yahoo Finance",
        date: "Tue, 15 Mar 2022 16:36:41 -0400",
        topics: [],
        sentiment: "Positive",
        type: "Video",
      },
    ]);
  };

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
            setHideNews(true);
          }}
          onEndEditing={() => !results.length && setHideNews(false)}
          onSubmitEditing={() => setShowAllResults(true)}
          setResults={setResults}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          {results.map(
            // TODO: move this to flatlist
            (user) => (
              <UserThumbnail
                key={user._id}
                user={user}
                avatarSize={showAllResults ? 70 : 55}
              />
            )
          )}
        </ScrollView>
        {!hideNews ? (
          <FlatList
            style={{ height: "50%" }}
            data={newsFeed}
            keyExtractor={(item, i) => `${item?.title}-${i}`}
            ListHeaderComponent={() => (
              <View>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontSize: 16,
                  }}
                >
                  Latest News
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={{ alignItems: "center", marginVertical: 5 }}>
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{ width: 100, aspectRatio: 1 / 1 }}
                    source={{ uri: item.image_url }}
                  />
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      marginHorizontal: 20,
                      // height: "100%",
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </Text>
                </View>
              </View>
            )}
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
