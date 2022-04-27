import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ImageWithCache from "./ImageWithCache";
import themeStyle from "../theme.style";
import ExpoVideoPlayer from "./ExpoVideoPlayer";

const MessageBox = ({ belongsToSender, message, mediaSize, cancelUpload }) => {
  const {
    body,
    mediaUrl,
    mediaHeaders,
    stringTime,
    mediaType,
    thumbnailUrl,
    thumbnailHeaders,
    ready,
  } = message;
  const [mediaFullScreen, setMediaFullScreen] = useState(false);

  return (
    <View style={styles.container}>
      {mediaType === "video" ? ( // render video in fullcsreen, for image this is handled inside imagewithcache component.
        <Modal
          presentationStyle="pageSheet"
          onRequestClose={() => setMediaFullScreen(false)}
          visible={mediaFullScreen}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: themeStyle.colors.black,
            }}
          >
            <ExpoVideoPlayer uri={mediaUrl} />
          </View>
        </Modal>
      ) : null}
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
          {!ready ? (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity onPress={() => cancelUpload(message?._id)}>
                <Text
                  style={{
                    color: themeStyle.colors.error.default,
                    fontWeight: "700",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  textAlign: "right",
                  color: themeStyle.colors.white,
                  alignSelf: belongsToSender ? "flex-end" : "flex-start",
                  marginBottom: 5,
                }}
              >
                Sending...
              </Text>
            </View>
          ) : (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                textAlign: "right",
                color: themeStyle.colors.white,
                alignSelf: belongsToSender ? "flex-end" : "flex-start",
              }}
            >
              {stringTime}
            </Text>
          )}
          {mediaUrl && mediaType === "image" ? (
            <TouchableOpacity onPress={() => setMediaFullScreen(true)}>
              <ImageWithCache
                removeBorderRadius
                resizeMode="cover"
                mediaUrl={mediaUrl}
                mediaHeaders={mediaHeaders}
                aspectRatio={1 / 1}
                toggleFullScreen={setMediaFullScreen}
                isFullScreen={mediaFullScreen}
                style={{
                  width: mediaSize || 200,
                  height: mediaSize || 200,
                }}
              />
            </TouchableOpacity>
          ) : thumbnailUrl && mediaType === "video" ? (
            <TouchableOpacity onPress={() => setMediaFullScreen(true)}>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <ImageWithCache
                  removeBorderRadius
                  resizeMode="cover"
                  mediaUrl={thumbnailUrl}
                  mediaHeaders={thumbnailHeaders || {}}
                  style={{
                    width: mediaSize || 200,
                    height: mediaSize || 200,
                  }}
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
