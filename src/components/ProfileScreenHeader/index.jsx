import React, { useState } from "react";
import themeStyle from "../../theme.style";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import PreviewVideo from "../PreviewVideo";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PreviewProfileImage from "../PreviewProfileImage";
import JobHistoryDropdown from "./JobHistoryDropdown";
import EducationHistoryDropdown from "./EducationHistoryDropdown";
import AddJobModal from "./AddJobModal";

const ProfileScreenHeader = React.forwardRef(
  (
    {
      children,
      userData,
      isVisible,
      getUserJobHistory,
      getUserEducationHistory,
      ...props
    },
    ref
  ) => {
    const navigation = useNavigation();
    const [showJobHistory, setShowJobHistory] = useState(false);
    const [showEducationHistory, setShowEducationHistory] = useState(false);
    const [showAddJobModal, setShowAddJobModal] = useState(false);
    return (
      <ScrollView ref={ref} {...props}>
        <View>
          <AddJobModal
            visible={showAddJobModal}
            setShowModal={setShowAddJobModal}
          />
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
            <JobHistoryDropdown
              showJobHistory={showJobHistory}
              setShowEducationHistory={setShowEducationHistory}
              setShowJobHistory={setShowJobHistory}
              userJobHistory={userData?.userJobHistory}
              numberOfJobHistoryRecords={userData?.numberOfJobHistoryRecords}
              getUserJobHistory={getUserJobHistory}
            />
            <TouchableOpacity
              style={{
                margin: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: themeStyle.colors.grayscale.lowest,
                borderRadius: 5,
                alignSelf: "center",
                minWidth: 150,
              }}
              onPress={() => {
                setShowAddJobModal(true);
              }}
            >
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  fontWeight: "900",
                }}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={themeStyle.colors.grayscale.lowest}
                  style={{ alignSelf: "center" }}
                />{" "}
                Add Work Role
              </Text>
            </TouchableOpacity>
            <EducationHistoryDropdown
              showEducationHistory={showEducationHistory}
              setShowEducationHistory={setShowEducationHistory}
              setShowJobHistory={setShowJobHistory}
              userEducationHistory={userData?.userEducationHistory}
              numberOfEducationHistoryRecords={
                userData?.numberOfEducationHistoryRecords
              }
              getUserEducationHistory={getUserEducationHistory}
            />
            <TouchableOpacity
              style={{
                margin: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: themeStyle.colors.grayscale.lowest,
                borderRadius: 5,
                alignSelf: "center",
                minWidth: 150,
              }}
              onPress={() => {
                setShowAddJobModal(true);
              }}
            >
              <Text
                style={{
                  color: themeStyle.colors.grayscale.lowest,
                  fontWeight: "900",
                }}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={themeStyle.colors.grayscale.lowest}
                  style={{ alignSelf: "center" }}
                />{" "}
                Add Education
              </Text>
            </TouchableOpacity>
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
