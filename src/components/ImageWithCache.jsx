import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import FastImage from "react-native-fast-image";
import { AntDesign } from "@expo/vector-icons";
import themeStyle from "../theme.style";

const ImageWithCache = ({
  resizeMode,
  aspectRatio,
  mediaUrl,
  mediaIsSelfie,
  mediaHeaders,
  isFullScreen,
  toggleFullScreen,
  removeBorderRadius,
  hideSpinner = false,
  onLoad,
  onError,
  removeBackround,
  style,
  background,
}) => {
  const { width: screenWidth } = Dimensions.get("window");
  const [ready, setReady] = useState(false);

  if (isFullScreen) {
    return (
      <Modal
        presentationStyle="pageSheet"
        onRequestClose={() => isFullScreen && toggleFullScreen()}
      >
        <View
          style={{
            backgroundColor: themeStyle.colors.grayscale.highest,
            flex: 1,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 10,
            }}
          >
            <TouchableOpacity onPress={() => toggleFullScreen(false)}>
              <AntDesign
                name="close"
                size={24}
                color={themeStyle.colors.white}
                style={{
                  color: themeStyle.colors.white,
                  textShadowOffset: {
                    width: 1,
                    height: 1,
                  },
                  textShadowRadius: 8,
                  textShadowColor: themeStyle.colors.black,
                }}
              />
            </TouchableOpacity>
          </View>
          <FastImage
            onError={() => {
              if (onError) {
                onError();
              }
            }}
            resizeMode={FastImage.resizeMode.contain}
            source={{ uri: mediaUrl, headers: mediaHeaders || {} }}
            style={{
              borderRadius: removeBorderRadius ? 0 : 10,
              width: "100%",
              height: "100%",
            }}
          />
        </View>
      </Modal>
    );
  }

  return (
    <View
      style={[
        {
          transform: [{ scaleX: mediaIsSelfie ? -1 : 1 }],
        },
      ]}
    >
      <View
        style={{
          backgroundColor:
            !removeBackround && !background
              ? themeStyle.colors.grayscale.higher
              : background,
        }}
      >
        {/* {!ready && !hideSpinner ? (
          <View
            style={{
              position: "absolute",
              zIndex: 1,
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator
              animating
              size={"large"}
              color={themeStyle.colors.primary.default}
            />
          </View>
        ) : null} */}
        <FastImage
          fallback
          onError={() => {
            if (onError) {
              onError();
            }
          }}
          onLoad={(e) => {
            if (onLoad) {
              onLoad(e);
            }
            setReady(true);
          }}
          resizeMode={
            resizeMode === "cover"
              ? FastImage.resizeMode.cover
              : FastImage.resizeMode.contain
          }
          source={{
            uri: mediaUrl,
            headers: mediaHeaders || {},
          }}
          style={[
            {
              borderRadius: removeBorderRadius ? 0 : 10,
              height: "100%",
            },
            aspectRatio ? { aspectRatio: aspectRatio } : { width: screenWidth },
            style && style,
          ]}
        />
      </View>
    </View>
  );
};

export default React.memo(ImageWithCache);
