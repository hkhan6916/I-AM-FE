import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import VideoPlayer from "../VideoPlayer";
import themeStyle from "../../theme.style";
// import apiCall from "../helpers/apiCall";
import RepostCard from "../RepostCard";
// import AdCard from "./AdCard";
import CardImage from "../CardImage";
import PostAuthor from "./PostAuthor";
import Actions from "./Actions";

const PostCard = ({
  post,
  isPreview = false,
  isVisible,
  isNearlyVisible,
  setShowPostOptions,
  // adsManager,
  screenWidth,
  screenHeight,
  // liked,
  handleReaction,
  handleNavigation,
  disableVideo,
  setUnMuteVideos,
}) => {
  const [bodyCollapsed, setBodyCollapsed] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const navigation = useNavigation();

  const onTextLayout = (e) => {
    setIsCollapsible(e.nativeEvent.lines.length >= 3);
  };
  const isUploading = post.ready === false;
  const isCancelled = post.cancelled;
  const failed = post.failed;
  return (
    <View style={{ flex: 1, width: screenWidth, maxWidth: 900 }}>
      {/* {console.log(isVisible)}
      <Text style={{ color: "white" }}>{post._id}</Text> */}
      <View style={[styles.container, isPreview && styles.preview]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {post.postAuthor ? <PostAuthor author={post.postAuthor} /> : null}
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              width: 48,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowPostOptions(post)}
          >
            <Entypo
              name="dots-three-vertical"
              size={16}
              color={themeStyle.colors.grayscale.lowest}
            />
          </TouchableOpacity>
        </View>
        {post.repostPostId ? (
          <View>
            <RepostCard
              postContent={post.repostPostObj}
              isPreview={isPreview}
            />
            {post.body ? (
              <View
                style={{
                  padding: 5,
                  marginHorizontal: 10,
                }}
              >
                <Text
                  onTextLayout={onTextLayout}
                  numberOfLines={!bodyCollapsed ? 3 : null}
                  style={{
                    textAlign: "left",
                    color: themeStyle.colors.grayscale.lowest,
                  }}
                >
                  {post.body}
                </Text>
                {isCollapsible ? (
                  <TouchableOpacity
                    onPress={() => {
                      setBodyCollapsed(!bodyCollapsed);
                    }}
                  >
                    <Text
                      style={{
                        color: themeStyle.colors.slateGray,
                        marginBottom: 10,
                        marginTop: 5,
                      }}
                    >
                      {!bodyCollapsed ? "Read more" : "Show less"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            <TouchableOpacity
              onPress={() => handleNavigation(post)}
              underlayColor={themeStyle.colors.grayscale.high}
              delayPressIn={150}
              disabled={
                !!(
                  post.private ||
                  post.cancelled ||
                  post.failed ||
                  post.ready === false
                )
              }
            >
              <View>
                {isCancelled || failed ? (
                  <Text
                    style={{
                      fontSize: 16,
                      color: themeStyle.colors.error.default,
                      zIndex: 1,
                      textAlign: "right",
                      marginHorizontal: 10,
                      marginVertical: 5,
                      alignSelf: "flex-end",
                      fontWeight: "700",
                    }}
                  >
                    {isCancelled ? "Upload Cancelled" : "Upload Failed"}
                  </Text>
                ) : isUploading ? (
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginRight: 10,
                      alignSelf: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: themeStyle.colors.grayscale.lowest,
                        zIndex: 1,
                        textAlign: "right",
                        marginHorizontal: 5,
                        marginVertical: 5,
                        textShadowColor: themeStyle.colors.black,
                        fontWeight: "700",
                      }}
                    >
                      Uploading
                    </Text>
                    <ActivityIndicator
                      size="small"
                      color={themeStyle.colors.primary.default}
                    />
                  </View>
                ) : null}
                {post.gif ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VideoPlayer
                      disableVideo={disableVideo || Platform.OS === "web"}
                      shouldPlay={isVisible}
                      shouldLoad={isNearlyVisible}
                      mediaIsSelfie={post.mediaIsSelfie}
                      url={post.gif}
                      thumbnailUrl={post.gifPreview}
                      thumbnailHeaders={post.thumbnailHeaders}
                      isUploading={post.ready === false}
                      isCancelled={post.cancelled}
                      failed={post.failed}
                      screenHeight={screenHeight}
                      screenWidth={screenWidth}
                      height={post.height}
                      width={post.width}
                      unMute={!!post.unMute}
                      setUnMuteVideos={setUnMuteVideos}
                      hideIcons
                      mute
                    />
                    {disableVideo ? (
                      // Disable video also prevents gifs from playing in postcard.
                      <View
                        style={{
                          position: "absolute",
                          backgroundColor:
                            themeStyle.colors.grayscale.transparentHighest50,
                          height: 70,
                          width: 70,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 35,
                        }}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.grayscale.lowest,
                            fontWeight: "700",
                            fontSize: 20,
                          }}
                        >
                          GIF
                        </Text>
                      </View>
                    ) : null}
                    <View
                      style={{
                        position: "absolute",
                        zIndex: 1,
                        bottom: 0,
                        right: 0,
                      }}
                    >
                      <Image
                        resizeMode={"contain"}
                        style={{
                          width: 70,
                          height: 20,
                        }}
                        source={require("../../../assets/via_tenor_logo_blue.png")}
                      />
                    </View>
                  </View>
                ) : post.mediaType === "video" ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <VideoPlayer
                      disableVideo={disableVideo || Platform.OS === "web"}
                      shouldPlay={isVisible}
                      shouldLoad={isNearlyVisible}
                      mediaIsSelfie={post.mediaIsSelfie}
                      url={post.mediaUrl}
                      thumbnailUrl={post.thumbnailUrl}
                      thumbnailHeaders={post.thumbnailHeaders}
                      isUploading={post.ready === false}
                      isCancelled={post.cancelled}
                      failed={post.failed}
                      screenHeight={screenHeight}
                      screenWidth={screenWidth}
                      height={post.height}
                      width={post.width}
                      unMute={!!post.unMute}
                      setUnMuteVideos={setUnMuteVideos}
                    />
                  </View>
                ) : post.mediaType === "image" || post.generatedImageUrl ? (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CardImage
                      mediaHeaders={post.mediaHeaders}
                      mediaUrl={post.mediaUrl || post.generatedImageUrl}
                      screenWidth={screenWidth}
                      screenHeight={screenHeight}
                      height={post.height}
                      width={post.width}
                    />
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
            {post.body ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 20,
                }}
              >
                <Text
                  onTextLayout={onTextLayout}
                  numberOfLines={!bodyCollapsed ? 3 : null}
                  style={{
                    textAlign: "left",
                    color: themeStyle.colors.grayscale.lowest,
                  }}
                >
                  {post.body}
                </Text>
                {isCollapsible ? (
                  <TouchableOpacity
                    onPress={() => {
                      setBodyCollapsed(!bodyCollapsed);
                    }}
                  >
                    <Text
                      style={{
                        color: themeStyle.colors.slateGray,
                        marginBottom: 10,
                        marginTop: 5,
                      }}
                    >
                      {!bodyCollapsed ? "Read more" : "Show less"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
        <Actions
          navigation={navigation}
          post={post}
          handleReaction={handleReaction}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderColor: themeStyle.colors.grayscale.low,
    borderBottomColor: themeStyle.colors.grayscale.cardsOuter,
    borderBottomWidth: 4,
    backgroundColor: themeStyle.colors.grayscale.cards,
  },
  preview: {
    margin: 20,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderRadius: 10,
  },
});

export default React.memo(
  PostCard,
  (prevProps, nextProps) =>
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.isNearlyVisible === nextProps.isNearlyVisible &&
    prevProps.post === nextProps.post &&
    prevProps.deleted === nextProps.deleted
);
