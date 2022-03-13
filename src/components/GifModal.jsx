import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Text,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";
import { getItemAsync } from "expo-secure-store";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const GifModal = ({ setShowModal, selectGif, active }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [gifs, setGifs] = useState([]);
  const { width: screenWidth } = Dimensions.get("window");
  const handleGifSearch = async (searchInput) => {
    let isCancelled = false;
    if (!isCancelled) {
      const tenorApiKey = await getItemAsync("tenorApiKey");
      setSearchQuery(searchInput);
      try {
        const response = await axios({
          method: "POST",
          url: `https://g.tenor.com/v1/search?q=${searchQuery}&key=${tenorApiKey}&limit=20&media_filter=minimal&contentfilter=high&locale=en_US&ar_range=standard`,
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

  const renderItem = useCallback(
    ({ item }) => (
      // here we use the standard image as don't want to take up all cache space with gifs
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
            selectGif(item?.media[0].gif.url);
            setShowModal(false);
          }}
        >
          <Image
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: screenWidth / 2,
            }}
            source={{ uri: item.media[0].tinygif.url }}
          />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  useEffect(() => {
    (async () => {
      await handleGifSearch();
    })();
  }, []);

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
                Add a gif
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Search Gifs"
            placeholderTextColor={themeStyle.colors.grayscale.lower}
            style={{
              color: themeStyle.colors.grayscale.lowest,
              backgroundColor: themeStyle.colors.grayscale.higher,
              height: 48,
              paddingVertical: 5,
              paddingHorizontal: 10,
            }}
            onChangeText={(v) => handleGifSearch(v)}
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
            <FlatList
              data={gifs}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={{ flexGrow: 1 }}
              onEndReachedThreshold={0.5}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              numColumns={2}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default GifModal;
