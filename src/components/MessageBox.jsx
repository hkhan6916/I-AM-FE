import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ImageWithCache from "./ImageWithCache";
import themeStyle from "../theme.style";

const MessageBox = ({ belongsToSender, message }) => {
  const { body, mediaUrl, mediaHeaders, stringTime, mediaType } = message;
  const [imageFullScreen, setImageFullScreen] = useState(false);

  const videoRef = useRef(null);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.subContainer,
          { alignItems: belongsToSender ? "flex-end" : "flex-start" },
        ]}
      >
        <View
          style={[
            styles.message,
            belongsToSender
              ? {
                  marginLeft: 50,
                  backgroundColor: themeStyle.colors.primary.default,
                }
              : {
                  marginRight: 50,
                  backgroundColor: themeStyle.colors.secondary.default,
                },
          ]}
        >
          {mediaUrl && mediaType === "image" ? (
            <TouchableOpacity onPress={() => setImageFullScreen(true)}>
              <ImageWithCache
                resizeMode="cover"
                mediaUrl={mediaUrl}
                mediaHeaders={mediaHeaders}
                aspectRatio={1 / 1}
                toggleFullScreen={setImageFullScreen}
                isFullScreen={imageFullScreen}
              />
            </TouchableOpacity>
          ) : mediaUrl && mediaType === "video" ? (
            <TouchableOpacity
              onPress={() => videoRef.current.presentFullscreenPlayer()}
            >
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Video
                  ref={videoRef}
                  style={{
                    display: "none",
                  }}
                  source={{
                    uri: mediaUrl,
                    headers: mediaHeaders,
                  }}
                  useNativeControls={false}
                  resizeMode="cover"
                />
                <ImageWithCache
                  resizeMode="cover"
                  mediaUrl={mediaUrl}
                  mediaHeaders={mediaHeaders}
                  aspectRatio={1 / 1}
                  style={{ width: "80%" }}
                />
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: themeStyle.colors.secondary.light,
                    borderRadius: 100,
                  }}
                >
                  <MaterialCommunityIcons
                    name="play"
                    size={60}
                    color={themeStyle.colors.grayscale.lowest}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : null}
          {body ? (
            <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
              {body}
            </Text>
          ) : null}
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              textAlign: "right",
              color: themeStyle.colors.grayscale.lowest,
              alignSelf: belongsToSender ? "flex-end" : "flex-start",
              marginVertical: 5,
            }}
          >
            {stringTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  senderName: {
    color: themeStyle.colors.grayscale.lowest,
    fontWeight: "700",
    marginRight: 10,
  },
  message: {
    borderRadius: 10,
    padding: 5,
    // margin: 20,
  },
  subContainer: {
    marginHorizontal: 10,
    flex: 1,
  },
});

export default MessageBox;
