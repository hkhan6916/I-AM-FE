import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Button,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import apiCall from "../../../helpers/apiCall";
import { useDispatch } from "react-redux";
import RepostCard from "../../../components/RepostCard";
import themeStyle from "../../../theme.style";

const ShareScreen = (props) => {
  const { prevScreen, post } = props.route.params;

  const [repostBody, setRepostBody] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleRepost = async () => {
    const { success } = await apiCall("POST", `/posts/repost/${post._id}`, {
      body: repostBody,
    });

    if (success) {
      if (prevScreen === "Home") {
        dispatch({
          type: "SET_POST_CREATED",
          payload: { posted: true, type: "shared" },
        });
      }
      navigation.navigate(prevScreen);
    }
  };
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <TextInput
        style={{
          minHeight: 100,
          textAlignVertical: "top",
          margin: 20,
          fontSize: 16,
          color: themeStyle.colors.grayscale.lowest,
        }}
        value={repostBody || ""}
        placeholder="Write your thoughts here"
        multiline
        maxLength={1000}
        onChangeText={(v) => setRepostBody(v)}
        placeholderTextColor={themeStyle.colors.grayscale.lower}
      />
      <RepostCard postContent={post} isPreview={true} />
      <View
        style={{
          width: "100%",
          padding: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => handleRepost()}
          style={{
            backgroundColor: themeStyle.colors.primary.default,
            borderRadius: 5,
            padding: 10,
          }}
        >
          <Text
            style={{
              color: themeStyle.colors.white,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ShareScreen;
