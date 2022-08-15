import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Image,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import { getItemAsync } from "expo-secure-store";
import axios from "axios";
import SearchBar from "./SearchBar";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

const GifModal = ({ setShowModal, selectGif, active }) => {
  const [error, setError] = useState("");
  const [gifs, setGifs] = useState([]);

  const { width: screen } = Dimensions.get("window");
  const screenWidth = Math.min(screen, 900);
  const imageHeight = screenWidth / 2;
  const handleGifSearch = async (searchInput) => {
    let isCancelled = false;
    if (!isCancelled) {
      const tenorApiKey =
        Platform.OS === "web"
          ? localStorage.getItem("tenorApiKey")
          : await getItemAsync("tenorApiKey");
      try {
        const response = await axios({
          method: "POST",
          url: `https://g.tenor.com/v1/search?q=${
            searchInput || ""
          }&key=${tenorApiKey}&limit=20&mediaFilter=basic&contentfilter=high&locale=en_US&ar_range=standard`,
        });
        if (error) {
          setError("");
        }

        setGifs(response.data?.results);
      } catch (err) {
        setError(
          "Unable to retrieve gifs at the moment, please try again later."
        );
        return;
      }
    }
    return {
      cancel() {
        isCancelled = true;
      },
    };
  };

  const rowRenderer = useCallback((_, item) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          margin: 1,
          backgroundColor: themeStyle.colors.grayscale.higher,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            selectGif(item?.media[0].tinygif.url); // TODO: pick a smaller gif here. These take too long to render
            setShowModal(false);
          }}
        >
          <Image
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: screenWidth / Math.round(screenWidth / 200),
              width: "100%",
            }}
            resizeMode="cover"
            source={{
              uri: item.media[0].nanogif.url,
            }}

            // mediaUrl={item.media[0].tinygif.url}
          />
        </TouchableOpacity>
      </View>
    );
  }, []);

  const getWindowWidth = () => {
    // To deal with precision issues on android
    return Math.round(Dimensions.get("window").width * 1000) / 1000 - 6; //Adjustment for margin given to RLV;
  };

  useEffect(() => {
    (async () => {
      await handleGifSearch();
    })();
  }, []);

  let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
  }).cloneWithRows([...gifs]);

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth / Math.round(screenWidth / 200) - 1;
        dim.height = screenWidth / Math.round(screenWidth / 200) - 1;
      }
    )
  ).current;

  return (
    <Modal
      onRequestClose={async () => {
        (await handleGifSearch()).cancel();
        setShowModal(false);
      }}
      visible={active}
    >
      <SafeAreaView
        style={{
          backgroundColor: themeStyle.colors.grayscale.highest,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: themeStyle.colors.grayscale.highest,
            justifyContent: "center",
            maxWidth: 900,
            width: "100%",
          }}
        >
          <View
            style={{
              alignSelf: "flex-start",
              marginHorizontal: 10,
              marginVertical: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={{
                justifyContent: "center",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AntDesign
                name="arrowleft"
                size={24}
                color={themeStyle.colors.grayscale.lowest}
              />
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  fontSize: 16,
                  marginHorizontal: 10,
                }}
              >
                Select GIF
              </Text>
            </TouchableOpacity>
          </View>
          <SearchBar
            placeholder="Search GIFs"
            onTypingEnd={(v) => handleGifSearch(v)}
          />
          {error ? (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: themeStyle.colors.error.default,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            </View>
          ) : (
            <RecyclerListView
              style={{ flex: 1 }}
              dataProvider={dataProvider}
              layoutProvider={layoutProvider}
              rowRenderer={rowRenderer}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default GifModal;
