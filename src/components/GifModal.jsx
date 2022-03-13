import React, { useCallback, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";

import axios from "axios";

const GifModal = ({ setShowModal, setGif, active }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState([]);

  const handleGifSearch = async (searchInput) => {
    setSearchQuery(searchInput);
    const response = await axios({
      method: "POST",
      url: `https://g.tenor.com/v1/search?q=${searchQuery}&key=0I867H5DB2J8&limit=20&media_filter=minimal`,
    });
    setGifs(response.data.results);
    console.log(response.data.results);
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
        <TouchableOpacity onPress={() => setGif(item?.media[0].gif.url)}>
          <Image
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: 100,
            }}
            source={{ uri: item.media[0].tinygif.url }}
          />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <Modal visible={active}>
      <View
        style={{
          flex: 1,
          backgroundColor: themeStyle.colors.grayscale.highest,
          justifyContent: "center",
        }}
      >
        <View style={{ alignSelf: "flex-end", margin: 20 }}>
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <AntDesign
              name="close"
              size={20}
              color={themeStyle.colors.grayscale.lowest}
            />
          </TouchableOpacity>
        </View>
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
        <TextInput
          placeholder="Search gifs"
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
      </View>
    </Modal>
  );
};

export default React.memo(GifModal);
