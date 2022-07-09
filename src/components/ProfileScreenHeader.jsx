import React from "react";
import themeStyle from "../theme.style";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import PreviewVideo from "./PreviewVideo";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ProfileScreenHeader = React.forwardRef(
  ({ children, userData, isVisible, ...props }, ref) => {
    const navigation = useNavigation();

    return (
      <ScrollView ref={ref} {...props}>
        <View>
          <PreviewVideo
            uri={userData?.profileVideoUrl}
            isFullWidth
            previewText={"Tap to play"}
            flipProfileVideo={userData?.flipProfileVideo}
            isVisible={isVisible}
          />
          {userData?.followersMode ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                marginTop: 20,
              }}
            >
              <MaterialIcons
                name="public"
                size={16}
                color={themeStyle.colors.grayscale.lowest}
              />
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: 12,
                  marginLeft: 5,
                }}
              >
                Your account is in followers mode.
              </Text>
            </View>
          ) : null}
          {!!userData?.private && !userData?.followersMode ? (
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                textAlign: "center",
                marginTop: 10,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              <AntDesign
                name="lock"
                size={16}
                color={themeStyle.colors.grayscale.lower}
              />
              Your activity is only visible to contacts
            </Text>
          ) : null}
          <View style={{ padding: 5, marginTop: 20 }}>
            <View
              style={{
                flexDirection: "column",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: themeStyle.colors.grayscale.lowest,
                }}
              >
                {userData?.username}{" "}
              </Text>
              {userData?.jobTitle ? (
                <Text style={{ color: themeStyle.colors.grayscale.lower }}>
                  {userData?.jobTitle}
                </Text>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 20,
              }}
            >
              <Ionicons
                name="people"
                size={24}
                color={themeStyle.colors.grayscale.lower}
              />
              <TouchableOpacity onPress={() => navigation.navigate("Friends")}>
                <Text
                  style={{
                    marginHorizontal: 10,
                    color: themeStyle.colors.primary.default,
                  }}
                >
                  {userData?.numberOfFriends}{" "}
                  {userData?.followersMode ? "followers" : "contacts"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {children}
      </ScrollView>
    );
  }
);

ProfileScreenHeader.displayName = "ProfileScreenHeader";

export default React.memo(
  ProfileScreenHeader,
  (prev, next) =>
    prev.userData === next.userData && prev.isVisible === next.isVisible
);
