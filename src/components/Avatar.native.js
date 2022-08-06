import React, { useState } from "react";
import { View, TouchableHighlight, Image, Platform } from "react-native";
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
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
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
      {avatarUrl && !loaded ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            zIndex: 9,
            backgroundColor: themeStyle.colors.grayscale.higher,
          }}
        >
          <Ionicons
            name="person-outline"
            size={36}
            color={themeStyle.colors.grayscale.high}
          />
        </View>
      ) : null}
      {!preventClicks ? (
        <TouchableHighlight
          onPress={() => navigation.navigate("UserProfileScreen", { userId })}
          underlayColor={themeStyle.colors.grayscale.high}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl, headers: profileGifHeaders || {} }}
              style={[
                {
                  borderRadius: 10,
                  alignSelf: "center",
                  width: size,
                  height: size,
                },
                Platform.OS === "web" && { objectFit: "cover" },
              ]}
              resizeMode={"cover"}
              onLoad={() => setLoaded(true)}
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
              resizeMode={"cover"}
              onLoad={() => setLoaded(true)}
              style={[
                {
                  borderRadius: 10,
                  alignSelf: "center",
                  width: size || 50,
                  height: size || 50,
                },
                Platform.OS === "web" && { objectFit: "cover" },
              ]}
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
};

export default React.memo(Avatar);
