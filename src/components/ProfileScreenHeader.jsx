import React from "react";
import themeStyle from "../theme.style";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import PreviewVideo from "./PreviewVideo";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PreviewProfileImage from "./PreviewProfileImage";

const ProfileScreenHeader = React.forwardRef(
  ({ children, userData, isVisible, getUserJobHistory, ...props }, ref) => {
    const navigation = useNavigation();
    return (
      <ScrollView ref={ref} {...props}>
        <View>
          {userData?.profileVideoUrl ? (
            <PreviewVideo
              uri={userData?.profileVideoUrl}
              isFullWidth
              previewText={"Tap to play"}
              flipProfileVideo={userData?.flipProfileVideo}
              isVisible={isVisible}
            />
          ) : userData?.profileImageUrl ? (
            <PreviewProfileImage
              url={userData.profileImageUrl}
              headers={userData?.profileImageHeaders}
            />
          ) : (
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <PreviewVideo uri={null} isFullWidth />
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    marginBottom: 20,
                    color: themeStyle.colors.grayscale.lowest,
                    width: 250,
                    textAlign: "center",
                  }}
                >
                  Complete your profile by adding a profile image or video.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("EditUserDetailsScreen")}
                >
                  <View
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      backgroundColor: themeStyle.colors.secondary.default,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: themeStyle.colors.white,
                      }}
                    >
                      Complete profile
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
              <TouchableOpacity onPress={() => navigation.navigate("Contacts")}>
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
            <View>
              {userData?.userJobHistory?.length <= 5 && // incase for whatever reason we have more than 5 userJobHistory records in userData. Don't want to crash the app :D
                userData?.userJobHistory.map((role) => (
                  <Text
                    key={role._id}
                    style={{ color: themeStyle.colors.grayscale.lowest }}
                  >
                    {role.roleName}
                  </Text>
                ))}
            </View>

            {userData?.numberOfJobHistoryRecords > 5 ? (
              <View>
                <TouchableOpacity onPress={() => getUserJobHistory()}>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      textAlign: "center",
                    }}
                  >
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
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
