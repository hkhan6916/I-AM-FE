import React, { useState } from "react";
import themeStyle from "../theme.style";
import { TouchableOpacity, View, Text } from "react-native";
import PreviewVideo from "./PreviewVideo";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import apiCall from "../helpers/apiCall";
import { useNavigation } from "@react-navigation/native";

const ProfileScreenHeader = ({ userData }) => {
  const [isPrivate, setIsPrivate] = useState(!!userData.private);

  const navigation = useNavigation();

  const changeUserVisibility = async () => {
    setIsPrivate(!isPrivate);
    const { success } = await apiCall("GET", "/user/visibility/change");
    if (!success) {
      setIsPrivate(!isPrivate);
    }
  };

  return (
    <View>
      <PreviewVideo
        uri={userData.profileVideoUrl}
        isFullWidth
        previewText={"Tap to play"}
      />
      {!userData.followersMode ? (
        <TouchableOpacity onPress={() => changeUserVisibility()}>
          <View
            style={{
              borderColor: themeStyle.colors.primary.default,
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              marginVertical: 10,
              marginHorizontal: 5,
            }}
          >
            <Text
              style={{
                color: themeStyle.colors.grayscale.lowest,
                textAlign: "center",
                fontWeight: "700",
              }}
            >
              {isPrivate ? "Private" : "Public"}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
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
      )}
      {isPrivate && !userData.followersMode ? (
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
            name={isPrivate ? "lock" : "unlock"}
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
            {userData.username}{" "}
          </Text>
          {userData.jobTitle ? (
            <Text style={{ color: themeStyle.colors.grayscale.lower }}>
              {userData.jobTitle}
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
              {userData.numberOfFriends}{" "}
              {userData.followersMode ? "followers" : "contacts"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default React.memo(
  ProfileScreenHeader,
  (prev, next) => prev.userData === next.userData
);
