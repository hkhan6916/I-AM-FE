import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import { getItemAsync } from "expo-secure-store";
import axios from "axios";
import SearchBar from "./SearchBar";
import FastImage from "react-native-fast-image";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";

const GifModal = ({ setShowModal, selectGif, active }) => {
  const [error, setError] = useState("");
  const [gifs, setGifs] = useState([]);

  const { width: screenWidth } = Dimensions.get("window");
  const imageHeight = screenWidth <= 400 ? screenWidth / 2 : screenWidth / 3;
  const handleGifSearch = async (searchInput) => {
    let isCancelled = false;
    if (!isCancelled) {
      const tenorApiKey = await getItemAsync("tenorApiKey");
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
        setError("Unable to retrieve gifs.");
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
          <FastImage
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: imageHeight,
              width: "100%",
            }}
            source={{
              uri: item.media[0].nanogif.url,
              cache: FastImage.cacheControl.web,
            }}

            // mediaUrl={item.media[0].tinygif.url}
          />
        </TouchableOpacity>
      </View>
    );
  }, []);

  useEffect(() => {
    (async () => {
      await FastImage.clearMemoryCache();
      await handleGifSearch();
    })();
  }, []);

  let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
  }).cloneWithRows([...gifs]);

  const layoutProvider = useRef(
    new LayoutProvider(
      () => 1,
      (_, dim) => {
        dim.width = screenWidth / 2;
        dim.height = screenWidth / 2;
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
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: themeStyle.colors.grayscale.highest,
            justifyContent: "center",
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
              style={{ justifyContent: "center", flexDirection: "row" }}
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
            <Text
              style={{
                color: themeStyle.colors.error.default,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
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
