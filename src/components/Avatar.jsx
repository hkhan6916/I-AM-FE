import React from "react";
import { View, TouchableHighlight, Image } from "react-native";
import FastImage from "react-native-fast-image";
import themeStyle from "../theme.style";
import { Ionicons } from "@expo/vector-icons";

const Avatar = ({
  navigation,
  userId,
  size,
  avatarUrl,
  preventClicks,
  hasBorder,
  profileGifHeaders,
  flipProfileVideo,
  style,
}) => (
  <View
    style={[
      {
        transform: [{ scaleX: flipProfileVideo ? -1 : 1 }],
        alignSelf: "flex-start",
        width: size,
        height: size,
        borderRadius: 50,
        overflow: "hidden",
        borderWidth: hasBorder ? 2 : 0,
        borderColor: themeStyle.colors.primary.default,
        backgroundColor: themeStyle.colors.grayscale.higher,
      },
      style && style,
    ]}
  >
    {!preventClicks ? (
      <TouchableHighlight
        onPress={() => navigation.navigate("UserProfileScreen", { userId })}
        underlayColor={themeStyle.colors.grayscale.high}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl, headers: profileGifHeaders || {} }}
            style={{
              borderRadius: 10,
              alignSelf: "center",
              width: size,
              height: size,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="person-outline"
              size={36}
              color={themeStyle.colors.grayscale.high}
            />
          </View>
        )}
      </TouchableHighlight>
    ) : (
      <View>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl, headers: profileGifHeaders || {} }}
            resizeMode={FastImage.resizeMode.cover}
            style={{
              borderRadius: 10,
              alignSelf: "center",
              width: size || 50,
              height: size || 50,
            }}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="person-outline"
              size={36}
              color={themeStyle.colors.grayscale.high}
            />
          </View>
        )}
      </View>
    )}
  </View>
);

export default React.memo(Avatar);
