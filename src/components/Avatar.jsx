import React from "react";
import { View, TouchableHighlight, Text } from "react-native";
import FastImage from "react-native-fast-image";
import themeStyle from "../theme.style";

const Avatar = ({
  navigation,
  userId,
  size,
  avatarUrl,
  preventClicks,
  hasBorder,
  profileGifHeaders,
  initials,
  style,
}) => (
  <View
    style={[
      {
        transform: [{ scaleX: -1 }],
        alignSelf: "flex-start",
        width: size,
        height: size,
        borderRadius: 50,
        overflow: "hidden",
        borderWidth: hasBorder || initials ? 2 : 0,
        borderColor: themeStyle.colors.primary.default,
        backgroundColor: themeStyle.colors.grayscale.higher,
      },
      style && style,
    ]}
  >
    {!preventClicks && !initials ? (
      <TouchableHighlight
        onPress={() => navigation.navigate("UserProfileScreen", { userId })}
        underlayColor={themeStyle.colors.grayscale.high}
      >
        <FastImage
          source={{ uri: avatarUrl, headers: profileGifHeaders || {} }}
          style={{
            borderRadius: 10,
            alignSelf: "center",
            width: size,
            height: size,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </TouchableHighlight>
    ) : (
      <View>
        {initials ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>{initials}</Text>
          </View>
        ) : (
          <FastImage
            source={{ uri: avatarUrl, headers: profileGifHeaders || {} }}
            resizeMode={FastImage.resizeMode.cover}
            style={{
              borderRadius: 10,
              alignSelf: "center",
              width: size,
              height: size,
            }}
          />
        )}
      </View>
    )}
  </View>
);

export default React.memo(Avatar);
