import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../helpers/apiCall";
import PostCard from "../../../components/PostCard";
import themeStyle from "../../../theme.style";
import ProfileScreenHeader from "../../../components/ProfileScreenHeader/index";
import { useScrollToTop } from "@react-navigation/native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import PostOptionsModal from "../../../components/PostOptionsModal";
import { useSelector } from "react-redux";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import getWebPersistedUserData from "../../../helpers/getWebPersistedData";
import JobHistoryItem from "../../../components/JobHistory/JobHistoryItem";
import EducationHistoryItem from "../../../components/EducationHistory/EducationHistoryItem";
import ContentLoader, { Rect } from "react-content-loader/native";
import AddJobModal from "../../../components/JobHistory/AddJobModal";

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [userJobHistory, setUserJobHistory] = useState(null);
  const [userEducationHistory, setUserEducationHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [error, setError] = useState("");
  const [profileVideoVisible, setProfileVideoVisible] = useState(false);
  const [showJobHistoryModal, setShowJobHistoryModal] = useState(false);
  const [showEducationHistoryModal, setShowEducationHistoryModal] =
    useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const nativeGobalUserData = useSelector((state) => state.userData);

  const globalUserData =
    Platform.OS === "web"
      ? { state: getWebPersistedUserData() }
      : nativeGobalUserData;

  const navigation = useNavigation();

  const listRef = useRef(null);

  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  const mobileSpecificListProps =
    Platform.OS !== "web"
      ? {
          renderAheadOffset: screenHeight,
        }
      : {};

  useScrollToTop(
    useRef({
      scrollToTop: () => {
        listRef.current?.scrollToOffset({ offset: 2000 });
      },
    })
  );

  useScrollToTop(listRef);
  const ViewTypes = {
    HEADER: 0,
    STANDARD: 1,
  };
  const getUserPosts = async () => {
    if (!allPostsLoaded) {
      const { success, response } = await apiCall(
        "GET",
        `/user/posts/${userPosts.length}`
      );

      if (success) {
        if (!response.length && userPosts.length) {
          setAllPostsLoaded(true);
        } else {
          setUserPosts([...userPosts, ...response]);
        }
      } else if (userPosts.length) {
        setAllPostsLoaded(true);
      }
    }
  };

  const handleNavigation = (post) => {
    navigation.navigate("MediaScreen", { post });
  };

  const rowRenderer = useCallback((type, item, index, extendedState) => {
    //We have only one view type so not checks are needed here

    if (type === ViewTypes.HEADER) {
      return (
        <ProfileScreenHeader
          userData={extendedState.userData}
          navigation={navigation}
          isVisible={extendedState.profileVideoVisible}
          getUserJobHistory={getFullUserJobHistory}
          getUserEducationHistory={getFullUserEducationHistory}
        />
      );
    }
    if (!item.deleted) {
      return (
        <PostCard
          post={item}
          setShowPostOptions={triggerOptionsModal}
          screenHeight={screenHeight}
          screenWidth={screenWidth}
          handleNavigation={handleNavigation}
          isVisible={false}
          disableVideo
        />
      );
    }
  }, []);

  let dataProvider = new DataProvider(
    (r1, r2) => {
      return r1._id !== r2._id;
    }
    // (index) => `${userPosts[index]?._id}`
  ).cloneWithRows([{}, ...userPosts]);

  const layoutProvider = useRef(
    new LayoutProvider(
      // (index) => index,
      (index) => {
        if (index === 0) {
          return ViewTypes.HEADER;
        } else {
          return ViewTypes.STANDARD;
        }
      },
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 600;
      }
    )
  ).current;

  const userHistoryRowRenderer = (_, item) =>
    showJobHistoryModal ? (
      <JobHistoryItem
        setJobToEdit={setJobToEdit}
        setShowJobHistoryModal={setShowJobHistoryModal}
        jobRole={item}
        showEditButton={true}
      />
    ) : (
      <EducationHistoryItem education={item} />
    );

  let userHistoryDataProvider = new DataProvider(
    (r1, r2) => {
      return r1._id !== r2._id;
    }
    // (index) => `${userPosts[index]?._id}`
  ).cloneWithRows(
    (showJobHistoryModal ? userJobHistory : userEducationHistory) || []
  );

  const userHistorylayoutProvider = useRef(
    new LayoutProvider(
      () => 0,
      (_, dim) => {
        dim.width = screenWidth;
        dim.height = 200;
      }
    )
  ).current;

  const getUserData = async () => {
    setLoading(true);
    const { success, response } = await apiCall("GET", `/user/data`);
    if (success) {
      setUserData(response);
    }
    setLoading(false);
  };

  const getFullUserJobHistory = async () => {
    setLoadingHistory(true);
    setShowJobHistoryModal(true);
    // if (!userJobHistory) {
    const { success, response } = await apiCall(
      "POST",
      `/user/job-history/fetch/all`
    );
    if (success) {
      setUserJobHistory(response);
    }
    // }
    setLoadingHistory(false);
  };

  const getFullUserEducationHistory = async () => {
    setLoadingHistory(true);
    setShowEducationHistoryModal(true);
    // if (!userEducationHistory) {
    const { success, response } = await apiCall(
      "POST",
      `/user/education-history/fetch/all`
    );
    if (success) {
      setUserEducationHistory(response);
    }
    // }
    setLoadingHistory(false);
  };

  const reportPost = async (reasonIndex) => {
    setLoading(true);
    const { success } = await apiCall("POST", "/posts/report", {
      postId: showPostOptions?._id,
      reason: reasonIndex,
    });
    setLoading(false);
    if (!success) {
      setError("An error occurred.");
    } else {
      setShowPostOptions(null);
    }
  };

  const editPost = () => {
    setShowPostOptions(null);
    navigation.navigate("EditPostScreen", { postId: showPostOptions?._id });
  };

  const deletePost = async () => {
    const { success } = await apiCall(
      "DELETE",
      `/posts/remove/${showPostOptions?._id}`
    );
    if (success) {
      const newPosts = userPosts.map((post) => {
        if (post._id === showPostOptions?._id) {
          return {
            ...post,
            deleted: true,
            customKey: `${post._id}-deleted}`,
          };
        }
        return post;
      });
      setUserPosts(newPosts);
      setShowPostOptions(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setAllPostsLoaded(false);
    setUserJobHistory(null);
    const { success, response } = await apiCall("GET", "/user/posts/0");
    if (success) {
      setUserPosts([]);
      setUserPosts([...response]);
    }
    await getUserData();
    setRefreshing(false);
  };

  const triggerOptionsModal = (post) => {
    setError("");
    setShowPostOptions(post);
  };

  useEffect(() => {
    (async () => {
      navigation.addListener("focus", async () => {
        // await getUserPosts();
        await getUserData();
      });
    })();
    return () => {
      navigation.removeListener("focus");
      setUserPosts([]);
    };
  }, []);

  useEffect(() => {
    if (globalUserData.state && Object.keys(userData).length === 0) {
      setUserData(globalUserData.state);
    }
  }, [globalUserData?.state]);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderBottomWidth: 1,
        }}
      >
        {jobToEdit ? (
          <AddJobModal
            visible
            setShowModal={setJobToEdit}
            jobToEdit={jobToEdit}
            onRequestClose={() => {}}
          />
        ) : null}
        <Modal
          visible={showJobHistoryModal || showEducationHistoryModal}
          onRequestClose={() => {
            setShowJobHistoryModal(false);
            setShowEducationHistoryModal(false);
          }}
        >
          <SafeAreaView
            style={{
              backgroundColor: themeStyle.colors.grayscale.highest,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: themeStyle.colors.grayscale.highest,
                justifyContent: "center",
                maxWidth: 900,
                width: "100%",
                padding: 15,
              }}
            >
              {loadingHistory ? (
                <View
                  style={{
                    backgroundColor: themeStyle.colors.grayscale.cards,
                    marginVertical: 2,
                    justifyContent: "flex-start",
                    flex: 1,
                  }}
                >
                  {[...Array(6)].map((_, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: themeStyle.colors.grayscale.cards,
                        marginVertical: 2,
                      }}
                    >
                      <ContentLoader
                        backgroundColor={themeStyle.colors.grayscale.higher}
                        foregroundColor={themeStyle.colors.grayscale.high}
                        viewBox={`0 0 ${screenWidth} ${120}`}
                        width={screenWidth}
                        height={120}
                      >
                        <Rect x="15" y="18" r="25" width="34" height="34" />
                        <Rect
                          x="70"
                          y="18"
                          rx="2"
                          ry="2"
                          width={`${screenWidth / 1.6}`}
                          height="10"
                        />
                        <Rect
                          x="70"
                          y="34"
                          rx="2"
                          ry="2"
                          width={`${screenWidth / 1.6}`}
                          height="10"
                        />
                        <Rect
                          x="70"
                          y="50"
                          rx="2"
                          ry="2"
                          width={`${screenWidth / 1.6}`}
                          height="10"
                        />
                        <Rect
                          x="70"
                          y="66"
                          rx="2"
                          ry="2"
                          width={`${screenWidth / 1.6}`}
                          height="10"
                        />
                        <Rect
                          x="70"
                          y="82"
                          rx="2"
                          ry="2"
                          width={`${screenWidth / 1.6}`}
                          height="10"
                        />
                        <Rect
                          x="70"
                          y="98"
                          rx="2"
                          ry="2"
                          width={`${screenWidth / 3}`}
                          height="10"
                        />
                      </ContentLoader>
                    </View>
                  ))}
                </View>
              ) : userJobHistory?.length || userEducationHistory?.length ? (
                <>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      marginVertical: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setShowJobHistoryModal(false);
                        setShowEducationHistoryModal(false);
                      }}
                      style={{
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign
                        name="arrowleft"
                        size={24}
                        color={themeStyle.colors.grayscale.lowest}
                      />
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.lowest,
                          fontSize: 16,
                          marginHorizontal: 10,
                        }}
                      >
                        {showJobHistoryModal
                          ? "Work history"
                          : "Education history"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <RecyclerListView
                      style={{ flex: 1 }}
                      dataProvider={userHistoryDataProvider}
                      layoutProvider={userHistorylayoutProvider}
                      rowRenderer={userHistoryRowRenderer}
                      forceNonDeterministicRendering
                    />
                  </View>
                </>
              ) : null}
            </View>
          </SafeAreaView>
        </Modal>
        <Text
          style={{ fontSize: 20, color: themeStyle.colors.grayscale.lowest }}
          numberOfLines={1}
        >
          {userData?.username || ""}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={themeStyle.colors.grayscale.lowest}
          />
        </TouchableOpacity>
      </View>
      {!userData?.verified &&
      (userData?.profileVideoUrl || userData?.profileImageUrl) ? (
        <View
          style={{
            backgroundColor: "rgba(19, 130, 148, 0.2)",
            padding: 10,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: themeStyle.colors.grayscale.lowest,
            }}
          >
            Your account is not verified yet.{" "}
            <Text
              style={{
                color: themeStyle.colors.secondary.default,
                fontWeight: "700",
              }}
              onPress={() => navigation.navigate("EmailVerificationScreen")}
            >
              Verify
            </Text>
          </Text>
        </View>
      ) : null}
      {userData ? (
        <RecyclerListView
          {...mobileSpecificListProps}
          ref={listRef}
          style={{ minHeight: 1, minWidth: 1 }}
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          onEndReached={() => getUserPosts()}
          onEndReachedThreshold={0.5}
          rowRenderer={rowRenderer}
          extendedState={{ userData, profileVideoVisible }}
          forceNonDeterministicRendering
          onVisibleIndicesChanged={(i) => {
            // TODO: test on old device to see if preview video rerenders cause crashes
            if (i?.[0] === 0 && !profileVideoVisible) {
              setProfileVideoVisible(true);
            } else if (profileVideoVisible) {
              setProfileVideoVisible(false);
            }
          }}
          scrollViewProps={{
            contentContainerStyle: {
              maxWidth: 900,
              alignSelf: "center",
            },
            removeClippedSubviews: true,
            refreshControl: (
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
            ),
            // decelerationRate: 0.9,
          }}

          // ListHeaderComponent={renderHeaderComponent}
        />
      ) : null}

      <PostOptionsModal
        showOptions={!!showPostOptions}
        setShowPostOptions={setShowPostOptions}
        reportPost={reportPost}
        deletePost={deletePost}
        editPost={editPost}
        belongsToUser={true}
        error={error}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeStyle.colors.grayscale.cardsOuter,
  },
});
export default ProfileScreen;
