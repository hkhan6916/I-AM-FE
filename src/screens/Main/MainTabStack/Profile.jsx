import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import apiCall from "../../../helpers/apiCall";
import PostCard from "../../../components/PostCard";
import themeStyle from "../../../theme.style";
import ProfileScreenHeader from "../../../components/ProfileScreenHeader";
import { useScrollToTop } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PostOptionsModal from "../../../components/PostOptionsModal";
import { useSelector } from "react-redux";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview";
import FastImage from "react-native-fast-image";

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [error, setError] = useState("");
  const [isFocussed, setIsFocussed] = useState(true);
  const [preventCleanup, setPreventCleanup] = useState(true);
  const globalUserData = useSelector((state) => state.userData);

  const navigation = useNavigation();

  const flatlistRef = useRef(null);

  const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

  useScrollToTop(flatlistRef);
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
    setPreventCleanup(true);
    navigation.navigate("MediaScreen", { post });
  };

  const rowRenderer = useCallback((type, item, index, extendedState) => {
    //We have only one view type so not checks are needed here
    if (type === ViewTypes.HEADER) {
      return (
        <ProfileScreenHeader
          userData={extendedState.userData}
          navigation={navigation}
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
          unmount={!isFocussed}
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

  const getUserData = async () => {
    setLoading(true);
    const { success, response } = await apiCall("GET", `/user/data`);

    if (success) {
      setUserData(response);
    }
    setLoading(false);
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
        await getUserPosts();
        await getUserData();
        setPreventCleanup(false);
      });
      navigation.addListener("blur", async () => {
        if (!preventCleanup) {
          setIsFocussed(false);
        }
      });
    })();
    return () => {
      navigation.removeListener("focus");
      navigation.removeListener("blur");
      setUserPosts([]);
    };
  }, []);

  useEffect(() => {
    if (globalUserData.state) {
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
        <Text
          style={{ fontSize: 20, color: themeStyle.colors.grayscale.lowest }}
          numberOfLines={1}
        >
          {userData.username}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
          <MaterialCommunityIcons
            name="cog-outline"
            size={24}
            color={themeStyle.colors.grayscale.lowest}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {userData ? (
          <RecyclerListView
            style={{ minHeight: 1, minWidth: 1 }}
            dataProvider={dataProvider}
            layoutProvider={layoutProvider}
            onEndReached={() => getUserPosts()}
            onEndReachedThreshold={0.5}
            rowRenderer={rowRenderer}
            extendedState={{ userData }}
            renderAheadOffset={screenHeight}
            forceNonDeterministicRendering
            scrollViewProps={{
              removeClippedSubviews: true,
              refreshControl: (
                <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
              ),
              // decelerationRate: 0.9,
            }}

            // ListHeaderComponent={renderHeaderComponent}
          />
        ) : null}
      </View>
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
  },
});
export default ProfileScreen;
