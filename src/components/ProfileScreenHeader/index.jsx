import React, { useState } from "react";
import themeStyle from "../../theme.style";
import { TouchableOpacity, View, Text, ScrollView } from "react-native";
import PreviewVideo from "../PreviewVideo";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PreviewProfileImage from "../PreviewProfileImage";
import JobHistoryDropdown from "../JobHistory/JobHistoryDropdown";
import EducationHistoryDropdown from "../EducationHistory/EducationHistoryDropdown";
import AddJobModal from "../JobHistory/AddJobModal";
import AddEducationModal from "../EducationHistory/AddEducationModal";
import UserBioModal from "../UserBioModal";

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
    const [showAddEducationModal, setShowAddEducationModal] = useState(false);
    const [showAddBioModal, setShowAddBioModal] = useState(false);
    const [bioIsCollapsible, setBioIsCollapsible] = useState(false);
    const [bioCollapsed, setBioCollapsed] = useState(false);

    const onBioTextLayout = (e) => {
      setBioIsCollapsible(e.nativeEvent.lines.length >= 3);
    };

    return (
      <ScrollView ref={ref} {...props}>
        <View>
          {showAddJobModal ? (
            <AddJobModal visible setShowModal={setShowAddJobModal} />
          ) : null}
          {showAddBioModal ? (
            <UserBioModal
              bio={userData?.bio}
              setShowUserBioModal={setShowAddBioModal}
            />
          ) : null}
          {showAddEducationModal ? (
            <AddEducationModal
              visible
              setShowModal={setShowAddEducationModal}
            />
          ) : null}
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
                    fontWeight: "700",
                  }}
                >
                  {userData?.numberOfFriends}{" "}
                  {userData?.followersMode ? "followers" : "contacts"}
                </Text>
              </TouchableOpacity>
            </View>
            {!userData?.bio ? (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity
                  style={{
                    margin: 10,
                    padding: 10,
                    borderRadius: 5,
                    alignSelf: "center",
                    minWidth: 150,
                  }}
                  onPress={() => {
                    setShowAddEducationModal(false);
                    setShowAddJobModal(false);
                    setShowAddBioModal(true);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(140,140,140,0.3)",
                        height: 35,
                        width: 35,
                        borderRadius: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 5,
                      }}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={themeStyle.colors.grayscale.lowest}
                        style={{
                          alignSelf: "center",
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        fontWeight: "900",
                      }}
                    >
                      Add Bio
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginVertical: 10 }}>
                <Text style={{ color: themeStyle.colors.grayscale.low }}>
                  Bio
                </Text>
                <Text
                  onTextLayout={onBioTextLayout}
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                  }}
                  numberOfLines={!bioCollapsed ? 3 : null}
                >
                  {userData?.bio}
                </Text>
                {bioIsCollapsible ? (
                  <TouchableOpacity
                    onPress={() =>
                      !bioCollapsed
                        ? setBioCollapsed(true)
                        : setBioCollapsed(false)
                    }
                  >
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.low,
                        marginBottom: 10,
                        marginTop: 5,
                      }}
                    >
                      {!bioCollapsed ? "Read more" : "Show less"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={{
                    margin: 10,
                    padding: 10,
                    borderRadius: 5,
                    alignSelf: "center",
                    minWidth: 150,
                  }}
                  onPress={() => {
                    setShowAddEducationModal(false);
                    setShowAddJobModal(false);
                    setShowAddBioModal(true);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(140,140,140,0.3)",
                        height: 35,
                        width: 35,
                        borderRadius: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 5,
                      }}
                    >
                      <Feather
                        name="edit-2"
                        size={14}
                        color={themeStyle.colors.grayscale.lowest}
                        style={{
                          alignSelf: "center",
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        color: themeStyle.colors.grayscale.lowest,
                        fontWeight: "900",
                      }}
                    >
                      Edit Bio
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <JobHistoryDropdown
              showJobHistory={showJobHistory}
              setShowEducationHistory={setShowEducationHistory}
              setShowJobHistory={setShowJobHistory}
              userJobHistory={userData?.userJobHistory}
              numberOfJobHistoryRecords={userData?.numberOfJobHistoryRecords}
              getUserJobHistory={getUserJobHistory}
              showEditButton={true}
            />
            <TouchableOpacity
              style={{
                margin: 10,
                padding: 10,
                borderRadius: 5,
                alignSelf: "center",
                minWidth: 150,
              }}
              onPress={() => {
                setShowAddJobModal(true);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(140,140,140,0.3)",
                    height: 35,
                    width: 35,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 5,
                  }}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={themeStyle.colors.grayscale.lowest}
                    style={{
                      alignSelf: "center",
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontWeight: "900",
                  }}
                >
                  Add Job Role
                </Text>
              </View>
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
              setShowAddEducationModal={setShowAddEducationModal}
              showEditButton
            />
            <TouchableOpacity
              style={{
                margin: 10,
                padding: 10,
                alignSelf: "center",
                minWidth: 150,
              }}
              onPress={() => {
                setShowAddEducationModal(true);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(140,140,140,0.3)",
                    height: 35,
                    width: 35,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 5,
                  }}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={themeStyle.colors.grayscale.lowest}
                    style={{
                      alignSelf: "center",
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: themeStyle.colors.grayscale.lowest,
                    fontWeight: "900",
                  }}
                >
                  Add Education
                </Text>
              </View>
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
